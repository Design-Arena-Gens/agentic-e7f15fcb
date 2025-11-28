"use client";

import { createContext, useContext, useMemo, useRef, useState } from 'react';

export type MapActions = {
  flyTo: (lat: number, lng: number, label?: string) => void;
  focusCountryByName: (name: string) => boolean;
  highlightCapitalByName: (name: string) => boolean;
};

export type MapCommand =
  | { type: 'pan'; lat: number; lng: number }
  | { type: 'none' };

const Ctx = createContext<{
  actionsRef: React.MutableRefObject<MapActions | null>;
  lastCommand: MapCommand | null;
  register: (a: MapActions) => void;
} | null>(null);

export function MapActionsProvider({ children }: { children: React.ReactNode }) {
  const actionsRef = useRef<MapActions | null>(null);
  const [lastCommand, setLastCommand] = useState<MapCommand | null>(null);

  const value = useMemo(
    () => ({
      actionsRef,
      lastCommand,
      register(a: MapActions) {
        actionsRef.current = a;
      },
    }),
    [lastCommand]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMapActions() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('MapActionsProvider missing');
  return ctx;
}
