import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

export interface ConceptEntry {
  id: string;
  name: string;
  tagline: string;
  Component: LazyExoticComponent<ComponentType>;
}

/** Shortlisted visual concepts. Earlier explorations remain in src/concepts/. */
export const concepts: ConceptEntry[] = [
  {
    id: 'vault',
    name: 'Vault',
    tagline: 'Dark luxury',
    Component: lazy(() =>
      import('./vault/Vault').then((module) => ({ default: module.Vault })),
    ),
  },
  {
    id: 'haven',
    name: 'Haven',
    tagline: 'Money wellness',
    Component: lazy(() =>
      import('./haven/Haven').then((module) => ({ default: module.Haven })),
    ),
  },
  {
    id: 'flux',
    name: 'Flux',
    tagline: 'Kinetic playground',
    Component: lazy(() =>
      import('./flux/Flux').then((module) => ({ default: module.Flux })),
    ),
  },
];

/** This build defaults to Vault; Haven is available via the preview switcher. */
export const defaultConcept = 'vault';

/** Concepts exposed in the review switcher. */
export const previewConcepts = concepts.filter(
  (concept) => concept.id === 'vault' || concept.id === 'haven',
);

export const liveConcept =
  concepts.find((concept) => concept.id === defaultConcept)!;

export function resolveConcept(id?: string | null): ConceptEntry {
  const match = previewConcepts.find((concept) => concept.id === id);
  return match ?? liveConcept;
}

export function readConceptFromUrl(): string {
  const raw = new URLSearchParams(window.location.search).get('c');
  return resolveConcept(raw).id;
}
