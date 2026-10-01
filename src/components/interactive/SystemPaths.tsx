import { useEffect, useId, useState } from 'react';

const nodes = [
  { label: 'Start', x: 48, y: 140, main: true },
  { label: 'A', x: 200, y: 140, main: true },
  { label: 'B', x: 360, y: 140, main: true },
  { label: 'Goal', x: 512, y: 140, main: true },
  { label: 'C', x: 200, y: 220, main: false, routeStep: 1 },
  { label: 'D', x: 360, y: 220, main: false, routeStep: 2 },
];

const edges = [
  { from: 0, to: 1, type: 'intended' },
  { from: 1, to: 2, type: 'intended' },
  { from: 2, to: 3, type: 'intended' },
  { from: 0, to: 4, type: 'route', routeStep: 1 },
  { from: 4, to: 5, type: 'route', routeStep: 2 },
  { from: 5, to: 3, type: 'route', routeStep: 3 },
  { from: 1, to: 5, type: 'network' },
  { from: 4, to: 2, type: 'network' },
];

const hackerRoute = [nodes[0], nodes[4], nodes[5], nodes[3]];

export default function SystemPaths() {
  const [possible, setPossible] = useState(false);
  const [stage, setStage] = useState(0);
  const [run, setRun] = useState(0);
  const id = useId();

  useEffect(() => {
    if (!possible) {
      setStage(0);
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStage(4);
      return;
    }

    setStage(0);
    const timers = [1, 2, 3, 4].map((next) =>
      window.setTimeout(() => setStage(next), next * 600),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [possible, run]);

  function showIntended() {
    setPossible(false);
  }

  function showPossible() {
    setPossible(true);
    setRun((current) => current + 1);
  }

  const hackerPosition = hackerRoute[Math.min(stage, 3)];
  const caption = possible
    ? 'What the system actually allows.'
    : 'How the system was designed to be used.';

  return (
    <figure className="system-paths" data-view={possible ? 'possible' : 'intended'}>
      <div className="system-paths__switch" role="group" aria-label="System paths">
        <button type="button" aria-pressed={!possible} onClick={showIntended}>
          Intended
        </button>
        <button type="button" aria-pressed={possible} onClick={showPossible}>
          Possible
        </button>
      </div>

      <svg viewBox="0 0 560 300" role="img" aria-labelledby={`${id}-title ${id}-description`}>
        <title id={`${id}-title`}>{possible ? 'A possible path' : 'The intended path'}</title>
        <desc id={`${id}-description`}>
          {possible
            ? 'A hacker moves through the same system from Start to C to D to Goal. Additional relationships from A to D and C to B appear afterward.'
            : 'The intended route moves from Start to A to B to Goal. Other nodes and relationships in the same system are muted.'}
        </desc>
        <defs>
          <marker id={`${id}-arrow`} viewBox="0 0 6 6" refX="5" refY="3" markerWidth="6" markerHeight="6" orient="auto" markerUnits="userSpaceOnUse">
            <path d="M 1 1 L 5 3 L 1 5" fill="none" stroke="currentColor" strokeWidth="1" />
          </marker>
        </defs>

        <g className="system-paths__boundary" aria-hidden="true">
          <rect x="16" y="24" width="528" height="244" rx="8" />
          <text x="28" y="43">System boundary</text>
        </g>

        <text className="system-paths__path-label system-paths__path-label--intended" x="280" y="103" textAnchor="middle">
          Intended path
        </text>
        <text className={`system-paths__path-label system-paths__path-label--possible ${stage > 0 ? 'is-visible' : ''}`} x="280" y="260" textAnchor="middle">
          Another possible path
        </text>

        {edges.map(({ from, to, type, routeStep }) => {
          const start = nodes[from];
          const end = nodes[to];
          const distance = Math.hypot(end.x - start.x, end.y - start.y);
          const dx = (end.x - start.x) / distance;
          const dy = (end.y - start.y) / distance;
          const revealed = type === 'route'
            ? possible && stage >= (routeStep ?? 0)
            : type === 'network' && possible && stage >= 4;

          return (
            <line
              key={`${from}-${to}`}
              className={`system-paths__edge system-paths__edge--${type} ${revealed ? 'is-revealed' : ''}`}
              x1={start.x + dx * 27}
              y1={start.y + dy * 27}
              x2={end.x - dx * 29}
              y2={end.y - dy * 29}
              markerEnd={`url(#${id}-arrow)`}
            />
          );
        })}

        {nodes.map(({ label, x, y, main, routeStep }) => {
          const revealed = main || (possible && stage >= (routeStep ?? 0));
          return (
            <g
              key={label}
              className={`system-paths__node ${main ? 'system-paths__node--main' : 'system-paths__node--alternate'} ${revealed ? 'is-revealed' : ''}`}
              transform={`translate(${x} ${y})`}
            >
              <circle r="24" />
              <text textAnchor="middle" dy="0.35em">{label}</text>
            </g>
          );
        })}

        {possible && (
          <g
            className="system-paths__hacker"
            style={{ transform: `translate(${hackerPosition.x}px, ${hackerPosition.y}px)` }}
            aria-hidden="true"
          >
            <circle r="30" />
            <text textAnchor="middle" y="-34">Hacker</text>
          </g>
        )}
      </svg>

      <figcaption aria-live="polite" aria-atomic="true">{caption}</figcaption>

      <style>{`
        .system-paths {
          --paths-ink: #242424;
          margin: 2rem 0;
          padding: 1rem 0;
          color: var(--paths-ink);
          font-family: var(--sans, ui-sans-serif, system-ui, sans-serif);
        }
        .prose .system-paths { margin-inline: 0; }
        .system-paths__switch {
          display: flex;
          justify-content: center;
          gap: 1.25rem;
        }
        .system-paths__switch button {
          min-height: 44px;
          padding: .5rem .125rem;
          border: 0;
          border-bottom: 1px solid transparent;
          border-radius: 0;
          background: transparent;
          color: #737373;
          font-family: inherit;
          font-size: .8125rem;
          font-weight: 400;
          line-height: 1.25;
          cursor: pointer;
          transition: color 200ms ease, border-color 200ms ease;
        }
        .system-paths__switch button[aria-pressed='true'] {
          color: var(--paths-ink);
          border-bottom-color: currentColor;
        }
        .system-paths__switch button:hover { color: var(--paths-ink); }
        .system-paths__switch button:focus-visible {
          outline: 1px solid var(--paths-ink);
          outline-offset: 4px;
        }
        .system-paths svg {
          display: block;
          width: 100%;
          height: auto;
          margin: .75rem 0;
          overflow: visible;
        }
        .system-paths__boundary rect {
          fill: none;
          stroke: currentColor;
          stroke-width: 1;
          vector-effect: non-scaling-stroke;
          opacity: .3;
        }
        .system-paths__boundary text,
        .system-paths__path-label {
          fill: currentColor;
          font-size: 11px;
          font-weight: 400;
        }
        .system-paths__boundary text { opacity: .55; }
        .system-paths__path-label { opacity: .5; }
        .system-paths__path-label--possible {
          opacity: 0;
          transition: opacity 250ms ease;
        }
        .system-paths__path-label--possible.is-visible { opacity: .7; }
        .system-paths__edge {
          stroke: currentColor;
          stroke-width: 1;
          transition: opacity 250ms ease, stroke-width 250ms ease;
        }
        .system-paths__edge--intended { opacity: 1; }
        .system-paths[data-view='possible'] .system-paths__edge--intended { opacity: .25; }
        .system-paths__edge--route,
        .system-paths__edge--network { opacity: .08; }
        .system-paths__edge--route.is-revealed { opacity: 1; stroke-width: 1.5; }
        .system-paths__edge--network.is-revealed { opacity: .3; }
        .system-paths__node { transition: opacity 250ms ease; }
        .system-paths__node circle {
          fill: var(--paper, #fff);
          stroke: currentColor;
          stroke-width: 1;
        }
        .system-paths__node text {
          fill: currentColor;
          font-size: 13px;
          font-weight: 400;
        }
        .system-paths__node--alternate { opacity: .08; }
        .system-paths__node--alternate.is-revealed { opacity: 1; }
        .system-paths__hacker {
          color: var(--paths-ink);
          pointer-events: none;
          transition: transform 500ms ease;
        }
        .system-paths__hacker circle {
          fill: none;
          stroke: currentColor;
          stroke-width: 1.5;
          vector-effect: non-scaling-stroke;
        }
        .system-paths__hacker text {
          fill: currentColor;
          font-size: 11px;
          font-weight: 500;
        }
        .system-paths figcaption {
          margin: 0;
          padding: 0 .5rem;
          color: #666;
          font: 400 .8125rem/1.5 var(--sans, ui-sans-serif, system-ui, sans-serif);
          text-align: center;
        }
        @media (max-width: 480px) {
          .system-paths__node text { font-size: 18px; }
          .system-paths__boundary text,
          .system-paths__path-label,
          .system-paths__hacker text { font-size: 15px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .system-paths__edge,
          .system-paths__node,
          .system-paths__hacker,
          .system-paths__path-label--possible,
          .system-paths__switch button { transition: none; }
        }
      `}</style>
    </figure>
  );
}
