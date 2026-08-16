import {
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type SVGProps,
} from 'react';

type Point = { x: number; y: number };
type Handle = 'first' | 'second';

const START: Point = { x: 42, y: 218 };
const END: Point = { x: 558, y: 58 };
const WIDTH = 600;
const HEIGHT = 276;

function cubicPoint(t: number, p0: Point, p1: Point, p2: Point, p3: Point): Point {
  const inverse = 1 - t;
  return {
    x: inverse ** 3 * p0.x + 3 * inverse ** 2 * t * p1.x + 3 * inverse * t ** 2 * p2.x + t ** 3 * p3.x,
    y: inverse ** 3 * p0.y + 3 * inverse ** 2 * t * p1.y + 3 * inverse * t ** 2 * p2.y + t ** 3 * p3.y,
  };
}

function constrain(point: Point): Point {
  return {
    x: Math.min(WIDTH - 18, Math.max(18, point.x)),
    y: Math.min(HEIGHT - 18, Math.max(18, point.y)),
  };
}

export default function BezierPlayground() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [first, setFirst] = useState<Point>({ x: 170, y: 42 });
  const [second, setSecond] = useState<Point>({ x: 410, y: 250 });
  const [progress, setProgress] = useState(0.5);
  const active = cubicPoint(progress, START, first, second, END);
  const path = `M ${START.x} ${START.y} C ${first.x} ${first.y}, ${second.x} ${second.y}, ${END.x} ${END.y}`;
  const equation = useMemo(() => `B(${progress.toFixed(2)})`, [progress]);

  function updateFromPointer(event: PointerEvent<SVGCircleElement>, handle: Handle) {
    const svg = svgRef.current;
    if (!svg) return;
    const bounds = svg.getBoundingClientRect();
    const point = constrain({
      x: ((event.clientX - bounds.left) / bounds.width) * WIDTH,
      y: ((event.clientY - bounds.top) / bounds.height) * HEIGHT,
    });
    (handle === 'first' ? setFirst : setSecond)(point);
  }

  function onPointerDown(event: PointerEvent<SVGCircleElement>, handle: Handle) {
    event.currentTarget.setPointerCapture(event.pointerId);
    updateFromPointer(event, handle);
  }

  function onHandleKeyDown(event: KeyboardEvent<SVGCircleElement>, handle: Handle) {
    const step = event.shiftKey ? 10 : 3;
    const movement: Record<string, Point> = {
      ArrowLeft: { x: -step, y: 0 },
      ArrowRight: { x: step, y: 0 },
      ArrowUp: { x: 0, y: -step },
      ArrowDown: { x: 0, y: step },
    };
    const delta = movement[event.key];
    if (!delta) return;
    event.preventDefault();
    const current = handle === 'first' ? first : second;
    const next = constrain({ x: current.x + delta.x, y: current.y + delta.y });
    (handle === 'first' ? setFirst : setSecond)(next);
  }

  function handleProps(point: Point, handle: Handle, label: string): SVGProps<SVGCircleElement> {
    return {
      cx: point.x,
      cy: point.y,
      tabIndex: 0,
      role: 'slider',
      'aria-label': label,
      'aria-valuemin': 0,
      'aria-valuemax': WIDTH,
      'aria-valuenow': Math.round(point.x),
      'aria-valuetext': `x ${Math.round(point.x)}, y ${Math.round(point.y)}`,
      onPointerDown: (event: PointerEvent<SVGCircleElement>) => onPointerDown(event, handle),
      onPointerMove: (event: PointerEvent<SVGCircleElement>) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) updateFromPointer(event, handle);
      },
      onKeyDown: (event: KeyboardEvent<SVGCircleElement>) => onHandleKeyDown(event, handle),
    };
  }

  return (
    <figure className="bezier" aria-labelledby="bezier-title">
      <div className="bezier__header">
        <div>
          <strong id="bezier-title">Cubic Bézier curve</strong>
          <span>Drag the two control points</span>
        </div>
        <output aria-live="polite">{equation}</output>
      </div>

      <svg
        ref={svgRef}
        className="bezier__canvas"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="Interactive cubic Bézier curve with two draggable control points"
      >
        <line className="bezier__guide" x1={START.x} y1={START.y} x2={first.x} y2={first.y} />
        <line className="bezier__guide" x1={END.x} y1={END.y} x2={second.x} y2={second.y} />
        <path className="bezier__curve" d={path} />
        <circle className="bezier__endpoint" cx={START.x} cy={START.y} r="5" />
        <circle className="bezier__endpoint" cx={END.x} cy={END.y} r="5" />
        <circle className="bezier__active" cx={active.x} cy={active.y} r="6" />
        <circle className="bezier__handle" r="11" {...handleProps(first, 'first', 'First control point')} />
        <circle className="bezier__handle" r="11" {...handleProps(second, 'second', 'Second control point')} />
      </svg>

      <div className="bezier__controls">
        <label htmlFor="bezier-progress">Position along the curve</label>
        <input
          id="bezier-progress"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={progress}
          onChange={(event) => setProgress(Number(event.currentTarget.value))}
        />
        <span>{Math.round(progress * 100)}%</span>
      </div>

      <figcaption>
        Pointer, touch, and keyboard friendly. Focus a control point and use the arrow keys; hold Shift for larger steps.
      </figcaption>

      <style>{`
        .bezier {
          margin-block: 2rem;
          overflow: hidden;
          border: 1px solid var(--faint);
          border-radius: 8px;
          background: var(--paper);
          font-family: var(--sans);
        }
        .bezier__header { display: flex; justify-content: space-between; gap: 1rem; padding: .85rem 1rem; border-bottom: 1px solid var(--faint); }
        .bezier__header strong, .bezier__header span { display: block; }
        .bezier__header strong { font-size: .76rem; line-height: 1.4; }
        .bezier__header span { margin-top: .1rem; color: var(--secondary); font-size: .6875rem; line-height: .875rem; }
        .bezier__header output { align-self: center; color: var(--secondary); font: .6875rem/.875rem var(--mono); }
        .bezier__canvas { display: block; width: 100%; height: auto; min-height: 210px; touch-action: none; }
        .bezier__guide { stroke: var(--muted); stroke-width: 1; stroke-dasharray: 4 5; opacity: .55; }
        .bezier__curve { fill: none; stroke: var(--accent); stroke-width: 2.5; stroke-linecap: round; }
        .bezier__endpoint { fill: var(--ink); }
        .bezier__active { fill: var(--paper); stroke: var(--ink); stroke-width: 2; }
        .bezier__handle { fill: var(--paper); stroke: var(--accent); stroke-width: 3; cursor: grab; transition: r 120ms ease; }
        .bezier__handle:hover, .bezier__handle:focus { r: 14; }
        .bezier__handle:active { cursor: grabbing; }
        .bezier__controls { display: grid; grid-template-columns: auto 1fr 3ch; align-items: center; gap: .8rem; padding: .85rem 1rem; border-top: 1px solid var(--faint); }
        .bezier__controls label, .bezier__controls span { color: var(--secondary); font-size: .6875rem; line-height: .875rem; }
        .bezier__controls span { text-align: right; font-variant-numeric: tabular-nums; }
        .bezier__controls input { width: 100%; accent-color: var(--accent); }
        .bezier figcaption { padding: 0 1rem .85rem; color: var(--muted); font: .6rem/1.5 var(--sans); text-align: left; }
        @media (max-width: 600px) {
          .bezier__controls { grid-template-columns: 1fr 3ch; }
          .bezier__controls label { grid-column: 1 / -1; }
        }
      `}</style>
    </figure>
  );
}
