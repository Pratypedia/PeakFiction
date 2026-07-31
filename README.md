# 🌌 Peak Fiction — Fictional Universes & Rankings Hub

A modern, interactive web application showcasing rankings, reviews, favorite characters, and granular scores across all fictional universes — Anime, Manga, Manhwa, Novels, Books, Movies, TV Shows, and Comics — curated side-by-side by **Pratyush** and **Kanav**.

---

## 📊 Dataset Structure (`Peak Fiction - Sheet1.csv`)

The site is powered directly by your CSV file (`Peak Fiction - Sheet1.csv`), containing **94 fictional universes**.

### CSV Columns Schema

| Column | Description | Sample Values |
| :--- | :--- | :--- |
| `Name` | Title of the story or universe | *Omniscient Reader's Viewpoint*, *Arcane*, *Mistborn*, *Cowboy Bebop* |
| `Medium` | Comma-separated media formats | `anime`, `Manga`, `Manhwa`, `Novel`, `Book`, `movie`, `show`, `comic` |
| `Genre` | Comma-separated genres | `Action`, `Dark Fantasy`, `Sci-Fi`, `Isekai`, `LitRPG`, `Romance` |
| `Length` | Optional volume / episode count | *N/A* |
| `Score/10` | **Granular score out of 10** | `10`, `9.8`, `8.95`, `7.5` |
| `Ranking - Pratyush` | Pratyush's tier ranking | `Peak`, `S`, `A`, `B`, `-` |
| `Comments - Pratyush` | Pratyush's review & notes | *"Peak world-building..."* |
| `Ranking - Kanav` | Kanav's tier ranking | `Peak`, `S`, `A`, `B`, `-` |
| `Comments - Kanav` | Kanav's review & notes | *"Awesome action..."* |
| `Favorite Character(s)` | Favorite characters from the story | *Gojo Satoru, Levi, Sung Jin-Woo* |

---

## 🏆 Ranking Tiers & Granular Score Logic

| Tier Badge | Score Range (`Score/10`) | Meaning & Description |
| :--- | :--- | :--- |
| 🔥 **Peak** | **9.0 – 10.0** | *"I love this story, I will talk about it for hours and pitch it to you."* |
| ⚡ **S Tier** | **7.5 – 8.95** | *"Exceptional story."* Outstanding execution and storytelling. |
| ✨ **A Tier** | **5.0 – 7.49** | *"Really fun story, minor issues but they don't distract, not truly mindblowing."* |
| 👍 **B Tier** | **0.0 – 4.99** | *"Kinda enjoyed it, but obvious need for improvement at parts."* |
| ⏳ **Pending (`-`)** | *Unrated* | Story is queued to be rated by Pratyush or Kanav. |

---

## 👥 Dual-User Features

- **Side-by-Side Brother View**: Display Pratyush and Kanav ratings, comments, and avatar badges on every card.
- **View Mode Filters**:
  - `Dual View`: Combined brother card showcase.
  - `Pratyush View` / `Kanav View`: Focus on individual ratings.
  - `Peak Showcase`: Stories rated *Peak* by either brother.
  - `Debates`: Highlight stories where ratings differ.
- **Live Browser Editor & Exporter**: Edit ratings, scores, or comments in real-time, then export back to CSV (`Peak_Fiction_Updated.csv`).

---

## 🚀 Development & Workflow

### 1. Run Parser
Whenever you update `Peak Fiction - Sheet1.csv`, parse it into `src/data/stories.json`:
```bash
npm run parse-csv
```

### 2. Start Dev Server
Launch the local interactive application:
```bash
npm run dev
```

### 3. Build Production Bundle
Build for deployment:
```bash
npm run build
```

---

## 🛠️ Technology Stack

- **Framework**: React 18 + Vite
- **Icons**: Lucide React
- **Styling**: Modern Dark Theme with Glassmorphism, HSL Variables & Glowing Tier Badges
- **Data Engine**: Automated CSV Ingestion Pipeline (`scripts/parse_csv.js`)
