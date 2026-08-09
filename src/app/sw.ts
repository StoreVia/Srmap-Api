/// <reference lib="webworker" />

import { CacheFirst, ExpirationPlugin, NetworkOnly, StaleWhileRevalidate } from "serwist";
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
      matcher: ({ url }) =>
        url.origin === "https://student.srmap.edu.in" &&
        url.pathname.startsWith("/srmapstudentcorner/resources/photos/"),
      handler: new NetworkOnly(),
    },
    {
      matcher: ({ url }) =>
        url.pathname === "/_next/image" &&
        url.searchParams.get("url")?.startsWith("https://student.srmap.edu.in/srmapstudentcorner/resources/photos/") === true,
      handler: new NetworkOnly(),
    },
    {
      matcher: ({ url }) => url.pathname.startsWith("/student/srmapstudentcorner/resources/photos/"),
      handler: new NetworkOnly(),
    },
    {
      matcher: ({ url }) => url.pathname.startsWith("/student/srmapstudentcorner/captchas"), 
      handler: new NetworkOnly(),
    },
    {
      matcher: ({ url }) =>
        url.pathname === "/student-enhancer.js",
      handler: new NetworkOnly(),
    },
    {
      matcher: ({ request, url }) =>
        request.destination === "image" &&
        url.origin === self.location.origin &&
        !url.pathname.startsWith("/student/"),
      handler: new CacheFirst({
        cacheName: "site-images",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 200,
            maxAgeSeconds: 60 * 60 * 24 * 30,
          }),
        ],
      }),
    },
    {
      matcher: ({ request }) =>
        request.destination === "script" ||
        request.destination === "style",
      handler: new StaleWhileRevalidate(),
    },
    {
      matcher: ({ request }) =>
        request.mode === "navigate",
      handler: new StaleWhileRevalidate(),
    },
  ],
  cleanupOutdatedCaches: true,
});