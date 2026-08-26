import { Fragment, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { days, months, years, type Step } from '../data/journey';
import { useConcept } from '../engine/concept';
import { useJourney } from '../engine/journey';
import { ChoiceGroup } from '../ui/ChoiceGroup';
import { SelectField, TextField } from '../ui/Fields';
import { PrimaryButton } from '../ui/Button';
import { CheckBullets, Disclaimer, DotBullets, SecureNote } from '../ui/Notes';
import { WordReveal } from '../ui/WordReveal';
import ui from '../ui/ui.module.css';
import styles from './stepBody.module.css';

/** Renders subtext with the words the live journey emphasises wrapped in <em>. */
function EmphasisText({
  text,
  emphasis,
}: {
  text: string;
  emphasis?: string[];
}) {
  if (!emphasis?.length) return <>{text}</>;

  const pattern = new RegExp(`(${emphasis.map(escapeRe).join('|')})`, 'gi');
  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, i) =>
        emphasis.some((word) => word.toLowerCase() === part.toLowerCase()) ? (
          <em key={`${part}-${i}`}>{part}</em>
        ) : (
          <Fragment key={`${part}-${i}`}>{part}</Fragment>
        ),
      )}
    </>
  );
}

function escapeRe(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function StepBody({
  step,
  hideCallout = false,
}: {
  step: Step;
  hideCallout?: boolean;
}) {
  const journey = useJourney();
  const concept = useConcept();
  const reduceMotion = useReducedMotion();
  const advanceTimer = useRef<number | undefined>(undefined);
  const staggerHeadlines = concept === 'ledger' || concept === 'flux';
  const instant = concept === 'momentum';

  useEffect(
    () => () => {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    },
    [],
  );

  const handleSelect = (choiceId: string) => {
    journey.selectChoice(step.id, choiceId);
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(
      () => journey.next(),
      reduceMotion ? 120 : 420,
    );
  };

  const anchorSecureNoteToZip =
    step.kind === 'fields' && step.fields.some((field) => field.type === 'zip');

  return (
    <div className={styles.body} aria-live="polite">
      <header className={styles.head}>
        {step.eyebrow ? (
          <motion.p
            className={styles.eyebrow}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {step.eyebrow}
          </motion.p>
        ) : null}

        {staggerHeadlines ? (
          <WordReveal text={step.heading} className={styles.heading} />
        ) : (
          <motion.h1
            className={styles.heading}
            initial={instant ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.04,
              duration: instant ? 0.2 : 0.38,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {step.heading}
          </motion.h1>
        )}

        {step.question ? (
          staggerHeadlines ? (
            <WordReveal
              text={step.question}
              as="h2"
              className={styles.question}
              delay={0.12}
            />
          ) : (
            <motion.h2
              className={styles.question}
              initial={instant ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.08,
                duration: instant ? 0.18 : 0.36,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {step.question}
            </motion.h2>
          )
        ) : null}

        {step.subtext ? (
          <motion.p
            className={styles.subtext}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
          >
            <EmphasisText text={step.subtext} emphasis={step.subtextEmphasis} />
          </motion.p>
        ) : null}
      </header>

      <div className={styles.controls}>
        {step.kind === 'choice' ? (
          <ChoiceGroup
            name={step.id}
            label={step.question ?? step.heading}
            choices={step.choices}
            value={journey.choices[step.id]}
            onSelect={handleSelect}
          />
        ) : null}

        {step.kind === 'fields' ? (
          <div className={ui.fieldStack}>
            {step.fields.map((field) => (
              <TextField
                key={field.id}
                field={field}
                value={journey.fields[field.id] ?? ''}
                onChange={(value) => journey.setField(field.id, value)}
              />
            ))}
            {anchorSecureNoteToZip && step.secureNote ? (
              <SecureNote text={step.secureNote} />
            ) : null}
          </div>
        ) : null}

        {step.kind === 'date' ? (
          <div className={ui.fieldRow}>
            <SelectField
              label="Month"
              placeholder="MM"
              options={months}
              value={journey.dob.month}
              onChange={(value) => journey.setDobPart('month', value)}
            />
            <SelectField
              label="Day"
              placeholder="DD"
              options={days}
              value={journey.dob.day}
              onChange={(value) => journey.setDobPart('day', value)}
            />
            <SelectField
              label="Year"
              placeholder="YYYY"
              options={years}
              value={journey.dob.year}
              onChange={(value) => journey.setDobPart('year', value)}
            />
          </div>
        ) : null}

        {step.kind !== 'choice' ? (
          <PrimaryButton disabled={!journey.canAdvance} onClick={journey.next}>
            {step.buttonLabel}
          </PrimaryButton>
        ) : null}
      </div>

      <div className={styles.footNotes}>
        {step.bullets ? <CheckBullets items={step.bullets} /> : null}
        {step.guidance ? <DotBullets items={step.guidance} /> : null}
        {step.disclaimer ? <Disclaimer text={step.disclaimer} /> : null}
        {step.secureNote && !anchorSecureNoteToZip ? (
          <SecureNote text={step.secureNote} />
        ) : null}
        {step.callout && !hideCallout ? (
          <motion.aside
            className={styles.callout}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className={styles.calloutTitle}>{step.callout.title}</p>
            <p className={styles.calloutBody}>{step.callout.body}</p>
          </motion.aside>
        ) : null}
      </div>
    </div>
  );
}
