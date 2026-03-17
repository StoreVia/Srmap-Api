import { DateTime } from "luxon";
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

export function getTime(): string {
    const nowIST = DateTime.now().setZone("Asia/Kolkata");
    return nowIST.toFormat("yyyy-MM-dd, HH:mm:ss");
};

export function getFullDateAndTime(): string {
    const nowIST = DateTime.now().setZone("Asia/Kolkata");
    return nowIST.toFormat("dd-MMMM-yyyy, hh:mm:ss a");
};

export function needsRefresh(lastUpdate: string) {
    const nowIST = DateTime.now().setZone("Asia/Kolkata");
    const refreshThreshold =
        nowIST.hour < 1
            ? nowIST.startOf("day").minus({ days: 1 }).plus({ hours: 1 })
            : nowIST.startOf("day").plus({ hours: 1 });

    if (lastUpdate) {
        const lastUpdateIST = DateTime.fromFormat(lastUpdate, "yyyy-MM-dd, HH:mm:ss", { zone: "Asia/Kolkata" });
        return lastUpdateIST < refreshThreshold;
    }
    return true;
};

export function whatsapp(){
    return window.open('https://whatsapp.com/channel/0029VbANbzoGOj9gGgRvoy2M', '_blank');
};

export function extractErrorMessage(err: any): string {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.message && typeof err.message === "string") return err.message;
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
};

export function isSessionValid(sessionTime: string): boolean {
    if (!sessionTime) return false;
    const sessionDate = DateTime.fromFormat(sessionTime, "yyyy-MM-dd, HH:mm:ss", { zone: "Asia/Kolkata" });
    const nowIST = DateTime.now().setZone("Asia/Kolkata");
    const diffMinutes = nowIST.diff(sessionDate, "minutes").minutes;
    return diffMinutes >= 0 && diffMinutes <= 15;
};

export function trimText(str: string | undefined, maxLength: number): string {
    if (!str) return "";
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength) + "...";
};

export function strign2Json<T = any>(input: string | T): T {
    if (typeof input === "string") {
        try {
            return JSON.parse(input) as T;
        } catch (err) {
            throw new Error("Invalid JSON string");
        }
    }
    return input;
};

export function handleRegNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    return e.target.value.replace(/\s+/g, '').toUpperCase();
};

export function toTitleCase(text: string): string {
    if (!text) text = "Srmap Student"
    return text
        .toLowerCase()
        .split(/\s+/)
        .map(word =>
            word.length > 0
                ? word[0].toUpperCase() + word.slice(1)
                : ''
        )
        .join(' ');
};

export function string2Json<T = any>(input: string | T): T {
  if (typeof input === "string") {
    try {
      return JSON.parse(input) as T;
    } catch (err) {
      console.warn("Invalid Json string:- ", err);
      return {} as T;
    }
  }
  return input;
};

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
};