import { useRef } from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'motion/react';
import type { ChoiceDef } from '../data/journey';
import { useConcept } from '../engine/concept';
import { CheckIcon, ChoiceIcon } from './icons';
import styles from './ui.module.css';

interface Props {
  name: string;
  choices: ChoiceDef[];
  value: string | undefined;
  onSelect: (choiceId: string) => void;
  label: string;
}

export function ChoiceGroup({ name, choices, value, onSelect, label }: Props) {
  const hasIcons = choices.some((choice) => choice.icon);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const selectedIndex = choices.findIndex((choice) => choice.id === value);
  const tabbableIndex = selectedIndex === -1 ? 0 : selectedIndex;

  const moveFocus = (from: number, delta: number) => {
    const nextIndex = (from + delta + choices.length) % choices.length;
    refs.current[nextIndex]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={`${styles.choiceGrid} ${hasIcons ? styles.choiceGridIcons : ''}`}
    >
      {choices.map((choice, i) => {
        const selected = value === choice.id;
        return (
          <ChoiceCard
            key={choice.id}
            refCallback={(node) => {
              refs.current[i] = node;
            }}
            choiceId={choice.id}
            name={name}
            selected={selected}
            tabIndex={i === tabbableIndex ? 0 : -1}
            icon={choice.icon}
            iconLayout={hasIcons}
            label={choice.label}
            delay={0.05 + i * 0.045}
            onSelect={() => onSelect(choice.id)}
            onMove={(delta) => moveFocus(i, delta)}
            onJump={(edge) => {
              const next = edge === 'start' ? 0 : choices.length - 1;
              refs.current[next]?.focus();
            }}
          />
        );
      })}
    </div>
  );
}

function ChoiceCard({
  refCallback,
  choiceId,
  name,
  selected,
  tabIndex,
  icon,
  iconLayout,
  label,
  delay,
  onSelect,
  onMove,
  onJump,
}: {
  refCallback: (node: HTMLButtonElement | null) => void;
  choiceId: string;
  name: string;
  selected: boolean;
  tabIndex: number;
  icon?: ChoiceDef['icon'];
  iconLayout: boolean;
  label: string;
  delay: number;
  onSelect: () => void;
  onMove: (delta: number) => void;
  onJump: (edge: 'start' | 'end') => void;
}) {
  const concept = useConcept();
  const reduceMotion = useReducedMotion();
  const kinetic = concept === 'flux';
  const magnetic =
    (concept === 'momentum' || concept === 'bloom' || kinetic) && !reduceMotion;
  const pull = kinetic ? 0.46 : concept === 'bloom' ? 0.34 : 0.22;
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 280, damping: 22, mass: 0.35 });
  const springY = useSpring(y, { stiffness: 280, damping: 22, mass: 0.35 });
  const localRef = useRef<HTMLButtonElement | null>(null);

  return (
    <motion.button
      ref={(node) => {
        localRef.current = node;
        refCallback(node);
      }}
      type="button"
      role="radio"
      aria-checked={selected}
      name={name}
      tabIndex={tabIndex}
      data-choice-id={choiceId}
      data-selected={selected}
      data-kinetic={kinetic ? 'true' : undefined}
      className={`${styles.choiceCard} ${iconLayout ? styles.choiceCardIcon : ''}`}
      style={magnetic ? { x: springX, y: springY } : undefined}
      onClick={onSelect}
      onPointerMove={(event) => {
        const node = localRef.current;
        if (!node) return;
        const rect = node.getBoundingClientRect();
        if (kinetic) {
          node.style.setProperty(
            '--shine-x',
            `${((event.clientX - rect.left) / rect.width) * 100}%`,
          );
          node.style.setProperty(
            '--shine-y',
            `${((event.clientY - rect.top) / rect.height) * 100}%`,
          );
        }
        if (!magnetic || event.pointerType !== 'mouse') return;
        x.set((event.clientX - (rect.left + rect.width / 2)) * pull);
        y.set((event.clientY - (rect.top + rect.height / 2)) * pull);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
          event.preventDefault();
          onMove(1);
        }
        if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
          event.preventDefault();
          onMove(-1);
        }
        if (event.key === 'Home') {
          event.preventDefault();
          onJump('start');
        }
        if (event.key === 'End') {
          event.preventDefault();
          onJump('end');
        }
        if (event.key === ' ' || event.key === 'Enter') {
          event.preventDefault();
          onSelect();
        }
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay,
        duration: 0.34,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={
        kinetic && !reduceMotion ? { scale: 1.035 } : undefined
      }
      whileTap={{ scale: 0.98 }}
    >
      {icon ? (
        <span className={styles.choiceIconWrap}>
          <ChoiceIcon name={icon} />
        </span>
      ) : null}
      <span className={styles.choiceLabel}>{label}</span>
      <span className={styles.choiceMark} aria-hidden="true">
        <CheckIcon />
      </span>
    </motion.button>
  );
}
