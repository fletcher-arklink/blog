import type { CollectionEntry } from 'astro:content';

export type BlogPost = CollectionEntry<'blog'>;

export function byNewest(a: BlogPost, b: BlogPost) {
  return b.data.date.valueOf() - a.data.date.valueOf();
}

export function readingTime(body: string | undefined) {
  const words = (body ?? '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<[^>]+>/g, '')
    .match(/[\p{L}\p{N}’'-]+/gu)?.length ?? 0;

  return `${Math.max(1, Math.ceil(words / 220))} min read`;
}
