import { NextRequest, NextResponse } from "next/server";
import { requireAuthResponse, errorResponse } from "@/server/utils/functions";
import { createShare } from "@/server/share/shareService";

const MAX_TOTAL_BYTES = 10 * 1024 * 1024;
const MAX_FILES_COUNT = 20;
const MAX_ALLOWED_REG_NOS = 100;

export async function POST(req: NextRequest) {
    const auth = await requireAuthResponse(req);
    if (auth instanceof NextResponse) return auth;

    try {
        const formData = await req.formData().catch(() => null);
        if (!formData) {
            return errorResponse("Invalid form data submission", {}, 400);
        }

        const text = (formData.get("text") as string) || "";
        const isPublic = formData.get("isPublic") === "true";
        const allowedRegNosRaw = (formData.get("allowedRegNos") as string) || "";
        const password = (formData.get("password") as string) || "";
        const expiryMinutesRaw = formData.get("expiryMinutes");
        const maxDownloadsRaw = formData.get("maxDownloads");

        const expiryMinutes = expiryMinutesRaw ? Number(expiryMinutesRaw) : 120;
        const maxDownloads = maxDownloadsRaw ? Number(maxDownloadsRaw) : 10;

        if (isNaN(expiryMinutes) || expiryMinutes < 1 || expiryMinutes > 120) {
            return errorResponse("Expiry duration must be between 1 and 120 minutes", {}, 400);
        }

        if (isNaN(maxDownloads) || maxDownloads < 1 || maxDownloads > 10) {
            return errorResponse("Max downloads limit must be between 1 and 10", {}, 400);
        }

        const filesData: Array<{ name: string; size: number; type: string; buffer: Buffer }> = [];
        const fileEntries = formData.getAll("files");

        if (fileEntries.length > MAX_FILES_COUNT) {
            return errorResponse(`Too many files attached. Maximum allowed is ${MAX_FILES_COUNT} files.`, {}, 400);
        }

        let totalFilesBytes = 0;

        for (const entry of fileEntries) {
            if (entry instanceof File && entry.size > 0) {
                if (entry.size > MAX_TOTAL_BYTES) {
                    return errorResponse(`File "${entry.name}" exceeds the 10MB maximum file size limit`, {}, 400);
                }

                totalFilesBytes += entry.size;
                if (totalFilesBytes > MAX_TOTAL_BYTES) {
                    return errorResponse("Total attached files size exceeds the 10MB upload limit", {}, 400);
                }

                const arrayBuffer = await entry.arrayBuffer();
                const safeName = entry.name.replace(/[/\\?%*:|"<>]/g, "_").trim() || "unnamed_file";

                filesData.push({
                    name: safeName,
                    size: entry.size,
                    type: entry.type || "application/octet-stream",
                    buffer: Buffer.from(arrayBuffer)
                });
            }
        }

        const textBytes = Buffer.byteLength(text, "utf8");
        if (textBytes > MAX_TOTAL_BYTES) {
            return errorResponse("Text content exceeds the 10MB maximum limit", {}, 400);
        }

        if (textBytes + totalFilesBytes > MAX_TOTAL_BYTES) {
            return errorResponse("Total share payload (text + files) exceeds 10MB limit", {}, 400);
        }

        if (textBytes === 0 && filesData.length === 0) {
            return errorResponse("Share cannot be empty. Please provide text or attach at least one file.", {}, 400);
        }

        const allowedRegNos = allowedRegNosRaw
            .split(/[\s,]+/)
            .map((r) => r.trim().toUpperCase())
            .filter((r) => r.length > 0 && /^[A-Z0-9_-]+$/.test(r))
            .slice(0, MAX_ALLOWED_REG_NOS);

        if (password && password.length > 128) {
            return errorResponse("Password is too long (maximum 128 characters)", {}, 400);
        }

        const result = await createShare({
            creatorUsername: auth.payload.username,
            text: text.trim(),
            files: filesData,
            isPublic,
            allowedRegNos,
            password: password.trim() || undefined,
            maxDownloads,
            expiryMinutes
        });

        return NextResponse.json({
            success: true,
            data: result
        });
    } catch (err: any) {
        console.error(err);
        return errorResponse(err.message || "Failed to create share", {}, 400);
    }
}
