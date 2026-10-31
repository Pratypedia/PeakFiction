// Likes & comments backed by Supabase. Every call degrades quietly when the
// database isn't configured or can't be reached, so the rest of the site keeps working.
import { supabase } from './supabaseClient';

const PAGE_SIZE = 1000; // PostgREST's default max rows per request
export const COMMENT_MAX_LENGTH = 1000;
export const NAME_MAX_LENGTH = 60;

async function selectAllStoryNames(table) {
  const names = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from(table)
      .select('story_name')
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    names.push(...data.map(row => row.story_name));
    if (data.length < PAGE_SIZE) return names;
  }
}

/** Aggregate like/comment counts per story: { available, counts: { [storyName]: { likes, comments } } } */
export async function fetchSocialCounts() {
  if (!supabase) return { available: false, counts: {} };
  try {
    const [likes, comments] = await Promise.all([
      selectAllStoryNames('likes'),
      selectAllStoryNames('comments'),
    ]);
    const counts = {};
    const bump = (name, field) => {
      counts[name] ??= { likes: 0, comments: 0 };
      counts[name][field]++;
    };
    likes.forEach(n => bump(n, 'likes'));
    comments.forEach(n => bump(n, 'comments'));
    return { available: true, counts };
  } catch (error) {
    console.warn('Likes & comments unavailable:', error?.message || error);
    return { available: false, counts: {} };
  }
}

export async function fetchStorySocial(storyName) {
  const [{ count, error: likesError }, { data: comments, error: commentsError }] = await Promise.all([
    supabase.from('likes').select('*', { count: 'exact', head: true }).eq('story_name', storyName),
    supabase.from('comments').select('*').eq('story_name', storyName).order('created_at', { ascending: false }),
  ]);
  if (likesError || commentsError) throw likesError || commentsError;
  return { likes: count || 0, comments: comments || [] };
}

export async function addLike(storyName) {
  const { error } = await supabase.from('likes').insert([{ story_name: storyName }]);
  if (error) throw error;
}

export async function addComment({ storyName, authorName, content, stance }) {
  const { data, error } = await supabase
    .from('comments')
    .insert([{
      story_name: storyName,
      author_name: authorName.trim().slice(0, NAME_MAX_LENGTH) || 'Anonymous',
      content: content.trim().slice(0, COMMENT_MAX_LENGTH),
      ranking_stance: stance,
    }])
    .select();
  if (error) throw error;
  return data[0];
}
