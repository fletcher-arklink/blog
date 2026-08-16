import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { byNewest } from '../lib/posts';
import { SITE, withBase } from '../lib/site';

export async function GET(context: { site?: URL }) {
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(byNewest);
  const origin = context.site ?? new URL('https://username.github.io');

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: new URL(withBase(), origin),
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: withBase(`blog/${post.id}/`),
    })),
  });
}
