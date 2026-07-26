import { PARAMETERS, USER_BLOCKED } from "@/shared/utils/messages";
import { errorResponse } from "@/server/utils/functions";

export const userBlockedResponse = () => {
  return errorResponse(USER_BLOCKED, { action: "blocked" }, 400);
};

export const paramatersNotMatched = () => {
  return errorResponse(PARAMETERS, {}, 400);
};