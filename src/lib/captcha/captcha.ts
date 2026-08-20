import sharp from "sharp";
import * as tf from "@tensorflow/tfjs";
import * as tfliteModule from "tfjs-tflite-node";
import { captchaModelPath } from "@/static/captcha/captchaModel";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_";
const IDX_TO_CHAR: Record<number, string> = {};
for (let i = 0; i < CHARS.length; i++) {
    IDX_TO_CHAR[i] = CHARS[i];
}

let cachedModel: any = null;
let loadingPromise: Promise<any> | null = null;

const loadTFLiteModel = tfliteModule.loadTFLiteModel;

export async function getCaptchaModel(): Promise<any> {
    if (cachedModel) return cachedModel;
    if (loadingPromise) return await loadingPromise;

    loadingPromise = (async () => {
        try {
            console.log("[Captcha Solver] Loading model from:- ", captchaModelPath);
            if (typeof loadTFLiteModel !== "function") {
                throw new Error("Captcha model failed to load!");
            }
            cachedModel = await loadTFLiteModel(captchaModelPath);
            console.log("[Captcha Solver] Model successfully loaded and cached!");
            return cachedModel;
        } catch (error) {
            console.error("[Captcha Solver] Failed to load TFLite model:", error);
            loadingPromise = null;
            throw error;
        }
    })();

    return await loadingPromise;
}

export async function preprocessCaptcha(imageBuffer: Buffer): Promise<tf.Tensor4D> {
    const { data, info } = await sharp(imageBuffer)
        .extract({ left: 0, top: 0, width: 120, height: 25 })
        .grayscale()
        .raw()
        .toBuffer({ resolveWithObject: true });

    const floatArray = new Float32Array(info.width * info.height);
    for (let i = 0; i < data.length; i++) {
        floatArray[i] = data[i] / 255.0;
    }

    return tf.tensor4d(floatArray, [1, 25, 120, 1], "float32");
}

export function decodeCaptchaOutput(outputTensor: tf.Tensor): string {
    const data = outputTensor.dataSync();
    let predictedText = "";

    for (let charIdx = 0; charIdx < 5; charIdx++) {
        let maxVal = -Infinity;
        let maxClass = 0;
        const offset = charIdx * 37;

        for (let classIdx = 0; classIdx < 37; classIdx++) {
            const val = data[offset + classIdx];
            if (val > maxVal) {
                maxVal = val;
                maxClass = classIdx;
            }
        }

        predictedText += IDX_TO_CHAR[maxClass] || "";
    }

    return predictedText.replace(/_/g, "");
}

export async function solveCaptcha(imageBuffer: Buffer): Promise<string | null> {
    try {
        const model = await getCaptchaModel();
        const inputTensor = await preprocessCaptcha(imageBuffer);
        const outputTensor = model.predict(inputTensor) as tf.Tensor;

        const captchaText = decodeCaptchaOutput(outputTensor);

        inputTensor.dispose();
        outputTensor.dispose();

        return captchaText || null;
    } catch (error: any) {
        console.error("[Captcha Solver] Error solving captcha:", error?.message || error);
        return null;
    }
}