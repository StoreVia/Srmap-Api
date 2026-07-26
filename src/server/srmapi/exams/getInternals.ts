import { useMongo } from "@/lib/database/useMongo";
import { isSessionValid } from "@/shared/utils/functions";
import { fetchInternalMarks } from "@/server/srmapi/exams/fetchInternals";
import { INVALID_CREDENTIALS, UNAUTHORIZED } from "@/shared/utils/messages";

interface ResolveInternalsParams {
  username: string;
  sessionId: string;
}

interface ResolveInternalsError {
  message?: string;
  data?: Record<string, any>;
  status?: number;
}

interface ResolveInternalsResult {
  data?: Awaited<ReturnType<typeof fetchInternalMarks>>;
  error?: ResolveInternalsError;
}

export async function getInternalsForUser({
  username,
  sessionId,
}: ResolveInternalsParams): Promise<ResolveInternalsResult> {
  const initDb = await useMongo();
  const db = initDb.db("college_db").collection("users");
  const user = await db.findOne({ username });

  if (!user) {
    return { error: { message: UNAUTHORIZED, data: { action: "logout" } } };
  }

  const validSession = isSessionValid(user.session_time);
  if (!validSession) {
    return { error: {} };
  }

  const result = await fetchInternalMarks(sessionId || user.session);
  if (!result) {
    return { error: { message: INVALID_CREDENTIALS, data: { action: "logout" } } };
  }

  return { data: result };
}
