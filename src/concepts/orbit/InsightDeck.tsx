import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useMediaQuery } from '../../engine/useMediaQuery';
import ringsSrc from './assets/rings.png';
import {
  ORBIT_AVATARS,
  ORBIT_AVATARS_MOBILE,
  ORBIT_MOTION,
  ORBIT_STATS_CARD,
  type OrbitAvatar,
} from './config';
import styles from './insightDeck.module.css';

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/**
 * Step 1 left stage — dashed rings + circular photo avatars.
 * Desktop (Figma 159:11695): full orbit + cream stats card.
 * Mobile (Figma 192:13248): shorter window of 5 avatars, no stats card.
 */
export function InsightDeck({ className }: { className?: string }) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const reduceMotion = useReducedMotion() ?? false;
  const motionOn = isDesktop && !reduceMotion;
  const ringsSpin = !reduceMotion;
  const [entered, setEntered] = useState(!motionOn);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const avatars = isDesktop ? ORBIT_AVATARS : ORBIT_AVATARS_MOBILE;

  useEffect(() => {
    if (!motionOn) {
      setEntered(true);
      setHoveredId(null);
      return;
    }
    setEntered(false);
    const ms =
      (ORBIT_MOTION.enterStaggerSec * (avatars.length - 1) +
        ORBIT_MOTION.enterDurSec +
        0.05) *
      1000;
    const timer = window.setTimeout(() => setEntered(true), ms);
    return () => window.clearTimeout(timer);
  }, [motionOn, avatars.length]);

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

        {avatars.map((avatar, index) => (
          <AvatarBubble
            key={avatar.id}
            avatar={avatar}
            index={index}
            motionOn={motionOn}
            entered={entered}
            hoveredId={hoveredId}
            onHoverStart={
              motionOn ? () => setHoveredId(avatar.id) : undefined
            }
            onHoverEnd={motionOn ? () => setHoveredId(null) : undefined}
          />
        ))}

        {isDesktop ? (
          <motion.article
            className={styles.statsCard}
            style={{
              left: `${ORBIT_STATS_CARD.x}%`,
              top: `${ORBIT_STATS_CARD.y}%`,
              width: `${ORBIT_STATS_CARD.w}%`,
            }}
            initial={motionOn ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.45,
              delay: motionOn ? 0.28 : 0,
              ease: EASE_OUT,
            }}
          >
            <p className={styles.statsHeadline}>{ORBIT_STATS_CARD.headline}</p>
            <div className={styles.statsRow}>
              {ORBIT_STATS_CARD.stats.map((stat) => (
                <div key={stat.label} className={styles.stat}>
                  <p className={styles.statValue}>{stat.value}</p>
                  <p className={styles.statLabel}>{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.article>
        ) : null}
      </div>
    </div>
  );
}

function AvatarBubble({
  avatar,
  index,
  motionOn,
  entered,
  hoveredId,
  onHoverStart,
  onHoverEnd,
}: {
  avatar: OrbitAvatar;
  index: number;
  motionOn: boolean;
  entered: boolean;
  hoveredId: string | null;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}) {
  const isHovered = motionOn && hoveredId === avatar.id;
  const floatAmp =
    ORBIT_MOTION.floatAmps[index % ORBIT_MOTION.floatAmps.length];
  const floatDur =
    ORBIT_MOTION.floatDurations[index % ORBIT_MOTION.floatDurations.length];
  const crop = avatar.crop;

  return (
    <motion.div
      className={styles.avatar}
      style={{
        left: `${avatar.x}%`,
        top: `${avatar.y}%`,
        width: `${avatar.size}%`,
        height: `${avatar.size}%`,
        zIndex: isHovered ? 20 : avatar.z,
      }}
      initial={
        motionOn
          ? { opacity: 0, scale: 0.72, rotate: avatar.rotate - 8 }
          : false
      }
      animate={{
        opacity: 1,
        scale: isHovered ? 1.12 : 1,
        rotate: avatar.rotate,
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
        className={styles.avatarInner}
        animate={
          !motionOn || !entered || isHovered
            ? { y: 0 }
            : { y: [0, -floatAmp, 0, floatAmp * 0.45, 0] }
        }
        transition={
          !motionOn || !entered || isHovered
            ? { duration: 0.2 }
            : {
                duration: floatDur,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: index * 0.1,
              }
        }
      >
        {crop ? (
          <img
            src={avatar.image}
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
          <img src={avatar.image} alt="" draggable={false} />
        )}
      </motion.div>
    </motion.div>
  );
}
