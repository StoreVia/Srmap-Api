import { useMongo } from "@/lib/database/useMongo";
import { isSessionValid } from "@/shared/utils/functions";
import { fetchPastInternals } from "@/server/srmapi/exams/fetchPastInternals";
import { INVALID_CREDENTIALS, UNAUTHORIZED } from "@/shared/utils/messages";

interface ResolvePastInternalsParams {
  username: string;
  sessionId: string;
  semester?: unknown;
}

interface ResolvePastInternalsError {
  message?: string;
  data?: Record<string, any>;
  status?: number;
}

interface ResolvePastInternalsResult {
  data?: Awaited<ReturnType<typeof fetchPastInternals>>;
  error?: ResolvePastInternalsError;
}

function parseSemester(semester?: unknown): number | undefined {
  if (semester === undefined || semester === null || semester === "") {
    return undefined;
  }

  const numericSemester = Number(semester);
  if (!Number.isInteger(numericSemester) || numericSemester <= 0) {
    throw new Error("INVALID_SEMESTER");
  }

  return numericSemester;
}

export async function getPastInternalsForUser({
  username,
  sessionId,
  semester,
}: ResolvePastInternalsParams): Promise<ResolvePastInternalsResult> {
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

  let parsedSemester: number | undefined;
  try {
    parsedSemester = parseSemester(semester);
  } catch {
    return { error: { message: "Invalid semester value" } };
  }

  const result = await fetchPastInternals(sessionId || user.session, parsedSemester);
  if (!result) {
    return { error: { message: INVALID_CREDENTIALS, data: { action: "logout" } } };
  }

  return { data: result };
}
