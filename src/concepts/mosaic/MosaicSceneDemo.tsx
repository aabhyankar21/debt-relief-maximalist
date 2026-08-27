import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { steps } from '../../data/journey';
import { PulseTitle } from '../pulse/PulseTitle';
import { MosaicGrid, type MosaicGridStats } from './MosaicGrid';
import {
  DEBT_AMOUNT_OPTIONS,
  DEBT_BAND_WEIGHT,
  DEBT_TYPE_MATCH_INDEX,
  DEBT_TYPE_OPTIONS,
  MOSAIC_CONFIG,
  filledThroughStep,
  tilesForStep,
} from './config';
import mosaic from './mosaic.module.css';
import styles from './mosaicSceneDemo.module.css';
import './theme.css';

const DEBT_AMOUNT_LABELS: Record<string, string> = {
  '16-20': '$16K - $20K',
  '21-25': '$21K - $25K',
  '26-30': '$26K - $30K',
  '31-35': '$31K - $35K',
  '35-plus': '$35K+',
};

const DEBT_TYPE_LABELS: Record<string, string> = {
  'personal-loans': 'Personal Loans',
  'credit-card': 'Credit Card',
  medical: 'Medical',
  student: 'Student',
};

const SCENE_NOTES: Record<number, string> = {
  1: 'First step: 6–14 clay tiles, scaled by the debt band, spiral out from centre with a 50ms stagger.',
  2: 'Eight more clay tiles. Matched types (cards / personal loans) boost saturation on this cluster.',
  3: 'Three dusty-teal tiles, no stagger — a quiet personal-info beat.',
  4: 'Two teal tiles. Quietest step in the flow.',
  5: 'Three teal tiles, same quiet treatment as name/email.',
  6: 'Four blue-teal tiles with a stroke-drawn check instead of a bloom fill.',
  7: 'Largest variable cluster: 12–20 gold tiles, scaled by the income band.',
  8: 'Six gold tiles. Almost there, not a big beat.',
  9: 'Remaining tiles fill together, then one whole-mosaic bloom.',
};

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

interface Preset {
  id: string;
  label: string;
  width: number | null;
  height: number;
}

const PRESETS: Preset[] = [
  { id: 'mobile', label: 'Mobile · 375', width: 375, height: 760 },
  { id: 'tablet', label: 'Tablet · 768', width: 768, height: 920 },
  { id: 'laptop', label: 'Laptop · 1024', width: 1024, height: 700 },
  { id: 'desktop', label: 'Desktop · 1440', width: 1440, height: 840 },
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

function MockForm({ scene }: { scene: number }) {
  const journeyIndex = JOURNEY_INDEX_BY_SCENE[scene];
  const step = journeyIndex == null ? null : steps[journeyIndex];
  const weight = scene === 1 || scene === 2 || scene === 7 || scene === 9;

  return (
    <div className={mosaic.stepWrap}>
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
            {step.subtext ? (
              <p className={styles.mockBody}>{step.subtext}</p>
            ) : null}
          </>
        ) : (
          <PulseTitle
            key="result"
            text="We Highly Recommend Getting Multiple Estimates"
            as="h2"
            className={styles.mockHeading}
            animateWeight
            tick
          />
        )}
      </header>
      <div className={styles.mockChoices}>
        {['$16K - $20K', '$21K - $25K', '$26K - $30K'].map((label) => (
          <span key={label} className={styles.mockChoice}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function MosaicSceneDemo() {
  const [scene, setScene] = useState(() => {
    const parsed = Number(readParam('s', '1'));
    return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 9) : 1;
  });
  const [debtAmount, setDebtAmount] = useState(() =>
    readParam('amount', '26-30'),
  );
  const [debtType, setDebtType] = useState(() =>
    readParam('type', 'credit-card'),
  );
  const [incomeBand, setIncomeBand] = useState(() =>
    Number(readParam('income', '0.5')),
  );
  const [presetId, setPresetId] = useState(() => readParam('w', 'desktop'));
  const [showForm, setShowForm] = useState(
    () => readParam('layout', 'form') === 'form',
  );
  const [simulateReduced, setSimulateReduced] = useState(
    () => readParam('rm', '0') === '1',
  );
  const [replay, setReplay] = useState(0);

  const [stats, setStats] = useState<MosaicGridStats | null>(null);
  const logged = useRef('');

  const onStats = useCallback((next: MosaicGridStats) => {
    setStats(next);
    const signature = `${next.filled}/${next.total}|${next.stepTiles}`;
    if (signature === logged.current) return;
    logged.current = signature;
    console.log(
      `[MosaicGrid] filled=${next.filled}/${next.total} stepTiles=${next.stepTiles}`,
    );
  }, []);

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

  const debtBand = DEBT_BAND_WEIGHT[debtAmount] ?? 0.5;
  const expected = filledThroughStep(scene, debtBand, incomeBand);
  const thisStep = tilesForStep(
    scene,
    debtBand,
    incomeBand,
    MOSAIC_CONFIG.tileCount -
      filledThroughStep(scene - 1, debtBand, incomeBand),
  );

  const grid = (
    <MosaicGrid
      key={replay}
      step={scene}
      debtAmountBand={debtBand}
      incomeBand={incomeBand}
      matchedDebtTypeIndex={DEBT_TYPE_MATCH_INDEX[debtType]}
      reducedMotion={simulateReduced}
      onStats={onStats}
    />
  );

  return (
    <div className={styles.lab} data-concept="mosaic">
      <header className={styles.bar}>
        <div className={styles.title}>
          <h1>MosaicGrid</h1>
          <p>
            Step 1 is the review target: an empty spiral that fills 6–14 clay
            tiles from the centre as the debt band changes. Later steps are
            wired so the cumulative count can be checked against the spec table.
            Arrow keys scrub scenes.
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
          filled{' '}
          <strong>
            {stats?.filled ?? expected}/{MOSAIC_CONFIG.tileCount}
          </strong>
        </span>
        <span className={styles.stat}>
          this step <strong>{stats?.stepTiles ?? thisStep}</strong>
        </span>
        <span className={styles.stat}>
          reduced motion <strong>{simulateReduced ? 'on' : 'off'}</strong>
        </span>
        <span className={styles.statNote}>
          Expected cumulative {expected}. Same figures log to the console.
        </span>
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
          <span className={styles.note}>{SCENE_NOTES[scene]}</span>
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
          <span className={styles.controlLabel}>incomeBand</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={incomeBand}
            onChange={(event) => {
              const next = Number(event.target.value);
              setIncomeBand(next);
              writeParam('income', String(next));
            }}
          />
          <span className={styles.note}>{incomeBand.toFixed(2)}</span>
        </label>

        <label className={styles.control}>
          <span className={styles.controlLabel}>debtType</span>
          <select
            value={debtType}
            onChange={(event) => {
              setDebtType(event.target.value);
              writeParam('type', event.target.value);
            }}
          >
            {DEBT_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {DEBT_TYPE_LABELS[option]}
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
            {showForm ? 'Form + mosaic' : 'Mosaic only'}
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

        <label className={styles.control}>
          <span className={styles.controlLabel}>replay fill</span>
          <button
            type="button"
            className={styles.toggle}
            onClick={() => setReplay((value) => value + 1)}
          >
            Fill again
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
              <div className={mosaic.root}>
                <div className={mosaic.shell}>
                  <header className={mosaic.header}>
                    <div className={mosaic.headerRow}>
                      <span className={styles.mockBrand}>Mosaic</span>
                      <span className={styles.mockBadge}>
                        Trusted by 100k+ people
                      </span>
                    </div>
                    <div className={mosaic.progressSlot}>
                      <div className={styles.mockTrack}>
                        <div
                          className={styles.mockFill}
                          style={{ width: `${Math.round((scene / 9) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </header>
                  <div className={mosaic.content}>
                    <div className={mosaic.stage}>
                      <div className={mosaic.mosaicSlot}>{grid}</div>
                      <MockForm scene={scene} />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className={mosaic.root}>
                <div className={mosaic.mosaicSlot} style={{ width: '72%', maxWidth: 560, margin: 'auto' }}>
                  {grid}
                </div>
              </div>
            )}
          </div>
        </div>
      </MotionConfig>

      <p className={styles.footnote}>
        Frame is resizable from its bottom-right corner. Step 1 is the
        intended review surface; later-step variants are present so the
        spiral count can be sanity-checked against the spec table.
      </p>
    </div>
  );
}
