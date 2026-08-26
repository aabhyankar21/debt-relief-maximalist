import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { ConceptEntry } from '../concepts/registry';
import styles from './conceptSwitcher.module.css';

interface Props {
  concepts: ConceptEntry[];
  activeId: string;
  onChange: (id: string) => void;
}

/** Review-only control for comparing the visual concepts on the same flow. */
export function ConceptSwitcher({ concepts, activeId, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const active = concepts.find((concept) => concept.id === activeId);

  return (
    <div className={styles.dock}>
      <AnimatePresence>
        {open ? (
          <motion.div
            className={styles.panel}
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {concepts.map((concept) => (
              <button
                key={concept.id}
                type="button"
                className={styles.option}
                data-active={concept.id === activeId}
                onClick={() => {
                  onChange(concept.id);
                  setOpen(false);
                }}
              >
                <span className={styles.optionName}>{concept.name}</span>
                <span className={styles.optionTag}>{concept.tagline}</span>
              </button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        type="button"
        className={styles.toggle}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span className={styles.swatch} data-concept-id={activeId} />
        {active?.name}
      </button>
    </div>
  );
}
