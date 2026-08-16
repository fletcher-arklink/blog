# Fletcher — an interactive essay starter

A small, typography-first personal blog built with Astro, MDX, React, and TypeScript. Articles are
rendered as static HTML. React is shipped only for explicitly hydrated interactive components.

## Run locally

Requires Node.js 22 or newer.

```bash
pnpm install
pnpm dev
```

Useful scripts:

- `pnpm dev` starts the local development server.
- `pnpm build` type-checks and builds the static site into `dist/`.
- `pnpm preview` serves the production build locally.

Before publishing, replace the name, title, description, and email in `src/lib/site.ts`.

## Write a post

Create `src/content/blog/my-post.mdx`:

```mdx
---
title: "My Post"
description: "A concise summary for listings and search results."
date: 2026-08-16
updated: 2026-08-20 # optional
tags: [design, software]
draft: false
---

# My Post

Write normal Markdown here.
```

The file name becomes the URL: `my-post.mdx` is published at `/blog/my-post/`. Drafts are omitted
from pages and RSS. The article layout renders the frontmatter title as its heading; a matching
top-level Markdown heading is optional and is suppressed to avoid showing the title twice.

## Add an interactive component

Create a React component in `src/components/interactive/`, then import it near the top of the MDX
body and hydrate only that component:

```mdx
import MyExperiment from '../../components/interactive/MyExperiment';

The explanation begins as ordinary Markdown.

<MyExperiment client:visible />
```

`client:visible` is a good default: Astro sends the component's JavaScript only on articles that
use it and activates it near the viewport. Use `client:load` for a primary figure that must be
interactive immediately. The included `BezierPlayground.tsx` demonstrates local
state, pointer dragging, touch behavior, keyboard controls, responsive SVG, and styles that use the
site's design tokens.

New experiments should accept useful props, avoid global CSS, fit narrow screens, and provide a
keyboard path for every pointer interaction. Keep generic article styling in
`src/styles/global.css`; keep experiment styling with the component.

## Deploy to GitHub Pages

1. Push the repository to GitHub with `main` as its default branch.
2. In **Settings → Pages → Build and deployment**, choose **GitHub Actions**.
3. Push to `main`, or run the **Deploy to GitHub Pages** workflow manually.

The workflow calculates Astro's `site` and `base` at build time:

- **User site** (`username.github.io` repository): no variables are needed. The base path is `/`.
- **Project site** (for example a `my-blog` repository): no variables are needed. The base path is
  automatically `/my-blog` and the public URL is `https://username.github.io/my-blog/`.
- **Custom domain**: add a repository Actions variable named `SITE_URL` containing the full origin,
  such as `https://example.com`, and a variable named `BASE_PATH` containing `/`. Add the domain in
  GitHub Pages settings. If GitHub asks for it, create `public/CNAME` containing only the domain.

For an unusual custom setup hosted below a path, set both variables to the exact origin and path.
Local builds default to `https://username.github.io` and `/`; you can test another configuration
with environment variables:

```bash
SITE_URL=https://username.github.io BASE_PATH=/my-blog pnpm build
```

## Project map

```text
src/content/blog/                 MDX posts
src/components/interactive/       React experiments
src/layouts/                       Site and article layouts
src/pages/                         Routes, RSS, and 404
src/styles/global.css              Typography and Markdown styles
src/content.config.ts              Frontmatter schema
.github/workflows/deploy.yml       GitHub Pages deployment
```

Astro generates the sitemap during the build. SEO, Open Graph, Twitter card, canonical, and RSS
metadata are defined in the layouts and `src/pages/rss.xml.ts`.
