import { motion, useReducedMotion } from 'motion/react';
import type { ElementType } from 'react';

const ease = [0.22, 1, 0.36, 1] as const;

interface Props {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
}

/** Staggered word reveal used by the Ledger concept headlines. */
export function WordReveal({ text, as: Tag = 'h1', className, delay = 0.04 }: Props) {
  const reduceMotion = useReducedMotion();
  const words = text.split(' ');

  if (reduceMotion) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <Tag className={className}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + i * 0.038, duration: 0.42, ease }}
          style={{ display: 'inline-block' }}
        >
          {word}
          {i < words.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </Tag>
  );
}
