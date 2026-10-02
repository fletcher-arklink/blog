# Blog

Source for [fletcherdavis.com](https://fletcherdavis.com), a collection of notes on security, engineering, design, and research.

Built with Astro, MDX, React, and TypeScript. Articles are rendered as static HTML, with React used only for interactive components.

## Development

Requires Node.js 22 and pnpm.

```bash
pnpm install
pnpm dev
```

Run `pnpm build` to type-check and create a production build. Pushes to `main` deploy to GitHub Pages.

## Post notes

Import `PostNotes` near the top of an MDX post, after its frontmatter:

```mdx
import PostNotes from '../../components/PostNotes.astro';
```

Place it after the final paragraph. Blank lines inside the component let you use
Markdown for acknowledgments, links, lists, and other notes:

```mdx
<PostNotes>

Thanks to [Name](https://example.com) for reading an early draft.

Further reading:
- [Resource title](https://example.com) — why it is relevant.

</PostNotes>
```

Notes use small, muted text without a divider or visible heading by default.
Use `title="Further reading"` to add an optional small heading. The section appears above the article footer and stays out
of the Sections sidebar.
