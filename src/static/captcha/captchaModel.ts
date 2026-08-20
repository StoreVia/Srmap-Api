import path from "node:path";

const staticModelPath = path.join(process.cwd(), "src/static/captcha/model/captcha_float32.tflite");

export const captchaModelPath = staticModelPath;