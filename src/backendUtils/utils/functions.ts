import axios from "axios";
import crypto from 'crypto';
import jwt from "jsonwebtoken";
import FormData from "form-data";
import { useMongo } from "@/lib/database/useMongo";
import { basic } from "@/backendUtils/utils/headers";
import { NextRequest, NextResponse } from "next/server";
import { validUser } from "@/backendUtils/auth/verifyUser";
import { userBlockedResponse } from "@/backendUtils/utils/responses";
import { httpAgent, httpsAgent } from "@/backendUtils/utils/httpAgents";

const secret = process.env.ACCESS_SECRET!;
const expire = process.env.ACCESS_EXPIRE!;

export function createClient(sessionId: string) {
  return axios.create({
    timeout: 8000,
    withCredentials: true,
    httpAgent,
    httpsAgent,
    headers: basic(sessionId)
  });
}

export function deriveKey(password: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
};

export function encryptData(data: unknown, password: string): unknown {
    const salt = crypto.randomBytes(16);
    const key = deriveKey(password, salt);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const jsonData = Buffer.from(JSON.stringify(data), 'utf8');
    const encrypted = Buffer.concat([cipher.update(jsonData), cipher.final()]);
    const combined = Buffer.concat([salt, iv, encrypted]);
    return combined.toString('base64');
};

export function decryptData(encryptedData: unknown, password: string): unknown {
    if (typeof encryptedData !== "string") throw new Error("decryptData error: encryptedData must be a base64 string");
    const data = Buffer.from(encryptedData, "base64");
    if (data.length < 32) throw new Error('decryptData error: input is too short to contain salt + iv');
    const salt = data.subarray(0, 16);
    const iv = data.subarray(16, 32);
    const encrypted = data.subarray(32);
    const key = deriveKey(password, salt);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted: Buffer;
    try {
        decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    } catch (err: any) {
        throw new Error(`decryptData error: ${err.message}`);
    }
    try {
        return JSON.parse(decrypted.toString('utf8')) as Record<string, unknown>;
    } catch (err: any) {
        throw new Error(`Invalid JSON after decryption: ${err.message}`);
    }
};

export function createToken(payload: object) {
    return jwt.sign(payload, secret, { expiresIn: `${Number(expire)}d` });
};

export function verifyToken(token: string) {
    try {
        return jwt.verify(token, secret);
    } catch {
        return null;
    }
};

export async function requireAuthResponse(req: NextRequest): Promise<{ payload: any; token?: string } | NextResponse> {
    const { valid, payload, token } = await validUser(req);
    if (!valid || !payload) return errorResponse("Unauthorized!", { action: "logout" }, 401);
    if (await isBlocked(payload.username)) return userBlockedResponse();
    return { payload, token };
};

export async function requireAuthResponseAdmin(req: NextRequest): Promise<{ payload: any } | NextResponse> {
    const { valid, payload } = await validUser(req);
    if (!valid || !payload) return errorResponse("Unauthorized!", { action: "logout" }, 401);
    if (await isBlocked(payload.username)) return userBlockedResponse();
    if (!isAdmin(payload.username)){
        return errorResponse("You don't have admin privilages!");
    }
    return { payload };
};

export async function isBlocked(username: string): Promise<boolean> {
    if (!username) return false;
    try {
        const initDb = await useMongo();
        const dbBlocked = initDb.db('college_db').collection("blocked");
        const blockedUser = await dbBlocked.findOne({ username: username.toUpperCase() });
        return !!blockedUser;
    } catch (err) {
        console.error("Error checking blocked user:", err);
        return false;
    }
};

export function errorResponse(message?: string, data: Record<string, any> = {}, status: number = 400): NextResponse {
    return NextResponse.json({ success: false, message: message ?? "Something Went Wrong!", ...data }, { status });
};

export function isAdmin(username: string): boolean {
    const adminUsers = ["AP24110010198", "AP24110011130", "AP24110010834"];
    return adminUsers.includes(username);
};

export async function solveCaptcha(imageBuffer: Buffer): Promise<string | null> {
    const form = new FormData();
    form.append("file", imageBuffer, { filename: "captcha.png", contentType: "image/png" });
    try {
        const response = await axios.post("http://0.0.0.0:6000/captcha", form, { headers: form.getHeaders(), timeout: 30000 });
        return response.data as string;
    } catch (error: any) {
        console.log("Error In Solving Captcha. Error From Functions.Captcha:- ", error.message);
        return null;
    }
};

export async function callApiWithRetry(apiCall: () => Promise<any>, maxAttempts: number = 3): Promise<any> {
    let attempts = 0;
    while (attempts < maxAttempts) {
        attempts++;
        try {
            const result = await apiCall();
            return result;
        } catch (err) {
            if (attempts >= maxAttempts) throw err;
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts - 1) * 1000));
        }
    }
};