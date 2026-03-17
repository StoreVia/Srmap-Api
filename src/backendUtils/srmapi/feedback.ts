import fs from "fs";
import path from "path";

export default function getRandomFeedback(): string {
  const filePath = path.join(process.cwd(), "src", "jsons", "feedback.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  const data: string[] = JSON.parse(raw);

  const randomIndex = Math.floor(Math.random() * data.length);
  return data[randomIndex];
}