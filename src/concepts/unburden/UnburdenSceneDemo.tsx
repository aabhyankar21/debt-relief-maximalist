import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { steps } from '../../data/journey';
import { PulseTitle } from '../pulse/PulseTitle';
import { UnburdenScene } from './UnburdenScene';
import { type MassFieldStats } from './MassField';
import {
  DEBT_AMOUNT_OPTIONS,
  DEBT_BAND_WEIGHT,
  POSE_NOTES,
  heldCount,
  isSpreadScene,
  particleBudget,
  poseForScene,
} from './config';
import unburden from './unburden.module.css';
import styles from './unburdenSceneDemo.module.css';
import './theme.css';

const DEBT_AMOUNT_LABELS: Record<string, string> = {
  '16-20': '$16K - $20K',
  '21-25': '$21K - $25K',
  '26-30': '$26K - $30K',
  '31-35': '$31K - $35K',
  '35-plus': '$35K+',
};

const DEBT_TYPE_OPTIONS = [
  { id: '', label: 'All — blurred pile' },
  { id: 'personal-loans', label: 'Personal Loans' },
  { id: 'credit-card', label: 'Credit Card' },
  { id: 'medical', label: 'Medical' },
  { id: 'student', label: 'Student' },
];

const JOURNEY_INDEX_BY_SCENE: Record<number, number | null> = {
  1: 0,
  2: 1,
  3: 2,
  4: 3,
  5: 4,
  6: 4,
  7: 5,
  8: 6,
  9: null,
};

const PRESETS = [
  { id: 'mobile', label: 'Mobile · 375', width: 375, height: 760 },
  { id: 'tablet', label: 'Tablet · 768', width: 768, height: 920 },
  { id: 'laptop', label: 'Laptop · 1024', width: 1024, height: 700 },
  { id: 'desktop', label: 'Desktop · 1440', width: 1440, height: 840 },
  { id: 'fluid', label: 'Fluid', width: null as number | null, height: 720 },
];

function readParam(key: string, fallback: string) {
  return new URLSearchParams(window.location.search).get(key) ?? fallback;
}

function writeParam(key: string, value: string) {
  const params = new URLSearchParams(window.location.search);
  params.set(key, value);
  window.history.replaceState(null, '', `?${params.toString()}`);
}

function MockForm({ scene }: { scene: number }) {
  const journeyIndex = JOURNEY_INDEX_BY_SCENE[scene];
  const step = journeyIndex == null ? null : steps[journeyIndex];
  const weight = scene === 1 || scene === 2 || scene === 7 || scene === 9;

  return (
    <div className={unburden.stepWrap}>
      <header>
        {step ? (
          <>
            {step.eyebrow ? (
              <p className={styles.mockEyebrow}>{step.eyebrow}</p>
            ) : null}
            <PulseTitle
              key={`heading-${scene}`}
              text={step.heading}
              as="h2"
              className={styles.mockHeading}
              animateWeight={weight}
              tick={weight}
            />
            {step.question ? (
              <PulseTitle
                key={`question-${scene}`}
                text={step.question}
                as="h3"
                className={styles.mockQuestion}
                animateWeight={weight}
              />
            ) : null}
          </>
        ) : (
          <PulseTitle
            key="result"
            text="Weight off the shoulders"
            as="h2"
            className={styles.mockHeading}
            animateWeight
            tick
          />
        )}
      </header>
    </div>
  );
}

export function UnburdenSceneDemo() {
  const [scene, setScene] = useState(() => {
    const parsed = Number(readParam('s', '1'));
    return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 9) : 1;
  });
  const [debtAmount, setDebtAmount] = useState(() =>
    readParam('amount', '35-plus'),
  );
  const [debtType, setDebtType] = useState(
    () => readParam('type', '') || null,
  );
  const [presetId, setPresetId] = useState(() => readParam('w', 'desktop'));
  const [showForm, setShowForm] = useState(
    () => readParam('layout', 'form') === 'form',
  );
  const [simulateReduced, setSimulateReduced] = useState(
    () => readParam('rm', '0') === '1',
  );

  const [stats, setStats] = useState<MassFieldStats | null>(null);
  const onStats = useCallback((next: MassFieldStats) => setStats(next), []);

  const preset = PRESETS.find((option) => option.id === presetId) ?? PRESETS[3];
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

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|SELECT|TEXTAREA)$/.test(target.tagName)) return;
      const next =
        event.key === 'ArrowRight'
          ? Math.min(9, scene + 1)
          : event.key === 'ArrowLeft'
            ? Math.max(1, scene - 1)
            : null;
      if (next === null) return;
      setScene(next);
      writeParam('s', String(next));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [scene]);

  const band = DEBT_BAND_WEIGHT[debtAmount] ?? 1;
  const pose = poseForScene(scene);
  const expected = heldCount(scene, band);

  const sceneNode = (
    <UnburdenScene
      step={scene}
      debtAmountBand={band}
      spotlightId={scene === 2 ? debtType : null}
      reducedMotion={simulateReduced}
      onStats={onStats}
    />
  );

  return (
    <div className={styles.lab} data-concept="unburden">
      <header className={styles.bar}>
        <div className={styles.title}>
          <h1>Unburden</h1>
          <p>
            Scene 2 swaps the hand for a blurred pile of debt-type stills.
            Scenes 3–5 and 8 use floating stills (contact, calendar, phone,
            address). Scene 9 drops the figure, centres the form, and
            spreads the cluster around the page. Arrow keys scrub scenes.
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
          pose <strong>{pose}</strong>
        </span>
        <span className={styles.stat}>
          held <strong>{stats?.held ?? expected}</strong>
        </span>
        <span className={styles.stat}>
          releasing <strong>{stats?.releasing ?? 0}</strong>
        </span>
        <span className={styles.stat}>
          budget <strong>{particleBudget(band)}</strong>
        </span>
        <span className={styles.statNote}>{POSE_NOTES[pose]}</span>
      </div>

      <div className={styles.controls}>
        <label className={styles.control} data-wide="true">
          <span className={styles.controlLabel}>
            Scene <strong>{scene}</strong>
          </span>
          <input
            type="range"
            min={1}
            max={9}
            step={1}
            value={scene}
            onChange={(event) => {
              setScene(Number(event.target.value));
              writeParam('s', event.target.value);
            }}
          />
        </label>

        <label className={styles.control}>
          <span className={styles.controlLabel}>debtAmountBand</span>
          <select
            value={debtAmount}
            onChange={(event) => {
              setDebtAmount(event.target.value);
              writeParam('amount', event.target.value);
            }}
          >
            {DEBT_AMOUNT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {DEBT_AMOUNT_LABELS[option]}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.control}>
          <span className={styles.controlLabel}>debt type spotlight</span>
          <select
            value={debtType ?? ''}
            onChange={(event) => {
              const next = event.target.value || null;
              setDebtType(next);
              writeParam('type', next ?? '');
            }}
          >
            {DEBT_TYPE_OPTIONS.map((option) => (
              <option key={option.id || 'all'} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.control}>
          <span className={styles.controlLabel}>Layout</span>
          <button
            type="button"
            className={styles.toggle}
            data-active={showForm ? 'true' : undefined}
            onClick={() =>
              setShowForm((value) => {
                writeParam('layout', value ? 'scene' : 'form');
                return !value;
              })
            }
          >
            {showForm ? 'Form + figure' : 'Figure only'}
          </button>
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
                return !value;
              })
            }
          >
            {simulateReduced ? 'Simulated on' : 'Following the OS'}
          </button>
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
            {showForm ? (
              <div
                className={unburden.root}
                data-unburden-root=""
                data-unburden-layout={isSpreadScene(scene) ? 'spread' : undefined}
              >
                <div className={unburden.shell}>
                  <header className={unburden.header} data-unburden-header="">
                    <div className={unburden.headerRow}>
                      <span className={styles.mockBrand}>Unburden</span>
                      <span className={styles.mockBadge}>
                        Trusted by 100k+ people
                      </span>
                    </div>
                  </header>
                  <div className={unburden.content}>
                    <div className={unburden.stage}>
                      <div className={unburden.sceneSlot} data-unburden-slot="" aria-hidden="true">
                        {sceneNode}
                      </div>
                      <div className={unburden.formCol} data-unburden-form="">
                        <MockForm scene={scene} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className={unburden.root} data-unburden-root="" data-unburden-solo="">
                <div className={unburden.sceneSlot} data-unburden-slot="" aria-hidden="true">
                  {sceneNode}
                </div>
              </div>
            )}
          </div>
        </div>
      </MotionConfig>
    </div>
  );
}
