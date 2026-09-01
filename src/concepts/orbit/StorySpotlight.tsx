import { motion, useReducedMotion } from 'motion/react';
import {
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
} from 'react';
import { useMediaQuery } from '../../engine/useMediaQuery';
import ringsSrc from './assets/rings.png';
import { ORBIT_MOTION, STORY_SPOTLIGHT } from './config';
import styles from './storySpotlight.module.css';

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

type StorySlide = (typeof STORY_SPOTLIGHT.slides)[number];

/**
 * Left-stage collage for Orbit step 2: mint portrait panel, cream
 * outcome card, dashed rings (desktop), and carousel dots.
 * Desktop: Figma 159:11776. Mobile side-by-side: Figma 192:13349.
 * Rotates through outcome stories (photo + copy).
 */
export function StorySpotlight({ className }: { className?: string }) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const reduceMotion = useReducedMotion() ?? false;
  const motionReady = !reduceMotion;
  /** Desktop-only entrance / lift motion for photo + card. */
  const motionOn = isDesktop && motionReady;
  /** Continuous ring spin — desktop only (honors reduced motion). */
  const ringsSpin = isDesktop && motionReady;

  const slides = STORY_SPOTLIGHT.slides;
  const [index, setIndex] = useState(0);
  const slide = slides[index] ?? slides[0];

  const goTo = useCallback(
    (next: number) => {
      setIndex(((next % slides.length) + slides.length) % slides.length);
    },
    [slides.length],
  );

  useEffect(() => {
    if (reduceMotion || slides.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, STORY_SPOTLIGHT.autoplayMs);
    return () => window.clearInterval(id);
    /* Re-arm when the user picks a slide so autoplay waits a full beat. */
  }, [reduceMotion, slides.length, index]);

  if (!isDesktop) {
    return (
      <MobileStorySpotlight
        className={className}
        slides={slides}
        slide={slide}
        index={index}
        onSelect={goTo}
      />
    );
  }

  const { mint, photoBox, card } = STORY_SPOTLIGHT;
  const dotsY = STORY_SPOTLIGHT.dots.y;

  return (
    <div
      className={`${styles.stage}${className ? ` ${className}` : ''}`}
      role="group"
      aria-label="Customer success stories"
    >
      <div className={styles.canvas}>
        <motion.img
          className={styles.rings}
          src={ringsSrc}
          alt=""
          draggable={false}
          aria-hidden="true"
          initial={
            ringsSpin
              ? { scale: motionOn ? 0.94 : 1, rotate: 0 }
              : false
          }
          animate={
            ringsSpin
              ? { scale: 1, rotate: 360 }
              : { scale: 1, rotate: 0 }
          }
          transition={
            ringsSpin
              ? {
                  scale: {
                    duration: motionOn ? 1.1 : 0.01,
                    ease: EASE_OUT,
                  },
                  rotate: {
                    duration: ORBIT_MOTION.ringSpinSec,
                    repeat: Infinity,
                    ease: 'linear',
                  },
                }
              : { duration: 0.01 }
          }
        />

        <motion.div
          className={styles.panel}
          initial={motionOn ? { y: 28, scale: 0.96 } : false}
          animate={{ y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: EASE_OUT }}
        >
          <div
            className={styles.mint}
            style={{
              left: `${mint.x}%`,
              top: `${mint.y}%`,
              width: `${mint.w}%`,
              height: `${mint.h}%`,
            }}
          />
          <div
            className={styles.photo}
            style={{
              left: `${photoBox.x}%`,
              top: `${photoBox.y}%`,
              width: `${photoBox.w}%`,
              height: `${photoBox.h}%`,
            }}
          >
            <StoryPhotos slides={slides} index={index} />
          </div>
          <article
            className={styles.card}
            style={{
              left: `${card.x}%`,
              top: `${card.y}%`,
              width: `${card.w}%`,
            }}
            aria-live="polite"
          >
            <StoryCardCopy slide={slide} desktop />
          </article>
        </motion.div>

        <CarouselDots
          count={slides.length}
          index={index}
          onSelect={goTo}
          style={{ top: `${dotsY}%` }}
        />
      </div>
    </div>
  );
}

function MobileStorySpotlight({
  className,
  slides,
  slide,
  index,
  onSelect,
}: {
  className?: string;
  slides: readonly StorySlide[];
  slide: StorySlide;
  index: number;
  onSelect: (next: number) => void;
}) {
  const { mint, photoBox, card, dots } = STORY_SPOTLIGHT.mobile;

  return (
    <div
      className={`${styles.stage}${className ? ` ${className}` : ''}`}
      role="group"
      aria-label="Customer success stories"
    >
      <div
        className={styles.mint}
        style={{
          left: `${mint.x}%`,
          top: `${mint.y}%`,
          width: `${mint.w}%`,
          height: `${mint.h}%`,
        }}
      />
      <div
        className={styles.photo}
        style={{
          left: `${photoBox.x}%`,
          top: `${photoBox.y}%`,
          width: `${photoBox.w}%`,
          height: `${photoBox.h}%`,
        }}
      >
        <StoryPhotos slides={slides} index={index} mobile />
      </div>
      <article
        className={styles.card}
        style={{
          left: `${card.x}%`,
          top: `${card.y}%`,
          width: `${card.w}%`,
        }}
        aria-live="polite"
      >
        <StoryCardCopy slide={slide} />
      </article>
      <CarouselDots
        count={slides.length}
        index={index}
        onSelect={onSelect}
        style={{ top: `${dots.y}%` }}
      />
    </div>
  );
}

/** Active portrait only — swap is instant so photo and copy never desync. */
function StoryPhotos({
  slides,
  index,
  mobile = false,
}: {
  slides: readonly StorySlide[];
  index: number;
  mobile?: boolean;
}) {
  const entry = slides[index] ?? slides[0];
  const crop = mobile ? entry.mobilePhotoCrop : entry.photoCrop;

  return (
    <img
      key={entry.id}
      src={entry.photo}
      alt=""
      draggable={false}
      className={styles.photoImg}
      data-fit={entry.photoFit}
      style={{
        left: `${crop.x}%`,
        top: `${crop.y}%`,
        width: `${crop.w}%`,
        height: `${crop.h}%`,
      }}
    />
  );
}

function StoryCardCopy({
  slide,
  desktop = false,
}: {
  slide: StorySlide;
  desktop?: boolean;
}) {
  return (
    <div className={styles.cardCopy}>
      <p className={styles.cardEyebrow}>{slide.eyebrow}</p>
      <p className={styles.cardHeadline}>{slide.headline}</p>
      <p className={styles.cardDetail}>
        {desktop ? (
          <>
            <span className={styles.cardDetailMuted}>
              {slide.detailBefore}
            </span>{' '}
            <span className={styles.cardDetailStrong}>{slide.detailAfter}</span>
          </>
        ) : (
          <>
            {slide.detailBefore} {slide.detailAfter}
          </>
        )}
      </p>
    </div>
  );
}

function CarouselDots({
  count,
  index,
  onSelect,
  style,
}: {
  count: number;
  index: number;
  onSelect: (next: number) => void;
  style: CSSProperties;
}) {
  return (
    <div className={styles.dots} style={style} role="tablist" aria-label="Stories">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          className={styles.dot}
          data-active={i === index ? '' : undefined}
          aria-selected={i === index}
          aria-label={`Show story ${i + 1}`}
          onClick={() => onSelect(i)}
        />
      ))}
    </div>
  );
}
