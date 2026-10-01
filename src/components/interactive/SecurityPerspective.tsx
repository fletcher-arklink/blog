import { useId, useState } from 'react';

type Perspective = 'behavior' | 'system';

const events = [
  { label: 'Sign in', x: 80 },
  { label: 'Read', x: 220 },
  { label: 'Request', x: 360 },
  { label: 'Change', x: 500 },
] as const;

const states = [
  { label: 'Outside', x: 64, y: 150 },
  { label: 'Account', x: 205, y: 96 },
  { label: 'Service', x: 365, y: 96 },
  { label: 'Control', x: 365, y: 210 },
  { label: 'Outcome', x: 510, y: 150 },
] as const;

const edges = [
  [0, 1],
  [1, 2],
  [2, 4],
  [1, 3],
  [3, 4],
] as const;

export default function SecurityPerspective() {
  const [perspective, setPerspective] = useState<Perspective>('behavior');
  const id = useId();
  const systemView = perspective === 'system';

  return (
    <figure className="security-perspective" data-perspective={perspective}>
      <div className="security-perspective__switch" role="group" aria-label="Security perspective">
        <button type="button" aria-pressed={!systemView} onClick={() => setPerspective('behavior')}>
          Behavior
        </button>
        <button type="button" aria-pressed={systemView} onClick={() => setPerspective('system')}>
          System
        </button>
      </div>

      <svg viewBox="0 0 570 275" role="img" aria-labelledby={`${id}-title ${id}-description`}>
        <title id={`${id}-title`}>{systemView ? 'Activity understood as system transitions' : 'Activity understood as a sequence of behaviors'}</title>
        <desc id={`${id}-description`}>
          {systemView
            ? 'The observed actions connect positions in a system, revealing two routes from outside to an outcome.'
            : 'Four observed actions appear in a timeline: sign in, read, request, and change.'}
        </desc>
        <defs>
          <marker id={`${id}-arrow`} viewBox="0 0 6 6" refX="5" refY="3" markerWidth="6" markerHeight="6" orient="auto" markerUnits="userSpaceOnUse">
            <path d="M 1 1 L 5 3 L 1 5" fill="none" stroke="currentColor" strokeWidth="1" />
          </marker>
        </defs>

        <g className="security-perspective__behaviors">
          <line className="security-perspective__timeline" x1="80" y1="138" x2="500" y2="138" />
          {events.map((event, index) => (
            <g key={event.label} transform={`translate(${event.x} 138)`}>
              <circle r="20" />
              <text className="security-perspective__number" textAnchor="middle" dy=".35em">{index + 1}</text>
              <text className="security-perspective__label" textAnchor="middle" y="39">{event.label}</text>
            </g>
          ))}
        </g>

        <g className="security-perspective__system">
          {edges.map(([from, to], index) => {
            const start = states[from];
            const end = states[to];
            const distance = Math.hypot(end.x - start.x, end.y - start.y);
            const dx = (end.x - start.x) / distance;
            const dy = (end.y - start.y) / distance;
            return (
              <line
                key={`${from}-${to}`}
                className={index > 2 ? 'security-perspective__edge security-perspective__edge--alternate' : 'security-perspective__edge'}
                x1={start.x + dx * 25}
                y1={start.y + dy * 25}
                x2={end.x - dx * 28}
                y2={end.y - dy * 28}
                markerEnd={`url(#${id}-arrow)`}
              />
            );
          })}
          {states.map((state) => (
            <g className="security-perspective__state" key={state.label} transform={`translate(${state.x} ${state.y})`}>
              <circle r="23" />
              <text textAnchor="middle" dy=".35em">{state.label}</text>
            </g>
          ))}
        </g>
      </svg>

      <p className="security-perspective__reading" aria-live="polite" aria-atomic="true">
        {systemView
          ? 'Each action is also a transition: it changes position, knowledge, or what becomes reachable next.'
          : 'A behavior-focused view records what happened and looks for a recognizable pattern.'}
      </p>

      <figcaption>The activity is the same. What the model explains is different.</figcaption>

      <style>{`
        .security-perspective {
          --security-ink: var(--ink, #111);
          --security-secondary: var(--secondary, #6b7280);
          --security-faint: var(--faint, #e5e7eb);
          margin-block: 2rem;
          padding-block: .75rem;
          color: var(--security-ink);
          font-family: var(--sans, ui-sans-serif, system-ui, sans-serif);
        }
        .prose .security-perspective { margin-inline: clamp(-1rem, -7vw, -4rem); }
        .security-perspective__switch {
          display: flex;
          justify-content: center;
          gap: 1.25rem;
        }
        .security-perspective__switch button {
          min-height: 2.5rem;
          padding: .4rem .125rem;
          border: 0;
          border-bottom: 1px solid transparent;
          border-radius: 0;
          background: transparent;
          color: var(--security-secondary);
          font: 500 .75rem/1rem inherit;
          cursor: pointer;
        }
        .security-perspective__switch button:hover,
        .security-perspective__switch button[aria-pressed='true'] { color: var(--security-ink); }
        .security-perspective__switch button[aria-pressed='true'] { border-bottom-color: currentColor; }
        .security-perspective svg {
          display: block;
          width: 100%;
          height: auto;
          margin-top: .25rem;
          overflow: visible;
        }
        .security-perspective__behaviors,
        .security-perspective__system { transition: opacity 220ms ease; }
        .security-perspective__behaviors { opacity: 1; }
        .security-perspective__system { opacity: 0; }
        .security-perspective[data-perspective='system'] .security-perspective__behaviors { opacity: 0; }
        .security-perspective[data-perspective='system'] .security-perspective__system { opacity: 1; }
        .security-perspective__timeline,
        .security-perspective__edge {
          stroke: currentColor;
          stroke-width: 1;
          vector-effect: non-scaling-stroke;
        }
        .security-perspective__timeline { opacity: .25; }
        .security-perspective__behaviors circle,
        .security-perspective__state circle {
          fill: var(--paper, #fff);
          stroke: currentColor;
          stroke-width: 1;
          vector-effect: non-scaling-stroke;
        }
        .security-perspective__number,
        .security-perspective__state text {
          fill: currentColor;
          font-size: 11px;
          font-weight: 500;
        }
        .security-perspective__label {
          fill: currentColor;
          font-size: 10px;
          opacity: .55;
        }
        .security-perspective__edge { opacity: .65; }
        .security-perspective__edge--alternate { stroke-dasharray: 4 4; opacity: .4; }
        .security-perspective__state { opacity: .82; }
        .security-perspective__reading {
          min-height: 2.5rem;
          margin: 0 1rem;
          color: var(--security-secondary);
          font-size: .75rem;
          line-height: 1.15rem;
          text-align: center;
        }
        .security-perspective figcaption { margin-top: .5rem; }
        @media (max-width: 540px) {
          .prose .security-perspective { margin-inline: -.5rem; }
          .security-perspective__number,
          .security-perspective__state text { font-size: 15px; }
          .security-perspective__label { font-size: 14px; }
          .security-perspective__reading { margin-inline: .5rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          .security-perspective__behaviors,
          .security-perspective__system { transition: none; }
        }
      `}</style>
    </figure>
  );
}
