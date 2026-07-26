/// <reference lib="webworker" />

import { StaleWhileRevalidate } from "serwist";
import { installSerwist } from "@serwist/sw";
import type { PrecacheEntry } from "@serwist/precaching";

declare global {
  interface WorkerGlobalScope {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

installSerwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ request }) =>
        request.destination === "script" ||
        request.destination === "style",
      handler: new StaleWhileRevalidate(),
    },
  ],
  cleanupOutdatedCaches: true,
});