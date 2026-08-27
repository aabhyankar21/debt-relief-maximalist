import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { steps } from '../../data/journey';
import {
  DEBT_AMOUNT_OPTIONS,
  DEBT_TYPE_OPTIONS,
  MorphScene,
} from './MorphScene';
import morph from './morph.module.css';
import styles from './morphSceneDemo.module.css';
import './theme.css';

const STEP_NOTES: Record<number, string> = {
  1: 'Blob size pulses to the selected debt band and settles there as the new baseline. The spring overshoot is the pulse.',
  2: "The internal colour mix rotates hue with the debt type — a tint change within the same family, not a colour swap.",
  3: 'Focus a field and the blob leans toward the card with a small attentive wobble. Idles otherwise.',
  4: 'Same focus wobble, and the mesh gradient cross-fades a fraction warmer.',
  5: 'Same focus wobble. Nothing else moves — the quiet step before verification.',
  6: 'Tightens into a rounder, more solid shape and one specular highlight sweeps across it. The "locked in" cue.',
  7: 'The largest single reaction in the flow: the blob elongates noticeably and the mesh brightens one stop.',
  8: 'A second, smaller blob arrives and settles beside the first. Separate shapes — not merged yet.',
  9: 'The two fuse into one combined shape. The longest transition in the flow, and the only combination moment.',
};

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

/** Every `focusedField` value the real journey can hand the scene. */
const FOCUS_OPTIONS = ['', ...steps.map((step) => step.id)];

interface Preset {
  id: string;
  label: string;
  /** null means "fill whatever space is available". */
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

/** Stand-in for the real form, so the type-on-scene reading stays honest. */
function MockCard({ step }: { step: number }) {
  return (
    <div className={morph.shell}>
      <header className={morph.header}>
        <div className={morph.headerRow}>
          <span className={styles.mockBrand}>Morph</span>
          <span className={styles.mockBadge}>Trusted by 100k+ people</span>
        </div>
        <div className={morph.progressSlot}>
          <div className={styles.mockTrack}>
            <div
              className={styles.mockFill}
              style={{ width: `${Math.round((step / 9) * 100)}%` }}
            />
          </div>
        </div>
      </header>
      <div className={morph.content}>
        <div className={morph.card}>
          <p className={styles.mockEyebrow}>Step {step} of 9</p>
          <h2 className={styles.mockHeading}>
            No panel. The type sits on the scene and only the controls are
            glass.
          </h2>
          <p className={styles.mockBody}>{STEP_NOTES[step]}</p>
          <div className={styles.mockChoices}>
            {['Option one', 'Option two', 'Option three'].map((label) => (
              <span key={label} className={styles.mockChoice}>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Review affordance, matching the journey's own `?s=` convention. */
function readParam(key: string, fallback: string) {
  return new URLSearchParams(window.location.search).get(key) ?? fallback;
}

function writeParam(key: string, value: string) {
  const params = new URLSearchParams(window.location.search);
  params.set(key, value);
  window.history.replaceState(null, '', `?${params.toString()}`);
}

export function MorphSceneDemo() {
  const reduceMotion = useReducedMotion() ?? false;

  const [step, setStep] = useState(() => {
    const parsed = Number(readParam('s', '1'));
    return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 9) : 1;
  });
  const [debtAmount, setDebtAmount] = useState(() => readParam('amount', '26-30'));
  const [debtType, setDebtType] = useState(() => readParam('type', 'credit-card'));
  const [focusedField, setFocusedField] = useState(() => readParam('focus', ''));
  const [presetId, setPresetId] = useState(() => readParam('w', 'desktop'));
  const [showForm, setShowForm] = useState(
    () => readParam('layout', 'form') === 'form',
  );
  const [linearFallback, setLinearFallback] = useState(
    () => readParam('bar', '0') === '1',
  );

  const preset = PRESETS.find((option) => option.id === presetId) ?? PRESETS[3];

  /* Scale the frame down when the preset is wider than the space we have.
     Container queries measure layout size, not painted size, so the
     breakpoints under test stay honest. */
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

  /* Left/right arrows scrub steps from anywhere on the page. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|SELECT|TEXTAREA)$/.test(target.tagName)) return;
      const next =
        event.key === 'ArrowRight'
          ? Math.min(9, step + 1)
          : event.key === 'ArrowLeft'
            ? Math.max(1, step - 1)
            : null;
      if (next === null) return;
      setStep(next);
      writeParam('s', String(next));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step]);

  const scene = (
    <MorphScene
      className={showForm ? morph.scene : undefined}
      step={step}
      debtAmount={debtAmount}
      debtType={debtType}
      focusedField={focusedField || null}
      progressPercent={(step / 9) * 100}
      linearFallback={linearFallback}
    />
  );

  return (
    <div className={styles.lab} data-concept="morph">
      <header className={styles.bar}>
        <div className={styles.title}>
          <h1>MorphScene</h1>
          <p>
            Nine states, scrubbable in both directions.{' '}
            {reduceMotion
              ? 'Reduced motion is on: ambient drift, wobble and the mesh drift are disabled, and step morphs run at half duration.'
              : 'Arrow keys step through. On a fine pointer, moving the mouse pulls the blob’s highlight toward the cursor.'}
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

      <div className={styles.controls}>
        <label className={styles.control} data-wide="true">
          <span className={styles.controlLabel}>
            Step <strong>{step}</strong>
          </span>
          <input
            type="range"
            min={1}
            max={9}
            step={1}
            value={step}
            onChange={(event) => {
              setStep(Number(event.target.value));
              writeParam('s', event.target.value);
            }}
          />
          <span className={styles.note}>{STEP_NOTES[step]}</span>
        </label>

        <label className={styles.control}>
          <span className={styles.controlLabel}>debtAmount</span>
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
          <span className={styles.controlLabel}>focusedField</span>
          <select
            value={focusedField}
            onChange={(event) => {
              setFocusedField(event.target.value);
              writeParam('focus', event.target.value);
            }}
          >
            {FOCUS_OPTIONS.map((option) => (
              <option key={option || 'none'} value={option}>
                {option || '(nothing focused)'}
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
            {showForm ? 'Glass form on top' : 'Scene only'}
          </button>
        </label>

        <label className={styles.control}>
          <span className={styles.controlLabel}>linearFallback</span>
          <button
            type="button"
            className={styles.toggle}
            data-active={linearFallback ? 'true' : undefined}
            onClick={() =>
              setLinearFallback((value) => {
                writeParam('bar', value ? '0' : '1');
                return !value;
              })
            }
          >
            {linearFallback ? 'Bar visible' : 'Arc only'}
          </button>
        </label>
      </div>

      <div className={styles.holder} ref={holderRef}>
        <div
          className={styles.frame}
          style={{
            width: frameWidth ? `${frameWidth}px` : '100%',
            height: `${preset.height}px`,
            transform: zoom < 1 ? `scale(${zoom})` : undefined,
            marginBottom: zoom < 1 ? `${-preset.height * (1 - zoom)}px` : undefined,
          }}
        >
          {showForm ? (
            <div className={morph.root}>
              {scene}
              <MockCard step={step} />
            </div>
          ) : (
            scene
          )}
        </div>
      </div>

      <p className={styles.footnote}>
        Frame is resizable from its bottom-right corner. The blob and the mesh
        are sized off the frame, not the viewport, so these presets behave the
        same as a real resize.
      </p>
    </div>
  );
}
