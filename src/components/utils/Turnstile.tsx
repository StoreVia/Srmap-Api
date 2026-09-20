"use client";

import { useEffect, useRef } from "react";

interface TurnstileProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  theme?: "light" | "dark" | "auto";
  className?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: Record<string, unknown>
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

const SITEKEY = process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY!;

export function Turnstile({ onVerify, onExpire, onError, theme = "auto", className }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const callbacksRef = useRef({ onVerify, onExpire, onError });
  callbacksRef.current = { onVerify, onExpire, onError };

  useEffect(() => {
    let cancelled = false;

    function renderWidget() {
      if (cancelled || !window.turnstile || !containerRef.current) return;

      if (widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }

      containerRef.current.innerHTML = "";

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: SITEKEY,
        theme,
        callback: (token: string) => callbacksRef.current.onVerify(token),
        "expired-callback": () => callbacksRef.current.onExpire?.(),
        "error-callback": () => callbacksRef.current.onError?.(),
      });
    }

    const existingScript = document.querySelector(
      'script[src*="challenges.cloudflare.com/turnstile"]'
    );

    if (window.turnstile) {
      renderWidget();
    } else if (existingScript) {
      window.onTurnstileLoad = renderWidget;
    } else {
      window.onTurnstileLoad = renderWidget;
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [theme]);

  return <div ref={containerRef} className={className} />;
}
