import { Suspense } from 'react';
import { MotionConfig } from 'motion/react';
import { JourneyProvider } from './engine/journey';
import { ConceptProvider } from './engine/concept';
import { liveConcept } from './concepts/registry';
import { Splash } from './shell/Splash';

export function App() {
  const Concept = liveConcept.Component;

  return (
    <MotionConfig reducedMotion="user">
      <ConceptProvider id={liveConcept.id}>
        <JourneyProvider>
          <Suspense fallback={<Splash />}>
            <Concept />
          </Suspense>
        </JourneyProvider>
      </ConceptProvider>
    </MotionConfig>
  );
}
