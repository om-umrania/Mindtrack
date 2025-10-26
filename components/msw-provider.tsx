"use client";

import { useEffect } from "react";

export function MswProvider() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    let cancelled = false;

    const startWorker = async () => {
      try {
        const { worker } = await import("@/src/mocks/browser");
        if (!cancelled) {
          await worker.start({ onUnhandledRequest: "bypass" });
        }
      } catch (error) {
        console.error("Failed to start MSW", error);
      }
    };

    startWorker();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
