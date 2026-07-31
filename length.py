import csv
import time
import random
import warnings
from ddgs import DDGS
import ollama

CSV_FILE = "Peak Fiction - Sheet1.csv"
MODEL_NAME = "qwen3.5:9b" # Or qwen2.5, mistral, etc.

def generate_search_queries(universe: str, mediums: str) -> list[str]:
    """Asks the local LLM to generate precise search queries for each medium."""
    system_prompt = (
        "You are a search query generator. Your task is to generate precise DuckDuckGo keyword search queries "
        "to find the total length (number of chapters, episodes, books, etc.) for a given fictional universe in specific mediums.\n"
        "Rules:\n"
        "1. If calculating the length is unreasonable (e.g. massive franchises like 'Marvel', 'DCU', 'Sherlock Holmes' with countless adaptations), output exactly 'SKIP' and nothing else.\n"
        "2. Generate exactly ONE query per medium.\n"
        "3. Output the queries separated by a newline character. Do not include bullet points, numbering, or any other text.\n"
        "4. CRITICAL: Do NOT write natural language questions (like 'How many...'). Instead, use strict keywords and append 'wiki' or 'fandom'.\n"
        "Example Output:\n\"Invincible\" show total episodes wiki\n\"Invincible\" comic total chapters wiki"
    )
    
    user_prompt = f"Fictional Universe: {universe}\nMediums: {mediums}"
    
    try:
        response = ollama.chat(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
        )
        content = response['message']['content'].strip()
        if content == "SKIP":
            return ["SKIP"]
        
        # Clean up in case the model added bullets or numbers despite instructions
        queries = []
        for line in content.split('\n'):
            cleaned = line.lstrip('1234567890.-* ').strip()
            if cleaned:
                queries.append(cleaned)
        return queries
    except Exception as e:
        print(f"Ollama error (query generation): {e}")
        return []

def get_web_context(query: str, max_results: int = 3, max_retries: int = 3) -> str:
    """Fetches text snippets from DuckDuckGo with exponential backoff."""
    base_wait = 10
    
    for attempt in range(max_retries):
        results_text = []
        try:
            with DDGS() as ddgs:
                results = list(ddgs.text(query, max_results=max_results))
                
                # DuckDuckGo often returns empty lists instead of throwing an error when rate limiting
                if not results:
                    raise Exception("RateLimited: Empty results returned, likely rate limited.")
                    
                for r in results:
                    results_text.append(f"Snippet: {r['body']}")
            return "\n".join(results_text)
        except Exception as e:
            if "RateLimited" in str(e) or "ratelimit" in str(e).lower():
                wait_time = base_wait * (2 ** attempt) + random.uniform(1, 5)
                print(f"  Rate limited by DuckDuckGo on query '{query}'. Retrying in {wait_time:.1f} seconds... (Attempt {attempt + 1}/{max_retries})")
                time.sleep(wait_time)
            else:
                print(f"  Search failed for query '{query}': {e}")
                break
            
    return ""

def generate_rag_response(universe: str, mediums: str, context: str) -> str:
    """Sends retrieved web context and prompt to local Ollama instance."""
    system_prompt = (
        "You are an information extraction assistant. Your task is to find the length (number of chapters, episodes, books, etc.) "
        "of a given fictional universe for specific mediums based ONLY on the provided web context.\n"
        "Rules:\n"
        "1. Format the output as a comma-separated list of lengths for each medium requested, like this: '551 Novel chapters (ongoing), 308 Manhwa chapters'.\n"
        "2. Only use the provided context. If the context doesn't contain the answer for a medium, say 'Unknown [Medium] length'.\n"
        "3. Add '(ongoing)' if the context implies it is currently releasing."
    )
    
    # Truncate context to roughly ~6000 words to guarantee it fits safely under 8192 tokens
    safe_context = context[:30000] 
    
    user_prompt = f"Context:\n{safe_context}\n\nFictional Universe: {universe}\nMediums: {mediums}\n\nExtract the lengths."
    
    try:
        response = ollama.chat(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            options={
                "num_ctx": 8192, 
                "temperature": 0.1
            }
        )
        return response['message']['content'].strip()
    except Exception as e:
        print(f"Ollama error: {e}")
        return "ERROR"

def process_csv():
    # Read all rows
    with open(CSV_FILE, mode='r', encoding='utf-8') as f:
        reader = csv.reader(f)
        rows = list(reader)

    if not rows:
        print("CSV is empty.")
        return

    header = rows[0]
    
    # Process data rows
    for i in range(24, len(rows)):
        row = rows[i]
        # Pad row if it has fewer columns than the header
        while len(row) < len(header):
            row.append("")
            
        universe = row[0].strip()
        mediums_str = row[1].strip()
        
        # We don't skip based on existing_length anymore so it can overwrite
        existing_length = row[3].strip() if len(row) > 3 else ""

        # Skip only if the universe name is empty
        if not universe:
            continue

        print(f"\nProcessing Row {i + 1}: {universe} ({mediums_str})")
        
        mediums_list = [m.strip() for m in mediums_str.split(',') if m.strip()]
        final_answers = []
        skip_row = False
        
        for medium in mediums_list:
            print(f"  --- Processing Medium: {medium} ---")
            
            # 1. AI -> Generate Query for this specific medium
            queries = generate_search_queries(universe, medium)
            if not queries:
                print("  Result: ERROR generating queries")
                final_answers.append(f"ERROR for {medium}")
                continue
            elif queries == ["SKIP"]:
                print("  Result: SKIP")
                skip_row = True
                break
                
            query = queries[0]
            print(f"    Searching: {query}")
            context = get_web_context(query, max_results=3)
            if context:
                print(f"    Context retrieved:\n{context}\n")
            else:
                print(f"    No context retrieved for '{query}'.\n")
                
            # 2. AI -> Generate RAG Response
            answer = generate_rag_response(universe, medium, context)
            
            # 3. Retry Logic if Unknown
            if "Unknown" in answer or not answer:
                print(f"    Result was '{answer}'. Retrying with a fallback query...")
                time.sleep(random.uniform(2, 4))
                fallback_query = f"\"{universe}\" {medium} total chapters episodes length wiki"
                print(f"    Searching: {fallback_query}")
                context = get_web_context(fallback_query, max_results=3)
                if context:
                    print(f"    Context retrieved:\n{context}\n")
                answer = generate_rag_response(universe, medium, context)
                
            print(f"  Final result for {medium}: {answer}")
            final_answers.append(answer)
            time.sleep(random.uniform(2, 4)) # delay between mediums
            
        if skip_row:
            row[3] = "SKIP"
        else:
            row[3] = ", ".join(final_answers)
            
        # Save incrementally
        with open(CSV_FILE, mode='w', encoding='utf-8', newline='') as f:
            writer = csv.writer(f)
            writer.writerows(rows)
            
        # Add a random jitter delay to respect the rate limit before the next row
        jitter_sleep = 5 + random.uniform(0, 3)
        print(f"Sleeping for {jitter_sleep:.1f} seconds to prevent IP ban...")
        time.sleep(jitter_sleep)

if __name__ == "__main__":
    process_csv()