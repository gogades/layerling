"use client";

import { useSyncExternalStore } from "react";
import { getAdvancedMode, getSimpleMode, subscribeToSimpleMode } from "@/lib/simpleMode";

export function useSimpleMode(): boolean {
  return useSyncExternalStore(subscribeToSimpleMode, getSimpleMode, () => false);
}

export function useAdvancedMode(): boolean {
  return useSyncExternalStore(subscribeToSimpleMode, getAdvancedMode, () => false);
}
