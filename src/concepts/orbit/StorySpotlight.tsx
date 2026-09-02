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
 * Left-stage collage for Orbit step 2.
 * Desktop: rings + portrait + glass outcome card + carousel.
 * Mobile: glass banner + cutout stacked on the form sheet edge.
 */
export function StorySpotlight({ className }: { className?: string }) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const reduceMotion = useReducedMotion() ?? false;
  const motionOn = isDesktop && !reduceMotion;
  const ringsSpin = isDesktop && !reduceMotion;
  const alive = !reduceMotion;

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
        alive={alive}
      />
    );
  }

  const { photoBox, callout } = STORY_SPOTLIGHT;
  const dotsY = STORY_SPOTLIGHT.dots.y;

  return (
    <div
      className={`${styles.stage}${className ? ` ${className}` : ''}`}
      data-alive={alive || undefined}
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
          className={styles.photo}
          style={{
            left: `${photoBox.x}%`,
            top: `${photoBox.y}%`,
            width: `${photoBox.w}%`,
            height: `${photoBox.h}%`,
          }}
          initial={motionOn ? { scale: 0.96, y: 12 } : false}
          animate={{ scale: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE_OUT }}
        >
          <span className={styles.photoHalo} aria-hidden="true" />
          <StoryPhotos slides={slides} index={index} />
        </motion.div>

        <motion.article
          className={styles.callout}
          style={{
            left: `${callout.x}%`,
            top: `${callout.y}%`,
            width: `${callout.w}%`,
          }}
          initial={motionOn ? { scale: 0.98, opacity: 0, y: 10 } : false}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: motionOn ? 0.18 : 0,
            ease: EASE_OUT,
          }}
          aria-live="polite"
        >
          <span className={styles.calloutSheen} />
          <StoryCardCopy slide={slide} />
        </motion.article>

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
  alive,
}: {
  className?: string;
  slides: readonly StorySlide[];
  slide: StorySlide;
  index: number;
  onSelect: (next: number) => void;
  alive: boolean;
}) {
  const { callout } = STORY_SPOTLIGHT.mobile;

  return (
    <div
      className={`${styles.stage}${className ? ` ${className}` : ''}`}
      data-alive={alive || undefined}
      role="group"
      aria-label="Customer success stories"
    >
      <div className={styles.canvas}>
        {/*
          Mobile photo size is CSS-owned (cqw). Cutouts use contain +
          overflow:visible so sides aren’t re-cropped by a mask.
        */}
        <div className={styles.photo}>
          <StoryPhotos slides={slides} index={index} mobile />
        </div>

        <article
          className={styles.callout}
          style={{
            left: `${callout.x}%`,
            top: `${callout.y}%`,
            width: `${callout.w}%`,
            height: `${callout.h}%`,
          }}
          aria-live="polite"
        >
          <span className={styles.calloutSheen} />
          <div className={styles.mobileCopy}>
            <StoryCardCopy slide={slide} />
          </div>
        </article>

        <CarouselDots
          count={slides.length}
          index={index}
          onSelect={onSelect}
          style={{ bottom: '8px', top: 'auto' }}
        />
      </div>
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
  const crop = entry.photoCrop;

  if (mobile) {
    return (
      <img
        key={entry.id}
        src={entry.photo}
        alt=""
        draggable={false}
        className={styles.photoImg}
        data-fit={entry.photoFit}
      />
    );
  }

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

function StoryCardCopy({ slide }: { slide: StorySlide }) {
  return (
    <>
      <span className={styles.badge}>
        <span className={styles.badgeDot} />
        {STORY_SPOTLIGHT.badgeLabel}
      </span>
      <p className={styles.cardEyebrow}>{slide.eyebrow}</p>
      <p className={styles.cardHeadline}>{slide.headline}</p>
      <p className={styles.cardDetail}>
        <span className={styles.cardDetailMuted}>{slide.detailBefore}</span>{' '}
        <span className={styles.cardDetailStrong}>{slide.detailAfter}</span>
      </p>
    </>
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
