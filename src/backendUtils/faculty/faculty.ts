import faculty from "@/jsons/faculty.json";

type FacultyCabin = { location: string };

const facultyCabinMap = new Map<string, FacultyCabin>();

function normalizeName(name: string) {
  return name
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/\b(dr|mr|mrs|ms|prof)\b/g, "")
    .replace(/\b[a-z]{2,}\d{2,}\b/g, "")
    .replace(/\./g, "")
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

for (const row of faculty as { faculty: string; location: string }[]) {
  if (!row.faculty || !row.location) continue;
  facultyCabinMap.set(
    normalizeName(row.faculty),
    { location: row.location }
  );
}

function getFacultyCabin(name: string) {
  return facultyCabinMap.get(normalizeName(name));
}

export { getFacultyCabin };