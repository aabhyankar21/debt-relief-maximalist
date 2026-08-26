import { useEffect, useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react';
import { months, steps, years } from '../../data/journey';
import { useJourney } from '../../engine/journey';
import { digitsOnly, formatPhone } from '../../engine/validation';
import {
  ChoiceIcon,
  CreditCardIcon,
  MedicalIcon,
  PersonalLoanIcon,
  StudentIcon,
} from '../../ui/icons';
import styles from './bloom.module.css';

const AMOUNT_STEP = steps.find((step) => step.id === 'debt-amount');
const TYPE_STEP = steps.find((step) => step.id === 'debt-type');
const INCOME_STEP = steps.find((step) => step.id === 'income');

const AMOUNT_TONES = ['#7cff6b', '#ffb800', '#3d5afe', '#ff6b3d', '#ff2d78'];
const AMOUNT_HEIGHTS = [34, 46, 60, 74, 90];
const INCOME_HEIGHTS = [28, 46, 64, 88, 52];
const TYPE_TONES = ['#3d5afe', '#ff2d78', '#17b36a', '#ffb800'];
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'] as const;

function useChoiceAdvance() {
  const journey = useJourney();
  const reduceMotion = useReducedMotion();
  const timer = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  return (stepId: string, choiceId: string) => {
    journey.selectChoice(stepId, choiceId);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(
      () => journey.next(),
      reduceMotion ? 120 : 420,
    );
  };
}

function TiltStage({
  children,
  compact,
  enabled,
}: {
  children: ReactNode;
  compact?: boolean;
  enabled: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const rotateX = useSpring(0, { stiffness: 200, damping: 22, mass: 0.4 });
  const rotateY = useSpring(0, { stiffness: 200, damping: 22, mass: 0.4 });
  const live = enabled && !reduceMotion && !compact;

  const onMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!live || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    rotateY.set(((event.clientX - rect.left) / rect.width - 0.5) * 9);
    rotateX.set(((event.clientY - rect.top) / rect.height - 0.5) * -7);
  };

  return (
    <motion.div
      className={styles.stageCard}
      data-compact={compact ? 'true' : 'false'}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      onPointerMove={onMove}
      onPointerLeave={() => {
        rotateX.set(0);
        rotateY.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

function AmountScene({ compact }: { compact?: boolean }) {
  const { choices } = useJourney();
  const select = useChoiceAdvance();
  const selected = choices['debt-amount'];
  const options =
    AMOUNT_STEP?.kind === 'choice' ? AMOUNT_STEP.choices : [];

  return (
    <div className={styles.stack} aria-hidden="true">
      {options.map((choice, i) => {
        const on = selected === choice.id;
        return (
          <motion.button
            key={choice.id}
            type="button"
            tabIndex={-1}
            className={styles.bill}
            data-active={on}
            style={{
              height: compact ? AMOUNT_HEIGHTS[i] * 0.72 : AMOUNT_HEIGHTS[i],
              background: AMOUNT_TONES[i],
              zIndex: on ? 6 : i,
            }}
            onClick={() => select('debt-amount', choice.id)}
            whileHover={{ y: -10, rotate: -2 }}
            whileTap={{ scale: 0.97 }}
            animate={{
              y: on ? -14 : 0,
              scale: on ? 1.04 : 1,
              boxShadow: on
                ? '0 18px 32px rgb(27 18 51 / 22%)'
                : '0 8px 16px rgb(27 18 51 / 10%)',
            }}
            transition={{ type: 'spring', stiffness: 280, damping: 18 }}
          >
            <span className={styles.billStripe} />
            <span className={styles.billLabel}>{choice.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

function TypeScene() {
  const { choices } = useJourney();
  const select = useChoiceAdvance();
  const selected = choices['debt-type'];
  const options = TYPE_STEP?.kind === 'choice' ? TYPE_STEP.choices : [];
  const icons = [
    PersonalLoanIcon,
    CreditCardIcon,
    MedicalIcon,
    StudentIcon,
  ];

  return (
    <div className={styles.tokens} aria-hidden="true">
      {options.map((choice, i) => {
        const on = selected === choice.id;
        const Icon = icons[i];
        return (
          <motion.button
            key={choice.id}
            type="button"
            tabIndex={-1}
            className={styles.token}
            data-active={on}
            style={{ background: TYPE_TONES[i] }}
            onClick={() => select('debt-type', choice.id)}
            animate={{
              y: on ? -12 : 0,
              scale: on ? 1.12 : 1,
              rotate: on ? -6 : 0,
            }}
            whileHover={{ y: -8, rotate: 4 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16 }}
          >
            <span className={styles.tokenIcon}>
              {choice.icon ? <ChoiceIcon name={choice.icon} /> : <Icon />}
            </span>
            <span className={styles.tokenLabel}>{choice.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

function ContactScene() {
  const { fields } = useJourney();
  const first = fields.firstName?.trim() ?? '';
  const last = fields.lastName?.trim() ?? '';
  const email = fields.email?.trim() ?? '';
  const initials = `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();

  return (
    <motion.div
      className={styles.idCard}
      animate={{ rotate: first || last ? -2 : 0 }}
      transition={{ type: 'spring', stiffness: 180, damping: 16 }}
    >
      <motion.span
        className={styles.avatar}
        animate={{
          scale: initials ? 1 : 0.86,
          background: initials ? '#ff2d78' : '#1b1233',
        }}
      >
        {initials || '·'}
      </motion.span>
      <div className={styles.idCopy}>
        <p className={styles.idName}>
          {first || last ? `${first} ${last}`.trim() : '\u00a0'}
        </p>
        <p className={styles.idEmail}>{email || '\u00a0'}</p>
      </div>
    </motion.div>
  );
}

function DateScene({ compact }: { compact?: boolean }) {
  const { dob, setDobPart } = useJourney();
  const monthIndex = months.indexOf(dob.month);
  const yearIndex = years.indexOf(dob.year);

  const shiftMonth = (delta: number) => {
    const from = monthIndex === -1 ? (delta > 0 ? -1 : 0) : monthIndex;
    const next = (from + delta + months.length) % months.length;
    setDobPart('month', months[next]);
  };

  const shiftYear = (delta: number) => {
    const from = yearIndex === -1 ? 0 : yearIndex;
    const next = Math.min(Math.max(from + delta, 0), years.length - 1);
    setDobPart('year', years[next]);
  };

  return (
    <div className={styles.calendar} data-compact={compact ? 'true' : 'false'}>
      <div className={styles.calNav}>
        <button
          type="button"
          className={styles.calShift}
          onClick={() => shiftMonth(-1)}
          aria-label="Previous month"
        >
          ‹
        </button>
        <span className={styles.calMonth}>{dob.month || months[0]}</span>
        <button
          type="button"
          className={styles.calShift}
          onClick={() => shiftMonth(1)}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className={styles.dayGrid}>
        {Array.from({ length: 31 }, (_, i) => {
          const day = String(i + 1).padStart(2, '0');
          const on = dob.day === day;
          return (
            <motion.button
              key={day}
              type="button"
              className={styles.day}
              data-active={on}
              onClick={() => setDobPart('day', day)}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.9 }}
              aria-label={day}
              aria-pressed={on}
            >
              {i + 1}
            </motion.button>
          );
        })}
      </div>

      <div className={styles.calNav}>
        <button
          type="button"
          className={styles.calShift}
          onClick={() => shiftYear(1)}
          aria-label="Earlier year"
        >
          ‹
        </button>
        <span className={styles.calYear}>{dob.year || years[0]}</span>
        <button
          type="button"
          className={styles.calShift}
          onClick={() => shiftYear(-1)}
          aria-label="Later year"
        >
          ›
        </button>
      </div>
    </div>
  );
}

function PhoneScene({ compact }: { compact?: boolean }) {
  const { fields, setField } = useJourney();
  const digits = digitsOnly(fields.phone ?? '');
  const display = fields.phone || '• • •';

  const push = (digit: string) => {
    if (digits.length >= 10) return;
    setField('phone', formatPhone(digits + digit));
  };

  const back = () => {
    setField('phone', formatPhone(digits.slice(0, -1)));
  };

  return (
    <div className={styles.phone}>
      <div className={styles.phoneScreen}>
        <motion.span
          className={styles.phoneNumber}
          key={display}
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          {display}
        </motion.span>
        <span className={styles.phoneDots} aria-hidden="true">
          {Array.from({ length: 10 }, (_, i) => (
            <span
              key={i}
              className={styles.phoneDot}
              data-on={i < digits.length}
            />
          ))}
        </span>
      </div>
      {compact ? null : (
        <div className={styles.keypad}>
          {KEYS.map((key) => (
            <motion.button
              key={key}
              type="button"
              className={styles.key}
              onClick={() => push(key)}
              whileTap={{ scale: 0.88, backgroundColor: '#ff2d78' }}
              aria-label={key}
            >
              {key}
            </motion.button>
          ))}
          <motion.button
            type="button"
            className={`${styles.key} ${styles.keyWide}`}
            onClick={back}
            whileTap={{ scale: 0.94 }}
            aria-label="Backspace"
          >
            ⌫
          </motion.button>
        </div>
      )}
    </div>
  );
}

function IncomeScene({ compact }: { compact?: boolean }) {
  const { choices } = useJourney();
  const select = useChoiceAdvance();
  const selected = choices.income;
  const options = INCOME_STEP?.kind === 'choice' ? INCOME_STEP.choices : [];

  return (
    <div className={styles.skyline} aria-hidden="true">
      {options.map((choice, i) => {
        const on = selected === choice.id;
        const unsure = choice.id === 'unsure';
        return (
          <motion.button
            key={choice.id}
            type="button"
            tabIndex={-1}
            className={styles.tower}
            data-active={on}
            data-ghost={unsure}
            style={{
              height: compact ? INCOME_HEIGHTS[i] * 0.7 : INCOME_HEIGHTS[i],
            }}
            onClick={() => select('income', choice.id)}
            animate={{ scaleY: on ? 1.08 : 1, y: on ? -8 : 0 }}
            whileHover={{ y: -10 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 240, damping: 16 }}
          >
            <span className={styles.towerLabel}>{choice.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

function zipPoint(zip: string) {
  const n = Number.parseInt(zip, 10) || 0;
  return {
    x: 22 + (n % 56),
    y: 24 + ((n * 13) % 52),
  };
}

function AddressScene() {
  const { fields } = useJourney();
  const zip = digitsOnly(fields.zip ?? '');
  const locked = zip.length === 5;
  const home = zipPoint(zip);
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(50);
  const y = useMotionValue(48);
  const sx = useSpring(x, { stiffness: 180, damping: 20 });
  const sy = useSpring(y, { stiffness: 180, damping: 20 });
  const left = useTransform(sx, (value) => `${value}%`);
  const top = useTransform(sy, (value) => `${value}%`);
  const street = fields.address1?.trim();

  useEffect(() => {
    if (locked) {
      x.set(home.x);
      y.set(home.y);
    }
  }, [home.x, home.y, locked, x, y]);

  return (
    <div
      className={styles.map}
      onPointerMove={(event) => {
        if (locked || reduceMotion) return;
        const rect = event.currentTarget.getBoundingClientRect();
        x.set(((event.clientX - rect.left) / rect.width) * 100);
        y.set(((event.clientY - rect.top) / rect.height) * 100);
      }}
    >
      <svg className={styles.mapSvg} viewBox="0 0 140 100" aria-hidden="true">
        <path d="M8 72h124M8 48h124M8 24h124" />
        <path d="M28 8v84M56 8v84M92 8v84M118 8v84" />
        <path d="M8 8 48 40 92 22 132 70" />
      </svg>
      <motion.span
        className={styles.pin}
        style={{ left, top }}
        animate={{ scale: locked ? 1.18 : 1 }}
      />
      {street ? <p className={styles.street}>{street}</p> : null}
    </div>
  );
}

function ResultScene() {
  const petals = [
    '#ff2d78',
    '#ffb800',
    '#3d5afe',
    '#7cff6b',
    '#ff6b3d',
    '#c084fc',
  ];

  return (
    <div className={styles.bloomBurst} aria-hidden="true">
      {petals.map((color, i) => (
        <motion.span
          key={color}
          className={styles.petal}
          style={{ background: color }}
          initial={{ scale: 0.2, opacity: 0, rotate: i * 40 }}
          animate={{
            scale: [1, 1.12, 1],
            opacity: 1,
            x: Math.cos((i / petals.length) * Math.PI * 2) * 42,
            y: Math.sin((i / petals.length) * Math.PI * 2) * 42,
          }}
          transition={{
            delay: i * 0.05,
            type: 'spring',
            stiffness: 160,
            damping: 12,
          }}
        />
      ))}
      <motion.span
        className={styles.bloomCore}
        initial={{ scale: 0.4 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 14 }}
      />
    </div>
  );
}

/** Step-specific playground: reacts to answers instead of repeating progress. */
export function Scene({ compact = false }: { compact?: boolean }) {
  const { step, finished } = useJourney();
  const id = finished ? 'result' : step.id;
  const tilt =
    id === 'debt-amount' ||
    id === 'debt-type' ||
    id === 'contact' ||
    id === 'income' ||
    id === 'result';

  return (
    <TiltStage compact={compact} enabled={tilt}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={id}
          className={styles.sceneBody}
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          {id === 'debt-amount' ? <AmountScene compact={compact} /> : null}
          {id === 'debt-type' ? <TypeScene /> : null}
          {id === 'contact' ? <ContactScene /> : null}
          {id === 'date-of-birth' ? <DateScene compact={compact} /> : null}
          {id === 'phone' ? <PhoneScene compact={compact} /> : null}
          {id === 'income' ? <IncomeScene compact={compact} /> : null}
          {id === 'address' ? <AddressScene /> : null}
          {id === 'result' ? <ResultScene /> : null}
        </motion.div>
      </AnimatePresence>
    </TiltStage>
  );
}
