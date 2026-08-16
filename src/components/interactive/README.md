# Interactive components

Keep reusable React experiments in this directory. Each component should own its behavior and
component-specific styles, remain responsive inside the article column, and expose keyboard as
well as pointer controls.

To embed one in an MDX post:

```mdx
import MyExperiment from '../../components/interactive/MyExperiment';

<MyExperiment client:visible />
```

`client:visible` hydrates the island shortly before it enters the viewport. Use `client:load` when
the interaction is a primary article figure that should be ready immediately, or `client:idle` for
non-urgent components that should initialize after the page settles. The included Bézier example
uses `client:load` so its controls are available as soon as the article renders.
