import { solveCaptcha } from "@/server/utils/functions";
import { main, captcha, authenticate } from "@/server/utils/headers";
import { LoginResponse } from "@/types/server/login";

async function attemptLogin(username: string, password: string): Promise<LoginResponse> {
  const mainRes = await fetch("https://student.srmap.edu.in/srmapstudentcorner/StudentLoginPage", {
    method: "GET",
    headers: main
  });

  if (!mainRes.ok) throw new Error("SRM server is unreachable. Please try again later.");

  const setCookie = mainRes.headers.get("set-cookie") || "";
  const jsessionIdMatch = setCookie.match(/JSESSIONID=([^;]+)/);
  if (!jsessionIdMatch) throw new Error("Session ID not found");
  const jsessionId = jsessionIdMatch[1];

  const captchaRes = await fetch("https://student.srmap.edu.in/srmapstudentcorner/captchas", {
    method: "GET",
    headers: captcha(jsessionId)
  });

  if (!captchaRes.ok) throw new Error("SRM server is unreachable. Please try again later.");

  const captchaBuffer = Buffer.from(await captchaRes.arrayBuffer());
  const captchaTextRaw = await solveCaptcha(captchaBuffer);
  if (!captchaTextRaw) throw new Error("Captcha solving failed");

  const payload = new URLSearchParams({
    txtUserName: username,
    txtAuthKey: password,
    ccode: captchaTextRaw,
  });

  const loginRes = await fetch("https://student.srmap.edu.in/srmapstudentcorner/StudentLoginToPortal", {
    method: "POST",
    headers: authenticate(jsessionId),
    body: payload
  });

  const html = await loginRes.text();
  const nameMatch = html.match(/<h2>(.*?)<\/h2>/);
  if (!nameMatch) throw new Error("Invalid credentials");

  return { success: true, sessionId: jsessionId };
}

async function login(username: string, password: string): Promise<LoginResponse> {
  try {
    return await attemptLogin(username, password);
  } catch (error: unknown) {
    console.log("Error From /backendUtils/auth/login:- ", error);
    let message = "Login Failed, Please Check Your Credentials!";
    if (error instanceof Error) {
      if (
        error.message.includes("fetch failed") ||
        error.message.includes("ECONNREFUSED") ||
        error.message.includes("ENOTFOUND") ||
        error.message.includes("network") ||
        error.message.includes("timeout") ||
        error.message.includes("ETIMEDOUT") ||
        error.message.includes("socket") ||
        error.message.includes("failed to fetch")
      ) {
        message = "SRM server is unreachable. Please try again later.";
      } else {
        message = error.message;
      }
    }
    return { success: false, message };
  }
}

export { login };