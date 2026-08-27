import {
  createElement,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactNode,
} from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'motion/react';
import styles from './pulseTitle.module.css';

/* ------------------------------------------------------------------ *
 * Config
 *
 * Every duration, delay and weight the title uses. Nothing below this
 * block holds a timing value.
 * ------------------------------------------------------------------ */

export const PULSE_TITLE_CONFIG = {
  /** Resolve in place: blur and opacity only, never position. */
  resolve: {
    blur: 3,
    opacity: 0.6,
    duration: 0.45,
    ease: [0.22, 1, 0.36, 1],
  },

  /** 300 to the resting weight, in parallel with the blur. */
  weight: { from: 300, to: 560 },

  /**
   * The highlight catches focus a beat after the sentence around it, which
   * is the entire point of it: same resolve, later start.
   */
  highlight: { delay: 0.18, tickDelay: 0.34, tickDuration: 0.22 },

  tick: {
    /** Starts a breath after the title has finished resolving. */
    delay: 0.55,
    duration: 0.18,
    ease: [0.4, 0, 0.2, 1],
  },

  /** Short on purpose: the number lands with the sentence, not after it. */
  countUp: { duration: 0.2 },

  /** Cross-fade only, opacity only. */
  reduced: { duration: 0.2 },
} as const;

/* ------------------------------------------------------------------ *
 * Text splitting
 * ------------------------------------------------------------------ */

interface Segment {
  kind: 'text' | 'number';
  text: string;
  highlight: boolean;
}

function escapeRe(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Longest phrase first, so an overlapping pair can't have the shorter match
 * swallow the longer one. Matching is case-insensitive but the copy itself
 * is never altered — only wrapped.
 */
function splitHighlights(text: string, phrases?: string[]): Segment[] {
  const wanted = (phrases ?? [])
    .map((phrase) => phrase.trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  if (!wanted.length) return [{ kind: 'text', text, highlight: false }];

  const pattern = new RegExp(`(${wanted.map(escapeRe).join('|')})`, 'gi');
  const lowered = wanted.map((phrase) => phrase.toLowerCase());

  return text
    .split(pattern)
    .filter((part) => part.length > 0)
    .map((part) => ({
      kind: 'text' as const,
      text: part,
      highlight: lowered.includes(part.toLowerCase()),
    }));
}

const NUMERAL = /\d[\d,]*/;

/**
 * Pulls the first numeral into its own segment so it can be counted without
 * the rest of the sentence re-rendering. Highlighted segments are skipped: a
 * phrase gets one treatment, not two.
 */
function splitNumeral(segments: Segment[]): Segment[] {
  const index = segments.findIndex(
    (segment) => !segment.highlight && NUMERAL.test(segment.text),
  );
  if (index === -1) return segments;

  const segment = segments[index];
  const match = NUMERAL.exec(segment.text);
  if (!match) return segments;

  const before = segment.text.slice(0, match.index);
  const after = segment.text.slice(match.index + match[0].length);

  const replacement: Segment[] = [];
  if (before) replacement.push({ kind: 'text', text: before, highlight: false });
  replacement.push({ kind: 'number', text: match[0], highlight: false });
  if (after) replacement.push({ kind: 'text', text: after, highlight: false });

  return [
    ...segments.slice(0, index),
    ...replacement,
    ...segments.slice(index + 1),
  ];
}

/** Keeps whatever grouping the frozen copy already used. */
function formatNumber(value: number, template: string) {
  const rounded = Math.round(value);
  return template.includes(',')
    ? rounded.toLocaleString('en-US')
    : String(rounded);
}

/* ------------------------------------------------------------------ *
 * Component
 * ------------------------------------------------------------------ */

export type PulseTitleTag = 'h1' | 'h2' | 'h3' | 'p' | 'span';

export interface PulseTitleProps {
  text: string;
  /** Exact substrings to emphasise, e.g. ["no impact on your credit score"]. */
  highlightPhrases?: string[];
  /** Phrase colour without the wrapping underline. Defaults to on. */
  highlightTick?: boolean;
  /** Variable-font weight ramp. On only for the steps that earn it. */
  animateWeight?: boolean;
  /** The underline that draws left to right once the title has resolved. */
  tick?: boolean;
  /** Counts the first numeral found in `text` up to this value. */
  countUpValue?: number;
  /**
   * Blur-to-sharp duration. Defaults to 450ms; the intro stretches this
   * to 700ms because that is the one place slower is intentional.
   */
  resolveDuration?: number;
  as?: PulseTitleTag;
  className?: string;
  /** Resting weight for the ramp; ignored when animateWeight is false. */
  restingWeight?: number;
}

export function PulseTitle({
  text,
  highlightPhrases,
  highlightTick = true,
  animateWeight = false,
  tick = false,
  countUpValue,
  resolveDuration,
  as = 'h1',
  className,
  restingWeight = PULSE_TITLE_CONFIG.weight.to,
}: PulseTitleProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const { resolve, weight, highlight, tick: tickCfg, countUp, reduced } =
    PULSE_TITLE_CONFIG;
  const duration = resolveDuration ?? resolve.duration;
  const tickDelay = duration + 0.1;

  const segments = useMemo(() => {
    const split = splitHighlights(text, highlightPhrases);
    return countUpValue == null ? split : splitNumeral(split);
  }, [text, highlightPhrases, countUpValue]);

  /* ---------------------------- weight ramp ---------------------------- */

  const wght = useMotionValue(animateWeight ? weight.from : restingWeight);
  const fontVariationSettings = useTransform(
    wght,
    (value) => `'wght' ${value.toFixed(0)}`,
  );

  useEffect(() => {
    if (!animateWeight || reduceMotion) {
      wght.set(restingWeight);
      return;
    }
    wght.set(weight.from);
    const controls = animate(wght, restingWeight, {
      duration,
      ease: resolve.ease,
    });
    return () => controls.stop();
  }, [wght, animateWeight, restingWeight, reduceMotion, text, duration]);

  /* ----------------------------- count-up ----------------------------- */

  const numberRef = useRef<HTMLSpanElement>(null);
  const counter = useMotionValue(0);
  const template = segments.find((segment) => segment.kind === 'number')?.text;

  useEffect(() => {
    const node = numberRef.current;
    if (!node || countUpValue == null || !template || reduceMotion) return;

    /* Starting from a nearby round number rather than zero keeps a large
       figure from spending the animation in the wrong order of magnitude. */
    const from =
      countUpValue >= 1000 ? Math.floor((countUpValue * 0.82) / 100) * 100 : 0;

    counter.set(from);
    const unsubscribe = counter.on('change', (value) => {
      node.textContent = formatNumber(value, template);
    });
    const controls = animate(counter, countUpValue, {
      duration: countUp.duration,
      ease: 'easeOut',
    });

    return () => {
      controls.stop();
      unsubscribe();
      /* Leave the DOM holding the settled value, so a later re-render can
         never reveal a half-counted number. */
      node.textContent = formatNumber(countUpValue, template);
    };
  }, [counter, countUpValue, template, reduceMotion, text]);

  /* -------------------------- resolve + ticks -------------------------- */

  const resolveFor = (delay: number) =>
    reduceMotion
      ? {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: reduced.duration, ease: 'linear' as const },
        }
      : {
          initial: {
            opacity: resolve.opacity,
            filter: `blur(${resolve.blur}px)`,
          },
          animate: { opacity: 1, filter: 'blur(0px)' },
          transition: {
            duration,
            ease: resolve.ease,
            delay,
          },
        };

  /* Transforms are off under reduced motion, so scaleX would snap to full
     width. The tick becomes the plain fade-in the brief asks for instead. */
  const tickMotion = reduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: reduced.duration, delay: reduced.duration },
      }
    : {
        initial: { scaleX: 0 },
        animate: { scaleX: 1 },
        transition: {
          duration: tickCfg.duration,
          ease: tickCfg.ease,
          delay: tickDelay,
        },
      };

  /**
   * The phrase underline rides on background-size so it wraps with the text.
   * An inline-block with an absolutely positioned bar cannot break across
   * lines, which is exactly what a long phrase has to do at 375px.
   */
  const phraseTick = useMotionValue(0);
  const backgroundSize = useTransform(
    phraseTick,
    (value) => `${(value * 100).toFixed(1)}% 2px`,
  );

  const hasHighlight = segments.some((segment) => segment.highlight);
  const drawPhraseTick = hasHighlight && highlightTick;

  useEffect(() => {
    if (!drawPhraseTick) {
      phraseTick.set(0);
      return;
    }
    phraseTick.set(0);
    const controls = animate(phraseTick, 1, {
      duration: reduceMotion ? reduced.duration : highlight.tickDuration,
      ease: reduceMotion ? 'linear' : 'easeOut',
      delay: reduceMotion ? reduced.duration : highlight.tickDelay,
    });
    return () => controls.stop();
  }, [phraseTick, drawPhraseTick, reduceMotion, text]);

  /* ------------------------------ render ------------------------------ */

  /* The weight ramp lives on the segments rather than the wrapper: that
     keeps the wrapper a plain semantic element, so the heading stays an h1
     instead of becoming a styled span. */
  const weightStyle = animateWeight
    ? ({ fontVariationSettings } as unknown as CSSProperties)
    : undefined;

  const children: ReactNode[] = segments.map((segment, index) => {
    const key = `${index}-${segment.text}`;

    if (segment.highlight) {
      return (
        <motion.span
          key={key}
          className={
            highlightTick ? styles.highlight : styles.highlightPlain
          }
          style={
            highlightTick
              ? { backgroundSize, ...weightStyle }
              : weightStyle
          }
          {...resolveFor(reduceMotion ? 0 : highlight.delay)}
        >
          {segment.text}
        </motion.span>
      );
    }

    const content: ReactNode =
      segment.kind === 'number' && countUpValue != null ? (
        <span ref={numberRef} className={styles.numeral}>
          {formatNumber(countUpValue, segment.text)}
        </span>
      ) : (
        segment.text
      );

    return (
      <motion.span
        key={key}
        className={styles.plain}
        style={weightStyle}
        {...resolveFor(0)}
      >
        {content}
      </motion.span>
    );
  });

  if (tick) {
    children.push(
      <motion.span
        key="tick"
        className={styles.tick}
        aria-hidden="true"
        {...tickMotion}
      />,
    );
  }

  return createElement(
    as,
    { className: `${styles.title}${className ? ` ${className}` : ''}` },
    children,
  );
}
