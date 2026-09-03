import { solveCaptcha } from "@/lib/captcha";
import { main, captcha, authenticate } from "@/server/utils/headers";
import { LoginResponse } from "@/types/server/login";

async function attemptLogin(username: string, password: string): Promise<LoginResponse> {
  let mainRes: Response;
  try {
    mainRes = await fetch("https://student.srmap.edu.in/srmapstudentcorner/StudentLoginPage", {
      method: "GET",
      headers: main
    });
  } catch (err) {
    throw new Error("SRM server is unreachable. Please try again later.");
  }

  if (!mainRes.ok) throw new Error("SRM server is unreachable. Please try again later.");

  const setCookie = mainRes.headers.get("set-cookie") || "";
  const jsessionIdMatch = setCookie.match(/JSESSIONID=([^;]+)/);
  if (!jsessionIdMatch) throw new Error("Session ID not found");
  const jsessionId = jsessionIdMatch[1];

  let captchaRes: Response;
  try {
    captchaRes = await fetch("https://student.srmap.edu.in/srmapstudentcorner/captchas", {
      method: "GET",
      headers: captcha(jsessionId)
    });
  } catch (err) {
    throw new Error("SRM server is unreachable. Please try again later.");
  }

  if (!captchaRes.ok) throw new Error("SRM server is unreachable. Please try again later.");

  const captchaBuffer = Buffer.from(await captchaRes.arrayBuffer());
  const captchaTextRaw = await solveCaptcha(captchaBuffer);
  if (!captchaTextRaw) throw new Error("Captcha solving failed");

  const payload = new URLSearchParams({
    txtUserName: username,
    txtAuthKey: password,
    ccode: captchaTextRaw,
  });

  let loginRes: Response;
  try {
    loginRes = await fetch("https://student.srmap.edu.in/srmapstudentcorner/StudentLoginToPortal", {
      method: "POST",
      headers: authenticate(jsessionId),
      body: payload
    });
  } catch (err) {
    throw new Error("SRM server is unreachable. Please try again later.");
  }

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
      message = error.message;
    }
    return { success: false, message };
  }
}

export { login };