const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET!;

interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
}

export async function verifyTurnstileToken(token: string, ip?: string): Promise<{ success: boolean; error?: string }> {
  if (!TURNSTILE_SECRET) {
    console.error("[Turnstile] TURNSTILE_SECRET is not set");
    return { success: false, error: "Turnstile not configured" };
  }

  if (!token) {
    return { success: false, error: "Turnstile verification required" };
  }

  try {
    const body: Record<string, string> = {
      secret: TURNSTILE_SECRET,
      response: token,
    };

    if (ip) body.remoteip = ip;

    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data: TurnstileVerifyResponse = await res.json();

    if (!data.success) {
      console.warn("[Turnstile] Verification failed:", data["error-codes"]);
      return { success: false, error: "Turnstile verification failed" };
    }

    return { success: true };
  } catch (err) {
    console.error("[Turnstile] Verification error:", err);
    return { success: false, error: "Turnstile verification error" };
  }
}