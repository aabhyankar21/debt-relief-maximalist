import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { useMediaQuery } from '../../engine/useMediaQuery';
import styles from './stickyCtaDock.module.css';

export interface StickyCtaDockProps {
  children: ReactNode;
  className?: string;
  /**
   * `sheet` — gradient + shadow over the white form sheet (default).
   * `card` — fixed only; no sheet chrome (for in-card CTAs like Match).
   */
  variant?: 'sheet' | 'card';
}

/**
 * Shared mobile CTA shell for Orbit.
 *
 * On mobile the dock is portaled to `document.body` and `position: fixed`,
 * synced to `window.visualViewport` so it stays on the visible screen and
 * above sheet content (layout-viewport fixed can sit below the fold; a
 * fixed node inside the form’s stacking context can paint under siblings).
 * An in-flow spacer keeps sheet content from sitting under the dock.
 *
 * Desktop stays in normal document flow (no portal).
 *
 * Use this for every step that has a Continue / Qualify / Call Now button
 * so CTA pinning can’t drift per step. Do not reintroduce per-step
 * `.ctaDock` sticky/fixed rules in orbit.module.css.
 */
export function StickyCtaDock({
  children,
  className,
  variant = 'sheet',
}: StickyCtaDockProps) {
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const dockRef = useRef<HTMLDivElement>(null);
  const [spacerH, setSpacerH] = useState(0);
  const [pinStyle, setPinStyle] = useState<CSSProperties>();
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!isMobile) {
      setPinStyle(undefined);
      setSpacerH(0);
      return;
    }

    const dock = dockRef.current;
    if (!dock) return;

    const sync = () => {
      const vv = window.visualViewport;
      const layoutH = window.innerHeight;
      const visualH = vv?.height ?? layoutH;
      const offsetTop = vv?.offsetTop ?? 0;
      const bottomGap = Math.max(0, layoutH - visualH - offsetTop);
      const width = vv?.width ?? window.innerWidth;
      const left = vv?.offsetLeft ?? 0;

      setPinStyle({
        position: 'fixed',
        left,
        width,
        bottom: bottomGap,
        zIndex: 40,
      });
      setSpacerH(Math.ceil(dock.getBoundingClientRect().height));
    };

    sync();

    const vv = window.visualViewport;
    vv?.addEventListener('resize', sync);
    vv?.addEventListener('scroll', sync);
    window.addEventListener('resize', sync);

    const ro = new ResizeObserver(sync);
    ro.observe(dock);

    return () => {
      vv?.removeEventListener('resize', sync);
      vv?.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
      ro.disconnect();
    };
  }, [isMobile, mounted]);

  const dock = (
    <div
      ref={dockRef}
      className={`${styles.dock}${className ? ` ${className}` : ''}`}
      data-concept="orbit"
      data-sticky-cta-dock=""
      data-mobile={isMobile ? '' : undefined}
      data-variant={variant}
      style={isMobile ? pinStyle : undefined}
    >
      <div className={styles.inner}>{children}</div>
    </div>
  );

  if (!isMobile) {
    return dock;
  }

  return (
    <>
      <div
        className={styles.spacer}
        style={{ height: spacerH }}
        aria-hidden="true"
      />
      {mounted ? createPortal(dock, document.body) : dock}
    </>
  );
}
