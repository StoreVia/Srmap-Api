import { solveCaptcha } from "@/backendUtils/utils/functions";
import { main, captcha, authenticate } from "@/backendUtils/utils/headers";

interface LoginResponse {
  success: boolean;
  sessionId?: string;
  message?: string;
}

async function attemptLogin(username: string, password: string): Promise<LoginResponse> {
  const mainRes = await fetch("https://student.srmap.edu.in/srmapstudentcorner/StudentLoginPage", {
    method: "GET",
    headers: main
  });


  if (!mainRes.ok) {
    throw new Error("Srm Student Portal is unreachable. Please try again later.");
  }

  const htmlPage = await mainRes.text();
  const capidMatch = htmlPage.match(/capid=([^"&]+)/);
  const tokenMatch = htmlPage.match(/name="txtAuthToken"\s+value="([a-f0-9]+)"/);
  if (!capidMatch || !tokenMatch) throw new Error("Required tokens not found");

  const setCookie = mainRes.headers.get("set-cookie") || "";
  const jsessionIdMatch = setCookie.match(/JSESSIONID=([^;]+)/);
  if (!jsessionIdMatch) throw new Error("Session id not found");

  const capid = capidMatch[1];
  const authToken = tokenMatch[1];
  const tempJsessionId = jsessionIdMatch[1];

  const captchaRes = await fetch(`https://student.srmap.edu.in/srmapstudentcorner/captchas?capid=${capid}`, {
    method: "GET",
    headers: captcha(tempJsessionId)
  });

  const captchaBuffer = Buffer.from(await captchaRes.arrayBuffer());
  const captchaText = await solveCaptcha(captchaBuffer);
  if (!captchaText) throw new Error("Captcha solving failed");

  const payload = new URLSearchParams({
    ccode: captchaText,
    txtUserName: username,
    txtAuthKey: password,
    txtAuthToken: authToken
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
