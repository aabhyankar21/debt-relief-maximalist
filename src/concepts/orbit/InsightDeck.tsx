import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useMediaQuery } from '../../engine/useMediaQuery';
import ringsSrc from './assets/rings.png';
import {
  ORBIT_GLOBE,
  ORBIT_GLOBE_PEOPLE,
  ORBIT_GLOBE_PEOPLE_MOBILE,
  ORBIT_MOTION,
  ORBIT_STATS_CARD,
  type OrbitGlobePerson,
} from './config';
import styles from './insightDeck.module.css';

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

function sphereBoxOnStage(compact: boolean) {
  const { sphere } = ORBIT_GLOBE;
  if (!compact) {
    return { x: sphere.x, y: sphere.y, w: sphere.w };
  }
  /** Centered in the mobile 268 canvas — slightly smaller than desktop ratio. */
  const w = 52;
  const origin = (100 - w) / 2;
  return { x: origin, y: origin, w };
}

function mapBoxOnStage(compact: boolean) {
  const sphere = sphereBoxOnStage(compact);
  const { mapBox } = ORBIT_GLOBE;
  return {
    x: sphere.x + (mapBox.x / 100) * sphere.w,
    y: sphere.y + (mapBox.y / 100) * sphere.w,
    w: (mapBox.w / 100) * sphere.w,
    h: (mapBox.h / 100) * sphere.w,
  };
}

function pinOnStage(pin: { x: number; y: number }, compact: boolean) {
  const box = mapBoxOnStage(compact);
  return {
    x: box.x + (pin.x / 100) * box.w,
    y: box.y + (pin.y / 100) * box.h,
  };
}

/**
 * Step 1 left stage — globe with US map + holographic isometric tiles.
 * Desktop: orbit rings, translucent blue portraits, hover-expand clarity.
 * Mobile: short window of the same language, no headline.
 */
export function InsightDeck({ className }: { className?: string }) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const reduceMotion = useReducedMotion() ?? false;
  const motionOn = isDesktop && !reduceMotion;
  const ringsSpin = !reduceMotion;
  const [entered, setEntered] = useState(!motionOn);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const people = isDesktop ? ORBIT_GLOBE_PEOPLE : ORBIT_GLOBE_PEOPLE_MOBILE;

  useEffect(() => {
    if (!motionOn) {
      setEntered(true);
      return;
    }
    setEntered(false);
    const ms =
      (ORBIT_MOTION.enterStaggerSec * (people.length - 1) +
        ORBIT_MOTION.enterDurSec +
        0.05) *
      1000;
    const timer = window.setTimeout(() => setEntered(true), ms);
    return () => window.clearTimeout(timer);
  }, [motionOn, people.length]);

  return (
    <div
      className={`${styles.deck}${className ? ` ${className}` : ''}`}
      data-mobile={!isDesktop || undefined}
      aria-hidden="true"
    >
      <div className={styles.canvas}>
        <motion.img
          className={styles.rings}
          src={ringsSrc}
          alt=""
          draggable={false}
          initial={
            ringsSpin ? { scale: motionOn ? 0.94 : 1, rotate: 0 } : false
          }
          animate={
            ringsSpin ? { scale: 1, rotate: 360 } : { scale: 1, rotate: 0 }
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

        <Globe
          enter={motionOn}
          people={people}
          hoveredId={hoveredId}
          compact={!isDesktop}
          showHeadline={isDesktop}
          alive={!reduceMotion}
        />

        <StemLayer
          people={people}
          activeId={hoveredId}
          enter={motionOn}
          compact={!isDesktop}
        />

        {people.map((person, index) => (
          <IsoTile
            key={person.id}
            person={person}
            index={index}
            motionOn={motionOn}
            entered={entered}
            isHovered={hoveredId === person.id}
            dimmed={hoveredId !== null && hoveredId !== person.id}
            onHoverStart={() => setHoveredId(person.id)}
            onHoverEnd={() =>
              setHoveredId((current) =>
                current === person.id ? null : current,
              )
            }
          />
        ))}
      </div>
    </div>
  );
}

function Globe({
  enter,
  people,
  hoveredId,
  compact = false,
  showHeadline = false,
  alive = false,
}: {
  enter: boolean;
  people: readonly OrbitGlobePerson[];
  hoveredId: string | null;
  compact?: boolean;
  showHeadline?: boolean;
  alive?: boolean;
}) {
  const { mapBox } = ORBIT_GLOBE;
  const box = sphereBoxOnStage(compact);

  return (
    <motion.div
      className={styles.globe}
      style={{
        left: `${box.x}%`,
        top: `${box.y}%`,
        width: `${box.w}%`,
      }}
      data-alive={alive || undefined}
      initial={enter ? { opacity: 0, scale: 0.92 } : false}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: EASE_OUT }}
    >
      <div className={styles.globeHalo} />
      <div className={styles.globeSphere}>
        <GlobeGrid alive={alive} />
        <div
          className={styles.mapLayer}
          style={{
            left: `${mapBox.x}%`,
            top: `${mapBox.y}%`,
            width: `${mapBox.w}%`,
            height: `${mapBox.h}%`,
          }}
        >
          <img
            className={styles.mapImage}
            src={ORBIT_GLOBE.map}
            alt=""
            draggable={false}
          />
          {ORBIT_GLOBE.dots.map((dot, index) => (
            <span
              key={dot.id}
              className={styles.cityDot}
              style={{
                left: `${dot.x}%`,
                top: `${dot.y}%`,
                animationDelay: alive ? `${(index % 7) * 0.35}s` : undefined,
              }}
            />
          ))}
          {people.map((person, index) => {
            const active = hoveredId === person.id;
            return (
              <span
                key={person.id}
                className={`${styles.cityPin}${
                  active ? ` ${styles.cityPinActive}` : ''
                }`}
                style={{
                  left: `${person.pin.x}%`,
                  top: `${person.pin.y}%`,
                  animationDelay: alive ? `${(index % 5) * 0.45}s` : undefined,
                }}
              />
            );
          })}
        </div>
        <div className={styles.globeShade} />
        <span className={styles.globeSheen} aria-hidden />
        {showHeadline ? (
          <motion.p
            className={styles.globeHeadline}
            initial={enter ? { opacity: 0, scale: 0.96 } : false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              delay: enter ? 0.22 : 0,
              ease: EASE_OUT,
            }}
          >
            {ORBIT_STATS_CARD.headline}
          </motion.p>
        ) : null}
      </div>
    </motion.div>
  );
}

function GlobeGrid({ alive = false }: { alive?: boolean }) {
  return (
    <svg
      className={styles.globeGrid}
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
      data-alive={alive || undefined}
    >
      <circle cx="100" cy="100" r="98" />
      <ellipse cx="100" cy="100" rx="98" ry="30" />
      <ellipse cx="100" cy="100" rx="98" ry="56" />
      <ellipse cx="100" cy="100" rx="98" ry="78" />
      <ellipse cx="100" cy="100" rx="30" ry="98" />
      <ellipse cx="100" cy="100" rx="56" ry="98" />
      <ellipse cx="100" cy="100" rx="78" ry="98" />
      <line x1="2" y1="100" x2="198" y2="100" />
      <line x1="100" y1="2" x2="100" y2="198" />
    </svg>
  );
}

function StemLayer({
  people,
  activeId,
  enter,
  compact = false,
}: {
  people: readonly OrbitGlobePerson[];
  activeId: string | null;
  enter: boolean;
  compact?: boolean;
}) {
  return (
    <motion.svg
      className={styles.stems}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
      initial={enter ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.15 }}
    >
      {people.map((person) => {
        const pin = pinOnStage(person.pin, compact);
        const tileX = person.x + person.size / 2;
        const tileY = person.y + person.size / 2;
        const active = activeId === person.id;
        return (
          <line
            key={person.id}
            x1={pin.x}
            y1={pin.y}
            x2={tileX}
            y2={tileY}
            className={active ? styles.stemActive : styles.stem}
          />
        );
      })}
    </motion.svg>
  );
}

function IsoTile({
  person,
  index,
  motionOn,
  entered,
  isHovered,
  dimmed,
  onHoverStart,
  onHoverEnd,
}: {
  person: OrbitGlobePerson;
  index: number;
  motionOn: boolean;
  entered: boolean;
  isHovered: boolean;
  dimmed: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}) {
  const floatAmp =
    ORBIT_MOTION.floatAmps[index % ORBIT_MOTION.floatAmps.length] * 0.55;
  const floatDur =
    ORBIT_MOTION.floatDurations[index % ORBIT_MOTION.floatDurations.length];
  const crop = person.crop;
  const expanded = isHovered;

  return (
    <motion.div
      className={styles.tile}
      style={
        {
          left: `${person.x}%`,
          top: `${person.y}%`,
          width: `${person.size}%`,
          zIndex: expanded ? 40 : 10 + person.z,
        } as CSSProperties
      }
      initial={
        motionOn
          ? {
              opacity: 0,
              scale: 0.72,
              rotateX: person.pitch + 8,
              rotateY: person.yaw,
              rotateZ: person.roll,
              z: 20,
            }
          : false
      }
      animate={{
        opacity: dimmed ? 0.28 : 1,
        scale: expanded ? ORBIT_MOTION.hoverScale : 1,
        rotateX: expanded ? 0 : person.pitch,
        rotateY: expanded ? 0 : person.yaw,
        rotateZ: expanded ? 0 : person.roll,
        z: expanded ? 120 : 48,
      }}
      transition={
        entered
          ? {
              type: 'spring',
              ...ORBIT_MOTION.hoverSpring,
            }
          : {
              duration: motionOn ? ORBIT_MOTION.enterDurSec : 0.01,
              delay: motionOn ? index * ORBIT_MOTION.enterStaggerSec : 0,
              ease: EASE_OUT,
            }
      }
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
    >
      <motion.div
        className={`${styles.tileLift}${
          expanded ? ` ${styles.tileLiftOpen}` : ''
        }`}
        animate={
          !motionOn || !entered || expanded
            ? { y: 0 }
            : { y: [0, -floatAmp, 0, floatAmp * 0.45, 0] }
        }
        transition={
          !motionOn || !entered || expanded
            ? { duration: 0.2 }
            : {
                duration: floatDur,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: index * 0.1,
              }
        }
      >
        <div className={styles.tilePlate}>
          <span className={styles.tileHud} data-pos="tl" />
          <span className={styles.tileHud} data-pos="tr" />
          <span className={styles.tileHud} data-pos="bl" />
          <span className={styles.tileHud} data-pos="br" />
          {crop ? (
            <img
              src={person.image}
              alt=""
              draggable={false}
              style={{
                left: `${crop.x}%`,
                top: `${crop.y}%`,
                width: `${crop.w}%`,
                height: `${crop.h}%`,
              }}
            />
          ) : (
            <img src={person.image} alt="" draggable={false} />
          )}
          <span className={styles.tileWash} aria-hidden />
        </div>
        <span className={styles.tileLabel}>{person.city}</span>
      </motion.div>
    </motion.div>
  );
}
