import http from "http";
import https from "https";

export const httpAgent = new http.Agent({
  keepAlive: true,
  maxSockets: 50
});

export const httpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 50
});