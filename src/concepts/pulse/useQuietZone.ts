import { useCallback, useEffect, useRef, useState } from 'react';
import type { PulseRect } from './PulseField';

/** Below this the rect counts as unchanged, so a resize doesn't thrash state. */
const EPSILON = 0.004;

/**
 * Reports where the prose sits, as a fraction of the field behind it.
 *
 * Pulse has no card between the copy and the field, so the field has to know
 * what it is sitting under: `PulseField` moves cluster density into whatever
 * gutter this leaves and dims the ambient particles that still cross it.
 *
 * Measured rather than assumed. The layout is driven by container queries and
 * the copy's height changes with every step, so any hardcoded column width
 * would be wrong at some breakpoint — and wrong in the way that puts glowing
 * dots through a headline.
 *
 * @param rootRef the element the field fills; the rect is relative to this
 * @returns `quietZone` for the field, and `attachCopy` for the step wrapper
 */
export function useQuietZone(rootRef: { current: HTMLElement | null }) {
  const [quietZone, setQuietZone] = useState<PulseRect | null>(null);
  const copyRef = useRef<HTMLElement | null>(null);

  const measure = useCallback(() => {
    const root = rootRef.current;
    const wrap = copyRef.current;
    if (!root || !wrap) return;

    const frame = root.getBoundingClientRect();
    if (frame.width <= 0 || frame.height <= 0) return;

    /*
     * `StepBody` groups the eyebrow, heading, question and subtext in a single
     * header, which is exactly the region that needs protecting: the controls
     * below it are opaque and can look after themselves. Anything without one
     * falls back to its whole box.
     */
    const rect = (wrap.querySelector('header') ?? wrap).getBoundingClientRect();

    const next: PulseRect = {
      x: (rect.left - frame.left) / frame.width,
      y: (rect.top - frame.top) / frame.height,
      w: rect.width / frame.width,
      h: rect.height / frame.height,
    };

    setQuietZone((current) =>
      current &&
      Math.abs(current.x - next.x) < EPSILON &&
      Math.abs(current.y - next.y) < EPSILON &&
      Math.abs(current.w - next.w) < EPSILON &&
      Math.abs(current.h - next.h) < EPSILON
        ? current
        : next,
    );
  }, [rootRef]);

  /* The wrapper remounts on every step, so the observer follows the node. */
  const observer = useRef<ResizeObserver | null>(null);
  const attachCopy = useCallback(
    (node: HTMLElement | null) => {
      observer.current?.disconnect();
      observer.current = null;
      copyRef.current = node;
      if (!node) return;

      const next = new ResizeObserver(measure);
      next.observe(node);
      observer.current = next;
      measure();
    },
    [measure],
  );

  /* A frame resize moves the copy without resizing it, so watch both. */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const frameObserver = new ResizeObserver(measure);
    frameObserver.observe(root);
    return () => {
      frameObserver.disconnect();
      observer.current?.disconnect();
      observer.current = null;
    };
  }, [measure, rootRef]);

  return { quietZone, attachCopy };
}
