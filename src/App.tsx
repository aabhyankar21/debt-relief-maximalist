import { Suspense, useCallback, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { JourneyProvider } from './engine/journey';
import { ConceptProvider } from './engine/concept';
import {
  previewConcepts,
  readConceptFromUrl,
  resolveConcept,
} from './concepts/registry';
import { ConceptSwitcher } from './shell/ConceptSwitcher';
import { Splash } from './shell/Splash';

export function App() {
  const [conceptId, setConceptId] = useState(readConceptFromUrl);
  const concept = resolveConcept(conceptId);
  const Concept = concept.Component;

  const handleConceptChange = useCallback((id: string) => {
    setConceptId(id);
    const params = new URLSearchParams(window.location.search);
    params.set('c', id);
    params.delete('s');
    const query = params.toString();
    const next = query
      ? `${window.location.pathname}?${query}`
      : window.location.pathname;
    window.history.replaceState(null, '', next);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <ConceptProvider id={concept.id}>
        <JourneyProvider key={concept.id}>
          <Suspense fallback={<Splash />}>
            <Concept />
          </Suspense>
        </JourneyProvider>
        {previewConcepts.length > 1 ? (
          <ConceptSwitcher
            concepts={previewConcepts}
            activeId={concept.id}
            onChange={handleConceptChange}
          />
        ) : null}
      </ConceptProvider>
    </MotionConfig>
  );
}
