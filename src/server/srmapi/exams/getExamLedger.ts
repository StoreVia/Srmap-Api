import { useMongo } from "@/lib/database/useMongo";
import { isSessionValid } from "@/shared/utils/functions";
import { fetchExamLedger } from "@/server/srmapi/exams/fetchExamLedger";
import { INVALID_CREDENTIALS, UNAUTHORIZED } from "@/shared/utils/messages";

interface ResolveExamLedgerParams {
  username: string;
  sessionId: string;
}

interface ResolveExamLedgerError {
  message?: string;
  data?: Record<string, any>;
  status?: number;
}

interface ResolveExamLedgerResult {
  data?: Awaited<ReturnType<typeof fetchExamLedger>>;
  error?: ResolveExamLedgerError;
}

export async function getExamLedgerForUser({
  username,
  sessionId,
}: ResolveExamLedgerParams): Promise<ResolveExamLedgerResult> {
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

  const result = await fetchExamLedger(sessionId || user.session);
  if (!result) {
    return { error: { message: INVALID_CREDENTIALS, data: { action: "logout" } } };
  }

  return { data: result };
}
