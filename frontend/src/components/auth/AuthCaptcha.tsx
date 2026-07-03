import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

export const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? "";

export const isCaptchaConfigured = Boolean(turnstileSiteKey);

export type AuthCaptchaHandle = {
  reset: () => void;
};

type AuthCaptchaProps = {
  onToken: (token: string) => void;
  onExpire?: () => void;
};

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      theme?: "light" | "dark" | "auto";
      callback?: (token: string) => void;
      "expired-callback"?: () => void;
    }
  ) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const TURNSTILE_SCRIPT =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let scriptPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) {
    return Promise.resolve();
  }
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = TURNSTILE_SCRIPT;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Turnstile."));
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

export const AuthCaptcha = forwardRef<AuthCaptchaHandle, AuthCaptchaProps>(
  function AuthCaptcha({ onToken, onExpire }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const onTokenRef = useRef(onToken);
    const onExpireRef = useRef(onExpire);

    useEffect(() => {
      onTokenRef.current = onToken;
      onExpireRef.current = onExpire;
    }, [onToken, onExpire]);

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current);
        }
        onTokenRef.current("");
      },
    }));

    useEffect(() => {
      if (!isCaptchaConfigured || !containerRef.current) {
        return;
      }

      let cancelled = false;

      loadTurnstileScript()
        .then(() => {
          if (cancelled || !containerRef.current || !window.turnstile) {
            return;
          }
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: turnstileSiteKey,
            theme: "light",
            callback: (token) => onTokenRef.current(token),
            "expired-callback": () => {
              onExpireRef.current?.();
              onTokenRef.current("");
            },
          });
        })
        .catch(() => {
          onTokenRef.current("");
        });

      return () => {
        cancelled = true;
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        }
      };
    }, []);

    if (!isCaptchaConfigured) {
      return null;
    }

    return (
      <div className="flex justify-center">
        <div ref={containerRef} />
      </div>
    );
  }
);
