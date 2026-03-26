import { solveCaptcha } from "@/server/utils/functions";
import { main, captcha, authenticate } from "@/server/utils/headers";

export interface LoginResponse {
  success: boolean;
  sessionId?: string;
  message?: string;
}

function extractLoginFields(html: string, username: string, password: string) {
  let userField = "";
  let userPrefix = "";
  let userSuffix = "";

  let passField = "";
  let passPrefix = "";
  let passSuffix = "";

  let tokenField = "";
  let tokenValue = "";

  const matches = [...html.matchAll(/\$\("#"\s*\+\s*"([a-f0-9]{32})"\)\.val\(([\s\S]*?)\);/g)];
  if (!matches.length) throw new Error("No dynamic fields found");

  for (const match of matches) {
    const field = match[1];
    const expression = match[2].trim();

    if (expression.includes("#UserName")) {
      const parts = expression.match(/"([a-f0-9]+)"[\s\S]*\+\s*.*UserName[\s\S]*\+\s*"([a-f0-9]+)"/);
      if (!parts) throw new Error("Failed parsing username field");
      userField = field;
      userPrefix = parts[1];
      userSuffix = parts[2];
    }

    else if (expression.includes("#AuthKey")) {
      const parts = expression.match(/"([a-f0-9]+)"[\s\S]*\+\s*.*AuthKey[\s\S]*\+\s*"([a-f0-9]+)"/);
      if (!parts) throw new Error("Failed parsing password field");
      passField = field;
      passPrefix = parts[1];
      passSuffix = parts[2];
    }

    else {
      const tokenMatch = expression.match(/'([a-f0-9]+)'/);
      if (tokenMatch) {
        tokenField = field;
        tokenValue = tokenMatch[1];
      }
    }
  }

  if (!userField || !passField || !tokenField) {
    throw new Error("Failed to extract required login fields");
  }

  const captchaMatch = html.match(/<img\s+src="(\/srmapstudentcorner\/stuportal\/captcha\?([a-f0-9]+)=([a-f0-9]+))"/);

  if (!captchaMatch) throw new Error("Captcha not found");
  const captchaUrl = `https://student.srmap.edu.in${captchaMatch[1]}`;
  const captchaField = captchaMatch[2];

  const payload = new URLSearchParams({
    [userField]: `${userPrefix}${username}${userSuffix}`,
    [passField]: `${passPrefix}${password}${passSuffix}`,
    [tokenField]: tokenValue,
  });

  return { payload, captchaUrl, captchaField };
}

async function attemptLogin(username: string, password: string): Promise<LoginResponse> {
  const mainRes = await fetch("https://student.srmap.edu.in/srmapstudentcorner/StudentLoginPage", {
    method: "GET",
    headers: main
  });

  if (!mainRes.ok) throw new Error("SRM Student Portal is unreachable. Please try again later.");

  const htmlPage = await mainRes.text();

  const setCookie = mainRes.headers.get("set-cookie") || "";
  const jsessionIdMatch = setCookie.match(/JSESSIONID=([^;]+)/);
  if (!jsessionIdMatch) throw new Error("Session ID not found");
  const tempJsessionId = jsessionIdMatch[1];

  const { payload, captchaField, captchaUrl } = extractLoginFields(htmlPage, username, password);

  const captchaRes = await fetch(captchaUrl, {
    method: "GET",
    headers: captcha(tempJsessionId)
  });

  const captchaBuffer = Buffer.from(await captchaRes.arrayBuffer());
  const captchaTextRaw = await solveCaptcha(captchaBuffer);
  if (!captchaTextRaw) throw new Error("Captcha solving failed");

  const captchaText = captchaTextRaw.trim().toUpperCase();
  payload.append(captchaField, captchaText);

  const loginRes = await fetch("https://student.srmap.edu.in/srmapstudentcorner/StudentLoginToPortal",
    {
      method: "POST",
      headers: authenticate(tempJsessionId),
      body: payload.toString(),
      redirect: "manual",
    }
  );

  if (loginRes.status !== 302) throw new Error("Invalid credentials");
  const setCookie1 = loginRes.headers.get("set-cookie") || "";
  const match = setCookie1.match(/JSESSIONID=([^;]+)/);
  if (!match) throw new Error("Session not found after login");
  const finalSessionId = match[1];

  const dashboardRes = await fetch("https://student.srmap.edu.in/srmapstudentcorner/HRDSystem",
    {
      method: "GET",
      headers: authenticate(finalSessionId)
    }
  );

  const dashboardHtml = await dashboardRes.text();
  if (!dashboardHtml.includes("Logout")) {
    throw new Error("Login failed after redirect");
  }

  return { success: true, sessionId: finalSessionId };
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
