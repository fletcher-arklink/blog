import { useEffect, useId, useState } from 'react';

type View = 'known' | 'possible' | 'tested';

const nodes = {
  start: { label: 'Current', x: 62, y: 140 },
  a: { label: 'A', x: 205, y: 92 },
  b: { label: 'B', x: 365, y: 92 },
  goal: { label: 'Goal', x: 508, y: 140 },
  c: { label: 'C', x: 205, y: 214 },
  d: { label: 'D', x: 365, y: 214 },
} as const;

const knownEdges = [
  ['start', 'a'],
  ['a', 'b'],
  ['b', 'goal'],
] as const;

const discoveredEdges = [
  ['start', 'c'],
  ['c', 'd'],
  ['d', 'goal'],
] as const;

const otherPossibilities = [
  ['a', 'd'],
  ['c', 'b'],
] as const;

const testedRoute = ['start', 'c', 'd', 'goal'] as const;

const observations: Record<View, string> = {
  known: 'This is the current model: four known states and one documented path.',
  possible: 'Questioning the model identifies two possible states. Dashed paths are hypotheses, not facts.',
  tested: 'Testing confirms one new route. The possible states become known, while other connections remain unresolved.',
};

export default function StateSpaceExplorer() {
  const [view, setView] = useState<View>('known');
  const [routeStep, setRouteStep] = useState(0);
  const id = useId();

  useEffect(() => {
    if (view !== 'tested') {
      setRouteStep(0);
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRouteStep(testedRoute.length - 1);
      return;
    }

    setRouteStep(0);
    const timers = testedRoute.slice(1).map((_, index) =>
      window.setTimeout(() => setRouteStep(index + 1), (index + 1) * 500),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [view]);

  const tested = view === 'tested';
  const position = nodes[testedRoute[routeStep]];

  function lineBetween(from: keyof typeof nodes, to: keyof typeof nodes, className: string) {
    const start = nodes[from];
    const end = nodes[to];
    const distance = Math.hypot(end.x - start.x, end.y - start.y);
    const dx = (end.x - start.x) / distance;
    const dy = (end.y - start.y) / distance;

    return (
      <line
        key={`${from}-${to}`}
        className={className}
        x1={start.x + dx * 25}
        y1={start.y + dy * 25}
        x2={end.x - dx * 28}
        y2={end.y - dy * 28}
        markerEnd={`url(#${id}-arrow)`}
      />
    );
  }

  return (
    <figure className="state-space" data-view={view}>
      <svg viewBox="0 0 570 292" role="img" aria-labelledby={`${id}-title ${id}-description`}>
        <title id={`${id}-title`}>A changing model of a system's states</title>
        <desc id={`${id}-description`}>
          {observations[view]}
        </desc>
        <defs>
          <marker id={`${id}-arrow`} viewBox="0 0 6 6" refX="5" refY="3" markerWidth="6" markerHeight="6" orient="auto" markerUnits="userSpaceOnUse">
            <path d="M 1 1 L 5 3 L 1 5" fill="none" stroke="currentColor" strokeWidth="1" />
          </marker>
        </defs>

        <g className="state-space__boundary" aria-hidden="true">
          <rect x="14" y="20" width="542" height="250" rx="8" />
          <text x="27" y="42">System boundary</text>
        </g>

        <text className="state-space__route-label" x="285" y="54" textAnchor="middle">Known path</text>
        <text className="state-space__route-label state-space__route-label--possible" x="285" y="262" textAnchor="middle">
          {tested ? 'Tested path' : 'Possible path'}
        </text>

        {knownEdges.map(([from, to]) => lineBetween(from, to, 'state-space__edge state-space__edge--known'))}

        <g className="state-space__possibilities">
          {discoveredEdges.map(([from, to]) => lineBetween(
            from,
            to,
            `state-space__edge ${tested ? 'state-space__edge--confirmed' : 'state-space__edge--possible'}`,
          ))}
          {otherPossibilities.map(([from, to]) => lineBetween(from, to, 'state-space__edge state-space__edge--possible state-space__edge--unresolved'))}
        </g>

        {(Object.keys(nodes) as Array<keyof typeof nodes>).map((key) => {
          const node = nodes[key];
          const isDiscovered = key === 'c' || key === 'd';
          const className = [
            'state-space__node',
            isDiscovered ? 'state-space__node--discovered' : 'state-space__node--known',
            isDiscovered && tested ? 'is-confirmed' : '',
          ].filter(Boolean).join(' ');

          return (
            <g key={key} className={className} transform={`translate(${node.x} ${node.y})`}>
              <circle r="23" />
              <text textAnchor="middle" dy="0.35em">{node.label}</text>
            </g>
          );
        })}

        <g
          className="state-space__position"
          style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
          aria-hidden="true"
        >
          <circle r="30" />
          <text textAnchor="middle" y="-35">You are here</text>
        </g>
      </svg>

      <div className="state-space__controls" role="group" aria-label="Explore the system model">
        <button type="button" aria-pressed={view === 'known'} onClick={() => setView('known')}>
          <span>01</span> Current model
        </button>
        <button type="button" aria-pressed={view === 'possible'} onClick={() => setView('possible')}>
          <span>02</span> Identify possibilities
        </button>
        <button type="button" aria-pressed={view === 'tested'} onClick={() => setView('tested')}>
          <span>03</span> Test a path
        </button>
      </div>

      <p className="state-space__observation" aria-live="polite" aria-atomic="true">
        {observations[view]}
      </p>

      <figcaption>
        Exploration changes both your position in the system and your model of what it can do.
      </figcaption>

      <style>{`
        .state-space {
          --state-ink: var(--ink, #111);
          --state-secondary: var(--secondary, #6b7280);
          --state-faint: var(--faint, #e5e7eb);
          margin-block: 2rem;
          padding-block: .75rem;
          color: var(--state-ink);
          font-family: var(--sans, ui-sans-serif, system-ui, sans-serif);
        }
        .prose .state-space { margin-inline: clamp(-1rem, -7vw, -4rem); }
        .state-space svg {
          display: block;
          width: 100%;
          height: auto;
          margin-top: .25rem;
          overflow: visible;
        }
        .state-space__boundary rect {
          fill: none;
          stroke: currentColor;
          stroke-width: 1;
          vector-effect: non-scaling-stroke;
          opacity: .22;
        }
        .state-space__boundary text,
        .state-space__route-label,
        .state-space__position text {
          fill: currentColor;
          font-size: 10px;
          font-weight: 500;
        }
        .state-space__boundary text { opacity: .45; }
        .state-space__route-label { opacity: .45; }
        .state-space__route-label--possible {
          opacity: 0;
          transition: opacity 220ms ease;
        }
        .state-space[data-view='possible'] .state-space__route-label--possible,
        .state-space[data-view='tested'] .state-space__route-label--possible { opacity: .55; }
        .state-space__edge {
          fill: none;
          stroke: currentColor;
          stroke-width: 1;
          vector-effect: non-scaling-stroke;
          transition: opacity 250ms ease, stroke-dasharray 250ms ease;
        }
        .state-space__edge--known { opacity: .7; }
        .state-space[data-view='tested'] .state-space__edge--known { opacity: .22; }
        .state-space__possibilities { opacity: 0; transition: opacity 250ms ease; }
        .state-space[data-view='possible'] .state-space__possibilities,
        .state-space[data-view='tested'] .state-space__possibilities { opacity: 1; }
        .state-space__edge--possible { stroke-dasharray: 4 4; opacity: .48; }
        .state-space__edge--confirmed { stroke-width: 1.5; opacity: .9; }
        .state-space[data-view='tested'] .state-space__edge--unresolved { opacity: .2; }
        .state-space__node circle {
          fill: var(--paper, #fff);
          stroke: currentColor;
          stroke-width: 1;
          vector-effect: non-scaling-stroke;
        }
        .state-space__node text {
          fill: currentColor;
          font-size: 11px;
          font-weight: 500;
        }
        .state-space__node--known { opacity: .78; }
        .state-space__node--discovered {
          opacity: 0;
          transition: opacity 250ms ease;
        }
        .state-space[data-view='possible'] .state-space__node--discovered,
        .state-space[data-view='tested'] .state-space__node--discovered { opacity: .6; }
        .state-space__node--discovered circle { stroke-dasharray: 3 3; }
        .state-space__node--discovered.is-confirmed { opacity: 1; }
        .state-space__node--discovered.is-confirmed circle { stroke-dasharray: none; }
        .state-space__position {
          color: var(--state-ink);
          pointer-events: none;
          transition: transform 450ms ease;
        }
        .state-space__position circle {
          fill: none;
          stroke: currentColor;
          stroke-width: 1.25;
          vector-effect: non-scaling-stroke;
        }
        .state-space__controls {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: .5rem;
          padding-inline: 1rem;
        }
        .state-space__controls button {
          min-height: 2.75rem;
          padding: .5rem .625rem;
          border: 1px solid var(--state-faint);
          border-radius: .4rem;
          background: transparent;
          color: var(--state-secondary);
          font: 500 .75rem/1.1rem inherit;
          text-align: left;
          cursor: pointer;
          transition: border-color 150ms ease, color 150ms ease;
        }
        .state-space__controls button span {
          margin-right: .3rem;
          color: var(--state-secondary);
          font-size: .625rem;
        }
        .state-space__controls button:hover { border-color: #b8b8b4; color: var(--state-ink); }
        .state-space__controls button[aria-pressed='true'] {
          border-color: var(--state-ink);
          color: var(--state-ink);
        }
        .state-space__observation {
          min-height: 2.5rem;
          margin: .75rem 1rem 0;
          color: var(--state-secondary);
          font-size: .75rem;
          line-height: 1.15rem;
          text-align: center;
        }
        .state-space figcaption { margin-top: .5rem; }
        @media (max-width: 540px) {
          .prose .state-space { margin-inline: -.5rem; }
          .state-space__controls { padding-inline: .5rem; }
          .state-space__controls { grid-template-columns: 1fr; }
          .state-space__controls button { min-height: 2.5rem; }
          .state-space__observation { margin-inline: .5rem; }
          .state-space__node text { font-size: 15px; }
          .state-space__boundary text,
          .state-space__route-label,
          .state-space__position text { font-size: 14px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .state-space__edge,
          .state-space__possibilities,
          .state-space__node--discovered,
          .state-space__position,
          .state-space__route-label--possible { transition: none; }
        }
      `}</style>
    </figure>
  );
}
