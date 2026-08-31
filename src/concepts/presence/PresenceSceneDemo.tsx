import { useLayoutEffect, useRef, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { DebtAmountStep } from './DebtAmountStep';
import {
  DEBT_AMOUNT_OPTIONS,
  PRESENCE_CONFIG,
  glowIntensityForBand,
} from './config';
import styles from './presenceSceneDemo.module.css';
import './theme.css';

interface Preset {
  id: string;
  label: string;
  width: number | null;
  height: number;
}

const PRESETS: Preset[] = [
  { id: 'mobile', label: 'Mobile · 375', width: 375, height: 760 },
  { id: 'tablet', label: 'Tablet · 768', width: 768, height: 920 },
  { id: 'desktop', label: 'Desktop · 1024', width: 1024, height: 700 },
  { id: 'wide', label: 'Wide · 1440', width: 1440, height: 840 },
  { id: 'fluid', label: 'Fluid', width: null, height: 720 },
];

function readParam(key: string, fallback: string) {
  return new URLSearchParams(window.location.search).get(key) ?? fallback;
}

function writeParam(key: string, value: string) {
  const params = new URLSearchParams(window.location.search);
  params.set(key, value);
  window.history.replaceState(null, '', `?${params.toString()}`);
}

/**
 * Lab for Presence step 1: replay the load-in, toggle reduced motion,
 * and preview mobile / tablet / desktop breakpoints without changing OS settings.
 */
export function PresenceSceneDemo() {
  const [playId, setPlayId] = useState(0);
  const [selectedBand, setSelectedBand] = useState<string | null>(() => {
    const raw = readParam('band', '');
    return DEBT_AMOUNT_OPTIONS.some((option) => option.id === raw) ? raw : null;
  });
  const [presetId, setPresetId] = useState(() => readParam('w', 'desktop'));
  const [simulateReduced, setSimulateReduced] = useState(
    () => readParam('rm', '0') === '1',
  );

  const preset = PRESETS.find((option) => option.id === presetId) ?? PRESETS[2];
  const holderRef = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState(0);

  useLayoutEffect(() => {
    const node = holderRef.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      setAvailable(entry.contentRect.width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const frameWidth = preset.width;
  const zoom =
    frameWidth && available > 0 ? Math.min(1, available / frameWidth) : 1;
  const intensity = glowIntensityForBand(selectedBand);
  const bandLabel =
    DEBT_AMOUNT_OPTIONS.find((option) => option.id === selectedBand)?.label ??
    'none';

  return (
    <div className={styles.lab} data-concept="presence">
      <header className={styles.bar}>
        <div className={styles.title}>
          <h1>Presence · DebtAmountStep</h1>
          <p>
            Step 1 only — full-bleed photo, scrim lighting, generative glow,
            and the debt-amount question on the image. Replay the load-in,
            force reduced motion, and scrub breakpoints.
          </p>
        </div>

        <div className={styles.presets} role="group" aria-label="Preview width">
          {PRESETS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={styles.preset}
              data-active={option.id === presetId ? 'true' : undefined}
              onClick={() => {
                setPresetId(option.id);
                writeParam('w', option.id);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </header>

      <div className={styles.readout} role="status">
        <span className={styles.stat}>
          band <strong>{bandLabel}</strong>
        </span>
        <span className={styles.stat}>
          glow <strong>{intensity.toFixed(2)}</strong>
        </span>
        <span className={styles.stat}>
          idle <strong>{PRESENCE_CONFIG.glow.idleIntensity.toFixed(2)}</strong>
        </span>
        <span className={styles.stat}>
          play <strong>#{playId}</strong>
        </span>
      </div>

      <div className={styles.controls}>
        <label className={styles.control}>
          <span className={styles.controlLabel}>Load-in</span>
          <button
            type="button"
            className={styles.action}
            onClick={() => {
              setSelectedBand(null);
              writeParam('band', '');
              setPlayId((value) => value + 1);
            }}
          >
            Replay intro
          </button>
          <span className={styles.note}>
            Remounts the screen and clears the selection so the idle glow
            returns.
          </span>
        </label>

        <label className={styles.control}>
          <span className={styles.controlLabel}>prefers-reduced-motion</span>
          <button
            type="button"
            className={styles.toggle}
            data-active={simulateReduced ? 'true' : undefined}
            onClick={() =>
              setSimulateReduced((value) => {
                writeParam('rm', value ? '0' : '1');
                setPlayId((play) => play + 1);
                return !value;
              })
            }
          >
            {simulateReduced ? 'Simulated on' : 'Following the OS'}
          </button>
          <span className={styles.note}>
            Static photo, fixed low glow, 200ms selection cross-fade, 300ms
            screen fade.
          </span>
        </label>

        <label className={styles.control}>
          <span className={styles.controlLabel}>Selection</span>
          <button
            type="button"
            className={styles.toggle}
            onClick={() => {
              setSelectedBand(null);
              writeParam('band', '');
            }}
          >
            Clear band
          </button>
          <span className={styles.note}>
            Or tap a pill in the frame. Glow intensity maps from config.
          </span>
        </label>
      </div>

      <MotionConfig reducedMotion={simulateReduced ? 'always' : 'user'}>
        <div className={styles.holder} ref={holderRef}>
          <div
            className={styles.frame}
            style={{
              width: frameWidth ? `${frameWidth}px` : '100%',
              height: `${preset.height}px`,
              transform: zoom < 1 ? `scale(${zoom})` : undefined,
              marginBottom:
                zoom < 1 ? `${-preset.height * (1 - zoom)}px` : undefined,
            }}
          >
            <DebtAmountStep
              key={playId}
              selectedBand={selectedBand}
              onSelect={(band) => {
                setSelectedBand(band);
                writeParam('band', band);
              }}
            />
          </div>
        </div>
      </MotionConfig>

      <p className={styles.footnote}>
        Photo asset is a painted placeholder until cinemagraph footage lands.
        Progress fill stays the existing blue; selected pills use terracotta.
        Frame is resizable from its bottom-right corner.
      </p>
    </div>
  );
}
