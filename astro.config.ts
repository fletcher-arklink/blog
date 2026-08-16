import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

const site = process.env.SITE_URL ?? 'https://username.github.io';
const configuredBase = process.env.BASE_PATH ?? '/';
const base = configuredBase === '/' ? '/' : `/${configuredBase.replace(/^\/+|\/+$/g, '')}`;

export default defineConfig({
  site,
  base,
  output: 'static',
  integrations: [mdx(), react(), sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'github-light-default',
      wrap: true,
    },
  },
});
