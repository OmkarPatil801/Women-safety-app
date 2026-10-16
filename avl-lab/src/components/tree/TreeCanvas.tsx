import { AnimatePresence, motion } from 'framer-motion';
import { Maximize2, Minus, Plus, RotateCcw } from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent as RPointerEvent, type ReactNode } from 'react';
import type { Highlights, TreeNode } from '../../features/avl';
import { useSettings } from '../../hooks/useSettings';
import { computeLayout, NODE_R, type LayoutNode, type TreeLayout } from './layout';
import { resolveNodeState, STATE_LABEL, stateColors, type NodeState } from './nodeStyle';

export interface TreeCanvasProps {
  root: TreeNode | null;
  highlights?: Highlights;
  selectedUid?: number | null;
  onSelect?: (uid: number | null) => void;
  onHover?: (uid: number | null) => void;
  showMetrics?: boolean;
  /** Enables zoom, pan and the control buttons. */
  interactive?: boolean;
  className?: string;
  /** Fixed pixel height (overrides any height class). */
  height?: number;
  ariaLabel?: string;
  empty?: ReactNode;
  /** Largest automatic zoom when fitting (keeps tiny trees from looking huge). */
  maxFitScale?: number;
  /** Extra text shown under each node (lesson helpers), keyed by uid. */
  nodeNotes?: Record<number, string>;
}

interface View {
  k: number;
  x: number;
  y: number;
}
const MIN_K = 0.15;
const MAX_K = 3;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function edgeEnds(a: LayoutNode, b: LayoutNode) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  return { x1: a.x + ux * NODE_R, y1: a.y + uy * NODE_R, x2: b.x - ux * NODE_R, y2: b.y - uy * NODE_R };
}

interface NodeProps {
  n: LayoutNode;
  state: NodeState;
  order: number | null;
  showMetrics: boolean;
  dur: number;
  start: { x: number; y: number } | null;
  onSelect?: (uid: number) => void;
  onHover?: (uid: number | null) => void;
  note?: string;
}

const NodeView = memo(function NodeView({ n, state, order, showMetrics, dur, start, onSelect, onHover, note }: NodeProps) {
  const c = stateColors(state);
  const label = STATE_LABEL[state];
  const keyText = String(n.key);
  const fontSize = keyText.length >= 5 ? 11 : keyText.length === 4 ? 13 : 16;
  const heavy = n.balance > 0 ? '↙' : n.balance < 0 ? '↘' : '';
  const bad = Math.abs(n.balance) > 1;
  const bfText = `${n.balance > 0 ? '+' : n.balance < 0 ? '−' : ''}${Math.abs(n.balance)}`;
  return (
    <motion.g
      initial={start ? { x: start.x, y: start.y, opacity: 0 } : false}
      animate={{ x: n.x, y: n.y, opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: dur * 0.6 } }}
      transition={{ type: 'tween', ease: 'easeInOut', duration: dur }}
      style={{ cursor: onSelect ? 'pointer' : 'default' }}
      role="button"
      tabIndex={onSelect ? 0 : -1}
      aria-label={`Node ${n.key}, height ${n.height}, balance factor ${n.balance}${label ? `, ${label}` : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(n.uid);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.(n.uid);
        }
      }}
      onPointerEnter={() => onHover?.(n.uid)}
      onPointerLeave={() => onHover?.(null)}
      onFocus={() => onHover?.(n.uid)}
      onBlur={() => onHover?.(null)}
      data-node={n.key}
    >
      {state === 'unbalanced' && <circle r={NODE_R + 7} fill="none" stroke={c.stroke} strokeWidth={2} strokeDasharray="4 4" />}
      {state === 'selected' && <circle r={NODE_R + 5} fill="none" stroke="rgb(var(--c-accent))" strokeWidth={2} />}
      <circle r={NODE_R} fill={c.fill} stroke={c.stroke} strokeWidth={c.width} strokeDasharray={c.dash} />
      <text textAnchor="middle" dominantBaseline="central" fontSize={fontSize} fontWeight={700} fill={c.text} style={{ userSelect: 'none' }}>
        {keyText}
      </text>
      {order !== null && (
        <g transform={`translate(${-NODE_R + 2}, ${-NODE_R + 2})`}>
          <circle r={9} fill="rgb(var(--c-info))" />
          <text textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={700} fill="rgb(9 14 27)">
            {order}
          </text>
        </g>
      )}
      {label && (
        <text y={-NODE_R - 9} textAnchor="middle" fontSize={11} fontWeight={600} fill={c.stroke} style={{ paintOrder: 'stroke', stroke: 'rgb(var(--c-bg))', strokeWidth: 3 }}>
          {label}
        </text>
      )}
      {showMetrics && (
        <text
          y={state === 'unbalanced' ? NODE_R + 22 : NODE_R + 15}
          textAnchor="middle"
          fontSize={11}
          fontFamily="ui-monospace, monospace"
          fill={bad ? 'rgb(var(--c-bad))' : 'rgb(var(--c-muted))'}
          style={{ paintOrder: 'stroke', stroke: 'rgb(var(--c-bg))', strokeWidth: 3 }}
        >
          {`h${n.height} bf${bfText}${heavy}${bad ? '!' : ''}`}
        </text>
      )}
      {note && (
        <text y={NODE_R + 29} textAnchor="middle" fontSize={10} fill="rgb(var(--c-accent))" style={{ paintOrder: 'stroke', stroke: 'rgb(var(--c-bg))', strokeWidth: 3 }}>
          {note}
        </text>
      )}
    </motion.g>
  );
});

export function TreeCanvas({
  root,
  highlights,
  selectedUid = null,
  onSelect,
  onHover,
  showMetrics = true,
  interactive = true,
  className = 'h-[420px]',
  height: fixedHeight,
  ariaLabel = 'AVL tree diagram',
  empty,
  maxFitScale = 1.15,
  nodeNotes,
}: TreeCanvasProps) {
  const { animations } = useSettings();
  const dur = animations ? 0.5 : 0;
  const layout: TreeLayout = useMemo(() => computeLayout(root), [root]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [view, setView] = useState<View>({ k: 1, x: 0, y: 0 });
  const manual = useRef(false);
  const mounted = useRef(false);
  const drag = useRef<{ id: number; sx: number; sy: number; vx: number; vy: number; moved: boolean } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; k: number } | null>(null);

  useEffect(() => {
    mounted.current = true;
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setSize({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const fit = useCallback(() => {
    if (!size.w || !size.h || !layout.width) return;
    const reserve = interactive ? 40 : 0; // keep the nodes clear of the control buttons
    const k = clamp(Math.min((size.w - 24) / layout.width, (size.h - 16 - reserve) / layout.height, maxFitScale), MIN_K, MAX_K);
    setView({ k, x: (size.w - layout.width * k) / 2, y: Math.max(8, Math.min(24, (size.h - reserve - layout.height * k) / 2)) });
  }, [size, layout.width, layout.height, maxFitScale, interactive]);

  useEffect(() => {
    if (!manual.current || !interactive) fit();
  }, [fit, interactive]);

  const zoomAt = useCallback((factor: number, cx: number, cy: number) => {
    manual.current = true;
    setView((v) => {
      const k = clamp(v.k * factor, MIN_K, MAX_K);
      const f = k / v.k;
      return { k, x: cx - (cx - v.x) * f, y: cy - (cy - v.y) * f };
    });
  }, []);

  // Wheel needs a non-passive listener so the page does not scroll while zooming.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || !interactive) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      zoomAt(Math.exp(-e.deltaY * 0.0015), e.clientX - r.left, e.clientY - r.top);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [interactive, zoomAt]);

  const onPointerDown = (e: RPointerEvent) => {
    if (!interactive) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), k: view.k };
      drag.current = null;
      return;
    }
    drag.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, vx: view.x, vy: view.y, moved: false };
  };
  const onPointerMove = (e: RPointerEvent) => {
    if (!interactive) return;
    if (pointers.current.has(e.pointerId)) pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch.current && pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const r = wrapRef.current!.getBoundingClientRect();
      const target = clamp(pinch.current.k * (dist / pinch.current.dist), MIN_K, MAX_K);
      zoomAt(target / view.k, (a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top);
      return;
    }
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (!d.moved && Math.hypot(dx, dy) < 4) return;
    d.moved = true;
    manual.current = true;
    setView((v) => ({ ...v, x: d.vx + dx, y: d.vy + dy }));
  };
  const onPointerUp = (e: RPointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    const d = drag.current;
    if (d && d.id === e.pointerId) {
      if (!d.moved) onSelect?.(null);
      drag.current = null;
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (!interactive || e.target !== e.currentTarget) return;
    const cx = size.w / 2;
    const cy = size.h / 2;
    const step = 40;
    const handled = ['+', '=', '-', '_', '0', 'f', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    if (!handled.includes(e.key)) return;
    e.preventDefault();
    if (e.key === '+' || e.key === '=') zoomAt(1.2, cx, cy);
    else if (e.key === '-' || e.key === '_') zoomAt(1 / 1.2, cx, cy);
    else if (e.key === '0' || e.key === 'f') {
      manual.current = false;
      fit();
    } else {
      manual.current = true;
      setView((v) => ({
        ...v,
        x: v.x + (e.key === 'ArrowLeft' ? step : e.key === 'ArrowRight' ? -step : 0),
        y: v.y + (e.key === 'ArrowUp' ? step : e.key === 'ArrowDown' ? -step : 0),
      }));
    }
  };

  const visitedOrder = useMemo(() => {
    const m = new Map<number, number>();
    highlights?.visited?.forEach((uid, i) => m.set(uid, i + 1));
    return m;
  }, [highlights?.visited]);

  const handleSelect = useCallback((uid: number) => onSelect?.(uid), [onSelect]);

  const resetView = () => {
    manual.current = true;
    setView({ k: 1, x: 24, y: 16 });
  };

  return (
    <div
      ref={wrapRef}
      className={`relative overflow-hidden rounded-2xl border border-line bg-bg ${className}`}
      style={{ touchAction: interactive ? 'none' : 'auto', cursor: interactive ? 'grab' : 'default', height: fixedHeight }}
      tabIndex={interactive ? 0 : -1}
      role="group"
      aria-label={`${ariaLabel}${interactive ? '. Use plus and minus to zoom, arrow keys to pan, 0 to fit.' : ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
    >
      {layout.nodes.length === 0 ? (
        <div className="flex h-full items-center justify-center p-6 text-center">
          {empty ?? (
            <div>
              <p className="font-medium text-ink">The tree is empty</p>
              <p className="mt-1 text-sm text-muted">Insert a value to create the root.</p>
            </div>
          )}
        </div>
      ) : (
        <svg width="100%" height="100%" role="presentation" style={{ display: 'block' }}>
          <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
            <AnimatePresence initial={false}>
              {layout.edges.map((e) => {
                const p = layout.byUid.get(e.parentUid)!;
                const c = layout.byUid.get(e.childUid)!;
                const pts = edgeEnds(p, c);
                const onPath = highlights?.path?.includes(c.uid) && (highlights.path.includes(p.uid) || highlights.active?.includes(p.uid));
                return (
                  <motion.line
                    key={`e${e.childUid}`}
                    initial={mounted.current ? { ...edgeEnds(p, p), opacity: 0 } : false}
                    animate={{ ...pts, opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: dur * 0.5 } }}
                    transition={{ type: 'tween', ease: 'easeInOut', duration: dur }}
                    stroke={e.side === 'left' ? 'rgb(var(--tree-edge-l))' : 'rgb(var(--tree-edge-r))'}
                    strokeOpacity={onPath ? 1 : 0.7}
                    strokeWidth={onPath ? 3.5 : 2}
                    strokeLinecap="round"
                    strokeDasharray={e.side === 'right' ? '1 0' : undefined}
                  />
                );
              })}
            </AnimatePresence>
            <AnimatePresence initial={false}>
              {layout.nodes.map((n) => {
                const parent = n.parentUid !== null ? layout.byUid.get(n.parentUid) : undefined;
                return (
                  <NodeView
                    key={n.uid}
                    n={n}
                    state={resolveNodeState(n.uid, highlights, selectedUid === n.uid)}
                    order={visitedOrder.get(n.uid) ?? null}
                    showMetrics={showMetrics}
                    dur={dur}
                    start={mounted.current ? (parent ? { x: parent.x, y: parent.y } : { x: n.x, y: n.y - 30 }) : null}
                    onSelect={onSelect ? handleSelect : undefined}
                    onHover={onHover}
                    note={nodeNotes?.[n.uid]}
                  />
                );
              })}
            </AnimatePresence>
          </g>
        </svg>
      )}

      {interactive && layout.nodes.length > 0 && (
        <div className="absolute bottom-2 right-2 flex gap-1 rounded-xl border border-line bg-surface/90 p-1 backdrop-blur" onPointerDown={(e) => e.stopPropagation()}>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => zoomAt(1.25, size.w / 2, size.h / 2)} aria-label="Zoom in" title="Zoom in (+)">
            <Plus className="h-4 w-4" />
          </button>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => zoomAt(0.8, size.w / 2, size.h / 2)} aria-label="Zoom out" title="Zoom out (−)">
            <Minus className="h-4 w-4" />
          </button>
          <button
            className="btn btn-ghost btn-sm btn-icon"
            onClick={() => {
              manual.current = false;
              fit();
            }}
            aria-label="Fit tree to screen"
            title="Fit to screen (0)"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={resetView} aria-label="Reset view to 100%" title="Reset view (100%)">
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      )}
      {interactive && layout.nodes.length > 0 && (
        <div className="pointer-events-none absolute bottom-2 left-3 hidden text-[11px] text-muted sm:block">
          drag to pan · scroll to zoom · {Math.round(view.k * 100)}%
        </div>
      )}
    </div>
  );
}

/** Colour-coded legend. Meaning is also written as text on the nodes themselves. */
export function TreeLegend({ items }: { items?: NodeState[] }) {
  const all: { state: NodeState; text: string }[] = [
    { state: 'active', text: 'Current node' },
    { state: 'path', text: 'Path so far' },
    { state: 'created', text: 'New node' },
    { state: 'unbalanced', text: 'Unbalanced (|BF|>1)' },
    { state: 'rotating', text: 'Rotating' },
    { state: 'removed', text: 'To remove' },
    { state: 'found', text: 'Found' },
    { state: 'visited', text: 'Traversal order' },
  ];
  const list = items ? all.filter((a) => items.includes(a.state)) : all;
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted" aria-label="Legend">
      {list.map((a) => {
        const c = stateColors(a.state);
        return (
          <li key={a.state} className="flex items-center gap-1.5">
            <svg width="16" height="16" aria-hidden>
              <circle cx="8" cy="8" r="6" fill={c.fill} stroke={c.stroke} strokeWidth={2} strokeDasharray={c.dash} />
            </svg>
            {a.text}
          </li>
        );
      })}
      <li className="flex items-center gap-1.5">
        <svg width="26" height="8" aria-hidden>
          <line x1="1" y1="4" x2="12" y2="4" stroke="rgb(var(--tree-edge-l))" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="14" y1="4" x2="25" y2="4" stroke="rgb(var(--tree-edge-r))" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        Left / right edge
      </li>
      <li className="font-mono">h = height · bf = balance factor (↙ left-heavy, ↘ right-heavy)</li>
    </ul>
  );
}
