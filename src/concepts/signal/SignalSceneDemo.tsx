import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { steps } from '../../data/journey';
import { PulseTitle } from '../pulse/PulseTitle';
import { TrustSignal } from './TrustSignal';
import { SnapshotStrip } from './SnapshotStrip';
import { TrustCallout } from './TrustCallout';
import {
  DEBT_AMOUNT_OPTIONS,
  DEBT_BAND_LABEL,
  DEBT_BAND_WEIGHT,
  DEBT_TYPE_LABEL,
  DEBT_TYPE_MATCH_INDEX,
  DEBT_TYPE_OPTIONS,
  JOURNEY_INDEX_BY_SCENE,
  SCENE_NOTES,
  SIGNAL_CONFIG,
  TITLE_TREATMENT,
  calloutText,
  resolveSignalColor,
  resolveSignalScale,
  snapshotEntries,
  type OtpStatus,
} from './config';
import signal from './signal.module.css';
import styles from './signalSceneDemo.module.css';
import './theme.css';

const OTP_OPTIONS: OtpStatus[] = ['idle', 'pending', 'verified'];

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

function MockForm({
  scene,
  fieldFocused,
  onFieldFocus,
}: {
  scene: number;
  fieldFocused: boolean;
  onFieldFocus: (focused: boolean) => void;
}) {
  const journeyIndex = JOURNEY_INDEX_BY_SCENE[scene];
  const step = journeyIndex == null ? null : steps[journeyIndex];
  const treatment = TITLE_TREATMENT[scene] ?? TITLE_TREATMENT[1];
  const showField = scene === 5 || scene === 8;

  return (
    <div className={signal.stepWrap}>
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
              animateWeight={treatment.animateWeight}
              tick={treatment.tick}
            />
            {step.question ? (
              <PulseTitle
                key={`question-${scene}`}
                text={step.question}
                as="h3"
                className={styles.mockQuestion}
                animateWeight={treatment.animateWeight}
              />
            ) : null}
            {step.subtext ? (
              <PulseTitle
                key={`subtext-${scene}`}
                text={step.subtext}
                as="p"
                className={styles.mockBody}
                highlightPhrases={treatment.highlight ?? step.subtextEmphasis}
              />
            ) : null}
          </>
        ) : (
          <PulseTitle
            key="result"
            text="We have matched you with your personalized Debt Relief provider"
            as="h2"
            className={styles.mockHeading}
            animateWeight
            tick
          />
        )}
      </header>

      {showField ? (
        <label className={styles.mockField}>
          <span>{scene === 5 ? 'Phone Number' : 'Address Line 1'}</span>
          <input
            type={scene === 5 ? 'tel' : 'text'}
            placeholder={scene === 5 ? '(555) 555-5555' : 'Enter Address Line 1'}
            autoComplete="off"
            onFocus={() => onFieldFocus(true)}
            onBlur={() => onFieldFocus(false)}
          />
        </label>
      ) : (
        <div className={styles.mockChoices}>
          {['Option one', 'Option two', 'Option three'].map((label) => (
            <span key={label} className={styles.mockChoice}>
              {label}
            </span>
          ))}
        </div>
      )}
      <p className={styles.note}>
        Field focus: {fieldFocused ? 'on' : 'off'}
        {showField ? ' — tap the input, or use the lab toggle.' : ''}
      </p>
    </div>
  );
}

export function SignalSceneDemo() {
  const [scene, setScene] = useState(() => {
    const parsed = Number(readParam('s', '1'));
    return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 9) : 1;
  });
  const [debtBand, setDebtBand] = useState(() => {
    const parsed = Number(readParam('band', '0.5'));
    return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), 1) : 0.5;
  });
  const [debtType, setDebtType] = useState(() =>
    readParam('type', 'credit-card'),
  );
  const [otpStatus, setOtpStatus] = useState<OtpStatus>(() => {
    const raw = readParam('otp', 'idle');
    return OTP_OPTIONS.includes(raw as OtpStatus) ? (raw as OtpStatus) : 'idle';
  });
  const [presetId, setPresetId] = useState(() => readParam('w', 'desktop'));
  const [simulateReduced, setSimulateReduced] = useState(
    () => readParam('rm', '0') === '1',
  );
  const [simulateFocus, setSimulateFocus] = useState(
    () => readParam('focus', '0') === '1',
  );
  const [inputFocused, setInputFocused] = useState(false);
  const [highlightAll, setHighlightAll] = useState(false);

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

  useEffect(() => {
    if (scene !== 9) {
      setHighlightAll(false);
      return;
    }
    setHighlightAll(true);
    const ms =
      (simulateReduced
        ? SIGNAL_CONFIG.timing.reducedS
        : SIGNAL_CONFIG.timing.chipHighlightS) *
        4 *
        1000 +
      80;
    const timer = window.setTimeout(() => setHighlightAll(false), ms);
    return () => window.clearTimeout(timer);
  }, [scene, simulateReduced]);

  const closestAmount =
    DEBT_AMOUNT_OPTIONS.find((option) => DEBT_BAND_WEIGHT[option] >= debtBand) ??
    DEBT_AMOUNT_OPTIONS[DEBT_AMOUNT_OPTIONS.length - 1];
  const matchedDebtTypeIndex = DEBT_TYPE_MATCH_INDEX[debtType];
  const fieldFocused = simulateFocus || inputFocused;
  const attentive = fieldFocused && (scene === 3 || scene === 4 || scene === 5 || scene === 8);
  const cue = calloutText(scene, fieldFocused);
  const stepConfig = SIGNAL_CONFIG.steps[scene] ?? SIGNAL_CONFIG.steps[1];
  const color = resolveSignalColor(
    scene,
    stepConfig.warmthLevel,
    matchedDebtTypeIndex,
    otpStatus,
  );
  const scale = resolveSignalScale(scene, debtBand);

  const entries = snapshotEntries(
    scene,
    {
      'debt-amount': closestAmount,
      'debt-type': debtType,
      income: '50-100k',
    },
    scene >= 8 ? '94102' : undefined,
  );

  const beacon = (
    <div className={signal.beacon}>
      <div className={signal.signalSlot}>
        <TrustSignal
          step={scene}
          debtAmountBand={debtBand}
          matchedDebtTypeIndex={matchedDebtTypeIndex}
          otpStatus={otpStatus}
          attentive={attentive}
        />
      </div>
      <SnapshotStrip entries={entries} highlightAll={highlightAll} />
      <TrustCallout text={cue ?? ''} visible={Boolean(cue)} />
    </div>
  );

  return (
    <div className={styles.lab} data-concept="signal">
      <header className={styles.bar}>
        <div className={styles.title}>
          <h1>TrustSignal</h1>
          <p>
            Nine states on the existing sequence. The beacon, snapshot chips
            and callouts sit on the same ground as the question — no panel
            split. Arrow keys scrub scenes. Step 6 is driven by otpStatus, not
            a timer inside the signal.
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
          warmth <strong>{stepConfig.warmthLevel.toFixed(2)}</strong>
        </span>
        <span className={styles.stat}>
          scale <strong>{scale.toFixed(2)}</strong>
        </span>
        <span className={styles.stat}>
          color <strong>{color}</strong>
        </span>
        <span className={styles.stat}>
          otp <strong>{otpStatus}</strong>
        </span>
        <span className={styles.stat}>
          callout <strong>{cue ? 'on' : 'off'}</strong>
        </span>
        <span className={styles.stat}>
          chips <strong>{entries.length}</strong>
        </span>
        <span className={styles.statNote}>
          Callouts fire on 5/8 (field focus) and 6/9 (enter).
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
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={debtBand}
            onChange={(event) => {
              const next = Number(event.target.value);
              setDebtBand(next);
              writeParam('band', String(next));
            }}
          />
          <span className={styles.note}>
            {debtBand.toFixed(2)} · {DEBT_BAND_LABEL[closestAmount]}
          </span>
        </label>

        <label className={styles.control}>
          <span className={styles.controlLabel}>matchedDebtTypeIndex</span>
          <select
            value={debtType}
            onChange={(event) => {
              setDebtType(event.target.value);
              writeParam('type', event.target.value);
            }}
          >
            {DEBT_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {DEBT_TYPE_MATCH_INDEX[option]} · {DEBT_TYPE_LABEL[option]}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.control}>
          <span className={styles.controlLabel}>otpStatus</span>
          <select
            value={otpStatus}
            onChange={(event) => {
              const next = event.target.value as OtpStatus;
              setOtpStatus(next);
              writeParam('otp', next);
            }}
          >
            {OTP_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span className={styles.note}>
            Only read on scene 6. Pending scans; verified locks immediately.
          </span>
        </label>

        <label className={styles.control}>
          <span className={styles.controlLabel}>field focus (5 / 8)</span>
          <button
            type="button"
            className={styles.toggle}
            data-active={simulateFocus ? 'true' : undefined}
            onClick={() =>
              setSimulateFocus((value) => {
                writeParam('focus', value ? '0' : '1');
                return !value;
              })
            }
          >
            {simulateFocus ? 'Simulated on' : 'Off'}
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
          <span className={styles.controlLabel}>highlightAll</span>
          <button
            type="button"
            className={styles.toggle}
            data-active={highlightAll ? 'true' : undefined}
            onClick={() => setHighlightAll(true)}
          >
            Pulse chips
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
            <div className={signal.root}>
              <div className={signal.shell}>
                <header className={signal.header}>
                  <div className={signal.headerRow}>
                    <span className={styles.mockBrand}>Signal</span>
                    <span className={styles.mockBadge}>
                      Trusted by 100k+ people
                    </span>
                  </div>
                  <div className={signal.progressSlot}>
                    <div className={styles.mockTrack}>
                      <div
                        className={styles.mockFill}
                        style={{
                          width: `${Math.round((scene / 9) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </header>
                <div className={signal.content}>
                  <div className={signal.stage}>
                    {beacon}
                    <MockForm
                      scene={scene}
                      fieldFocused={fieldFocused}
                      onFieldFocus={setInputFocused}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MotionConfig>

      <p className={styles.footnote}>
        Frame is resizable from its bottom-right corner. Callout copy is
        existing journey reassurance, presented by the signal rather than as
        helper text. OTP resolve is tied to the otpStatus control — never a
        timeout inside TrustSignal.
      </p>
    </div>
  );
}
