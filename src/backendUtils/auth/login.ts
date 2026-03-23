import { solveCaptcha } from "@/server/utils/functions";
import { main, captcha, authenticate } from "@/server/utils/headers";

export interface LoginResponse {
  success: boolean;
  sessionId?: string;
  message?: string;
}

export interface LoginFields {
  usernameField: string;
  passwordField: string;
  authTokenField: string;
  authTokenValue: string;
  capid: string;
}

function extractLoginFields(html: string): LoginFields {
  const capidMatch = html.match(/capid=([^"&\s]+)/);
  if (!capidMatch) throw new Error("capid not found in login page");
  const capid = capidMatch[1];

  const assignments = [...html.matchAll(/\$\("#"\s*\+\s*"([a-f0-9]{32})"\)\.val\(([^)]+)\)/g)];
  if (assignments.length < 3) throw new Error(`Could not find field assignments in script. Found: ${assignments.length}`);

  let usernameField: string | undefined;
  let passwordField: string | undefined;
  let authTokenField: string | undefined;
  let authTokenValue: string | undefined;

  for (const match of assignments) {
    const fieldName = match[1];
    const valueExpr = match[2].trim();

    if (valueExpr.startsWith('"') || valueExpr.startsWith("'")) {
      authTokenField = fieldName;
      authTokenValue = valueExpr.replace(/['"]/g, "");
    } else if (valueExpr.includes("UserName")) {
      usernameField = fieldName;
    } else if (valueExpr.includes("AuthKey")) {
      passwordField = fieldName;
    }
  }

  if (!usernameField) throw new Error("Username field not found");
  if (!passwordField) throw new Error("Password field not found");
  if (!authTokenField || !authTokenValue) throw new Error("Auth token field not found");

  return { usernameField, passwordField, authTokenField, authTokenValue, capid };
}

async function attemptLogin(username: string, password: string): Promise<LoginResponse> {
  const mainRes = await fetch("https://student.srmap.edu.in/srmapstudentcorner/StudentLoginPage", {
    method: "GET",
    headers: main
  });

  if (!mainRes.ok) {
    throw new Error("SRM Student Portal is unreachable. Please try again later.");
  }

  const htmlPage = await mainRes.text();

  const setCookie = mainRes.headers.get("set-cookie") || "";
  const jsessionIdMatch = setCookie.match(/JSESSIONID=([^;]+)/);
  if (!jsessionIdMatch) throw new Error("Session ID not found");
  const tempJsessionId = jsessionIdMatch[1];

  const { usernameField, passwordField, authTokenField, authTokenValue, capid } = extractLoginFields(htmlPage);

  const captchaRes = await fetch(`https://student.srmap.edu.in/srmapstudentcorner/captchas?capid=${capid}`, {
    method: "GET",
    headers: captcha(tempJsessionId)
  });

  const captchaBuffer = Buffer.from(await captchaRes.arrayBuffer());
  const captchaText = await solveCaptcha(captchaBuffer);
  if (!captchaText) throw new Error("Captcha solving failed");

  const payload = new URLSearchParams({
    [usernameField]: username,
    [passwordField]: password,
    [authTokenField]: authTokenValue,
    ccode: captchaText
  });

  const loginRes = await fetch("https://student.srmap.edu.in/srmapstudentcorner/StudentLoginToPortal", {
    method: "POST",
    headers: authenticate(tempJsessionId),
    body: payload
  });

  const html = await loginRes.text();
  const nameMatch = html.match(/<h2>(.*?)<\/h2>/);
  if (!nameMatch) throw new Error("Invalid credentials");

  return { success: true, sessionId: tempJsessionId };
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
        error.message.includes("network")
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
