export const TIME_SLOTS = [
  "9:00-9:50",
  "10:00-10:50",
  "11:00-11:50",
  "12:00-12:50",
  "1:00-1:50",
  "2:00-2:50",
  "3:00-3:50",
  "4:00-5:30",
];

export const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
export const ALL_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function parseSubject(subj: string): { code: string; venue: string } {
  if (!subj) return { code: "", venue: "" };
  const match = subj.match(/^([A-Z]{2,4} \d{3}[A-Z]?)(?:\((.+)\))?$/);
  return match ? { code: match[1], venue: match[2] || "" } : { code: subj, venue: "" };
}

export function parseTime(time: string): number {
  let [h, m] = time.split(":").map(Number);
  if (h < 8) h += 12;
  return h * 60 + m;
}

export function formatCountdown(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return [h > 0 ? `${h}h` : null, m > 0 ? `${m}m` : null, `${s}s`]
    .filter(Boolean)
    .join(" ");
}