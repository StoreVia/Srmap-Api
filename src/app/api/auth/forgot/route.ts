import axios from "axios";
import * as cheerio from "cheerio";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";
import { NextRequest, NextResponse } from "next/server";
import { isValidPassword } from "@/validators/auth/forgot";
import { PARAMETERS } from "@/fullStackUtils/utils/messages";
import { userBlockedResponseLogin } from "@/backendUtils/utils/responses";
import { isBlocked, solveCaptcha, errorResponse } from "@/backendUtils/utils/functions";

export async function POST(req: NextRequest) {
    const body = await req.json();
    let { type, username } = body;

    username = username?.toUpperCase() || "";

    if (!username || !type || !["initiate", "change"].includes(type)) {
        return errorResponse(PARAMETERS);
    }

    try {
        if(await isBlocked(username)){
            return userBlockedResponseLogin();
        }

        if (type === 'initiate') {
            const FORGOT_REQUEST_URL = 'https://student.srmap.edu.in/srmapstudentcorner/StudentPasswordResetInitiate';

            const jar = new CookieJar();
            const session = wrapper(axios.create({ jar }));
            session.defaults.headers["User-Agent"] = "Mozilla/5.0";

            await session.get("https://student.srmap.edu.in/srmapstudentcorner/");
            const captchaResponse = await session.get('https://student.srmap.edu.in/srmapstudentcorner/captchas', { responseType: 'arraybuffer' });

            const captchaBuffer = Buffer.from(captchaResponse.data, "binary");
            const captchaText = await solveCaptcha(captchaBuffer);

            if (!captchaText) {
                return errorResponse("Solving Captcha Failed!", {}, 500);
            }

            const payload = new URLSearchParams({
                ccode: captchaText,
                txtAuthKey: '',
                txtUserName: username,
            });

            const response = await session.post(FORGOT_REQUEST_URL, payload);
            const html = response.data;
            const $ = cheerio.load(html);
            const title = $('title').text().trim();

            if (title.includes('Password Reset')) {
                return NextResponse.json({ success: true, message: "Otp Sent Successfully!" });
            } else if (title.includes('Student Login')) {
                return errorResponse("Otp Limit Exceeded!", {}, 429);
            } else {
                return errorResponse(undefined, {}, 500);
            }
        } else {
            let { newpass, otp } = body;

            if (!otp || !newpass) {
                return errorResponse(PARAMETERS);
            }

            const [valid, error] = isValidPassword(newpass);
            if (!valid) {
                return errorResponse("Validation Failed!", { failed: error }, 422);
            }

            const session = axios.create({ withCredentials: true });

            const payload = new URLSearchParams({
                cpassword: newpass,
                ids: '1',
                txtUserName: username,
                passwordotp: otp,
            });

            const response = await session.post(
                'https://student.srmap.edu.in/srmapstudentcorner/usermanager/loginmanager/loginmanagerresources.jsp',
                payload,
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
            );

            if (typeof response.data === 'object' && response.data.resultstatus === '1') {
                return NextResponse.json({ success: true, message: "Otp Matched!" });
            } else {
                return errorResponse("Otp Not Matched!", {}, 401);
            }
        }
    } catch (err) {
        console.log("Error From /api/auth/forgot:- ", err);
        return errorResponse(undefined, {}, 500);
    }
}