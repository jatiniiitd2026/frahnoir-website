"use client";

import { useEffect, useState } from "react";

/** True only after the first client render — guards persisted-cart hydration. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
