import { NextRequest } from "next/server";
import { verifyToken } from "@/backendUtils/utils/functions";

interface TokenPayload {
    username: string;
    password: string;
    token: string;
}

export async function validUser(req: NextRequest): Promise<{ valid: boolean; payload?: TokenPayload; message?: string; token?: string }> {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return { valid: false, message: "Missing Authorization Token!" };
    }
    const token = authHeader.split(" ")[1];
    try {
        const payload = verifyToken(token) as TokenPayload;
        if(payload.password === "") return { valid: false, message: "Corrupted Token!" };
        return { valid: true, payload, token };
    } catch (err: any) {
        return { valid: false, message: "Invalid Or Expired Token!" };
    }
}