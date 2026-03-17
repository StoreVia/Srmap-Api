import { USER_BLOCKED } from "@/fullStackUtils/utils/messages";
import { errorResponse } from "@/backendUtils/utils/functions";

export const userBlockedResponse = () => {
  return errorResponse(USER_BLOCKED, { action: "blocked" }, 400);
};

export const userBlockedResponseLogin = () => {
  return errorResponse(USER_BLOCKED, { action: "blocked" }, 400);
};