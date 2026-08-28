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
  {
    id: 'clearing',
    name: 'Clearing',
    tagline: 'Fog lifting',
    Component: lazy(() =>
      import('./clearing/Clearing').then((module) => ({
        default: module.Clearing,
      })),
    ),
  },
  {
    id: 'clearing-lab',
    name: 'Clearing lab',
    tagline: 'Scene scrubber',
    Component: lazy(() =>
      import('./clearing/ClearingSceneDemo').then((module) => ({
        default: module.ClearingSceneDemo,
      })),
    ),
  },
  {
    id: 'thread',
    name: 'Thread',
    tagline: 'Messy to tidy',
    Component: lazy(() =>
      import('./thread/Thread').then((module) => ({ default: module.Thread })),
    ),
  },
  {
    id: 'thread-lab',
    name: 'Thread lab',
    tagline: 'Scene scrubber',
    Component: lazy(() =>
      import('./thread/ThreadSceneDemo').then((module) => ({
        default: module.ThreadSceneDemo,
      })),
    ),
  },
  {
    id: 'morph',
    name: 'Morph',
    tagline: 'Liquid glass',
    Component: lazy(() =>
      import('./morph/Morph').then((module) => ({ default: module.Morph })),
    ),
  },
  {
    id: 'morph-lab',
    name: 'Morph lab',
    tagline: 'Scene scrubber',
    Component: lazy(() =>
      import('./morph/MorphSceneDemo').then((module) => ({
        default: module.MorphSceneDemo,
      })),
    ),
  },
  {
    id: 'pulse',
    name: 'Pulse',
    tagline: 'Unboxed signal',
    Component: lazy(() =>
      import('./pulse/Pulse').then((module) => ({ default: module.Pulse })),
    ),
  },
  {
    id: 'pulse-lab',
    name: 'Pulse lab',
    tagline: 'Field scrubber',
    Component: lazy(() =>
      import('./pulse/PulseSceneDemo').then((module) => ({
        default: module.PulseSceneDemo,
      })),
    ),
  },
  {
    id: 'mosaic',
    name: 'Mosaic',
    tagline: 'Hand-colored tracker',
    Component: lazy(() =>
      import('./mosaic/Mosaic').then((module) => ({ default: module.Mosaic })),
    ),
  },
  {
    id: 'mosaic-lab',
    name: 'Mosaic lab',
    tagline: 'Tile scrubber',
    Component: lazy(() =>
      import('./mosaic/MosaicSceneDemo').then((module) => ({
        default: module.MosaicSceneDemo,
      })),
    ),
  },
  {
    id: 'unburden',
    name: 'Unburden',
    tagline: 'Weight lifting off',
    Component: lazy(() =>
      import('./unburden/Unburden').then((module) => ({
        default: module.Unburden,
      })),
    ),
  },
  {
    id: 'unburden-lab',
    name: 'Unburden lab',
    tagline: 'Pose scrubber',
    Component: lazy(() =>
      import('./unburden/UnburdenSceneDemo').then((module) => ({
        default: module.UnburdenSceneDemo,
      })),
    ),
  },
];

/** This preview ships Unburden only — no concept switcher on the live link. */
export const defaultConcept = 'unburden';

/** Concepts exposed in the review switcher. Empty / single entry hides the dock. */
const previewIds = ['unburden'];

export const previewConcepts = concepts.filter((concept) =>
  previewIds.includes(concept.id),
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
