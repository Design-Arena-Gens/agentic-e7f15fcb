"use client";

import { MapActionsProvider } from '../components/MapActionsContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <MapActionsProvider>{children}</MapActionsProvider>;
}
