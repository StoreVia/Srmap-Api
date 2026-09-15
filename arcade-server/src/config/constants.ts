export const TIME_CONTROLS = {
  TEN_MIN: 600,
  TWENTY_MIN: 1200,
  THIRTY_MIN: 1800,
} as const;

export type AllowedTimeControl = (typeof TIME_CONTROLS)[keyof typeof TIME_CONTROLS];

export const VALID_TIME_CONTROLS: AllowedTimeControl[] = [
  TIME_CONTROLS.TEN_MIN,
  TIME_CONTROLS.TWENTY_MIN,
  TIME_CONTROLS.THIRTY_MIN,
];

export const WS_PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8081;
export const DISCONNECT_TIMEOUT_MS = 60000;
export const PING_INTERVAL_MS = 15000;
export const PONG_TIMEOUT_MS = 30000;