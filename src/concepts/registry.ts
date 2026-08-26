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

/** This build ships Haven only. Vault/Flux stay in source but are not selectable. */
export const defaultConcept = 'haven';

export const liveConcept =
  concepts.find((concept) => concept.id === defaultConcept)!;

export function resolveConcept(_id?: string | null): ConceptEntry {
  return liveConcept;
}
