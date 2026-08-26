import { createContext, useContext, type ReactNode } from 'react';

const ConceptContext = createContext('haven');

export function ConceptProvider({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  return <ConceptContext.Provider value={id}>{children}</ConceptContext.Provider>;
}

export function useConcept(): string {
  return useContext(ConceptContext);
}
