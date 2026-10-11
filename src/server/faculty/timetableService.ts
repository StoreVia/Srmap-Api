import { useMongo, useSecondaryMongo } from "@/lib/database/useMongo";
import { getFacultyCabin } from "@/server/faculty/faculty";
import { FacultyTimetableRecord, FacultyTimetableSlotEntry, FacultyTimetableMeta, FacultyTimetableProgressState } from "@/types/faculty";

let timetableProgressState: FacultyTimetableProgressState = {
  inProgress: false,
  stage: "idle",
  total: 0,
  completed: 0,
  currentTarget: "",
  error: null,
  lastGeneratedAt: null,
  count: 0,
  totalClasses: 0
};

export function getFacultyTimetableProgress(): FacultyTimetableProgressState {
  return { ...timetableProgressState };
}

function updateTimetableProgress(patch: Partial<FacultyTimetableProgressState>) {
  timetableProgressState = { ...timetableProgressState, ...patch };
}

function cleanName(str: string): string {
  return str
    .replace(/\s*\(\s*[^)]+\s*\)/g, "")
    .replace(/\b(dr|prof|mr|ms|mrs|prof\.|dr\.|mr\.|ms\.|mrs\.)\b/gi, "")
    .replace(/[^a-zA-Z\s]/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function getTokens(str: string): string[] {
  return cleanName(str)
    .split(" ")
    .filter(t => t.length > 1);
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, () => new Int32Array(n + 1));
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
    }
  }
  return d[m][n];
}

function matchScore(tokensA: string[], tokensB: string[]): number {
  if (!tokensA.length || !tokensB.length) return 0;
  const sortedA = [...tokensA].sort().join(" ");
  const sortedB = [...tokensB].sort().join(" ");
  if (sortedA === sortedB) return 1.0;

  const setB = new Set(tokensB);
  const common = tokensA.filter(t => setB.has(t));
  let fuzzyCommon = common.length;
  const unmatchedA = tokensA.filter(t => !setB.has(t));
  const unmatchedB = tokensB.filter(t => !tokensA.includes(t));

  for (const uA of unmatchedA) {
    for (const uB of unmatchedB) {
      if (Math.abs(uA.length - uB.length) <= 2) {
        const dist = levenshtein(uA, uB);
        if (dist <= 1 || (uA.length > 4 && dist <= 2)) {
          fuzzyCommon++;
          break;
        }
      }
    }
  }

  if (fuzzyCommon === 0) return 0;
  const minLen = Math.min(tokensA.length, tokensB.length);
  const maxLen = Math.max(tokensA.length, tokensB.length);
  if (fuzzyCommon >= minLen) {
    return 0.85 + (fuzzyCommon / maxLen) * 0.14;
  }
  return fuzzyCommon / (tokensA.length + tokensB.length - fuzzyCommon);
}

function parseSubjectSlot(subj: string): { code: string; venue: string } {
  if (!subj) return { code: "", venue: "" };
  const match = subj.match(/^([A-Z]{2,4}\s*\d{3}[A-Z]?)(?:\((.+)\))?$/i);
  return match ? { code: match[1].trim(), venue: (match[2] || "").trim() } : { code: subj.trim(), venue: "" };
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function generateAllFacultyTimetables() {
  if (timetableProgressState.inProgress) {
    throw new Error("Faculty timetable generation is already in progress");
  }

  updateTimetableProgress({
    inProgress: true,
    stage: "loading_students",
    total: 0,
    completed: 0,
    currentTarget: "Loading faculty database and student timetables",
    error: null
  });

  try {
    const mainClient = await useMongo();
    const collegeDb = mainClient.db("college_db");

    const secondaryClient = await useSecondaryMongo();
    const facultyDb = secondaryClient.db("faculty");

    const facultyDocs = await facultyDb.collection("faculty").find().toArray();
    const facultyList = facultyDocs.map(f => ({
      id: f._id.toString(),
      name: f.name as string,
      slug: (f.slug || slugify(f.name)) as string,
      departments: (f.departments || []) as string[],
      email: (f.email || "") as string,
      imageUrl: (f.imageUrl || "") as string,
      designation: (f.designation || "") as string,
      cabin: (f.officeLocation || "") as string,
      tokens: getTokens(f.name as string)
    }));

    const timetables = await collegeDb.collection("timetables").find().toArray();

    updateTimetableProgress({
      stage: "matching",
      total: timetables.length,
      completed: 0,
      currentTarget: `Matching ${timetables.length} student timetables with faculty directory`
    });

    const matchCache = new Map<string, typeof facultyList[0] | null>();
    function findFaculty(rawName: string) {
      if (!rawName) return null;
      const cleanRaw = rawName.trim();
      if (matchCache.has(cleanRaw)) return matchCache.get(cleanRaw)!;
      if (/skilling|trainer|tmp\d|ises\d|careerskill|foreign\s*language/i.test(cleanRaw)) {
        matchCache.set(cleanRaw, null);
        return null;
      }
      const tokens = getTokens(cleanRaw);
      let best: typeof facultyList[0] | null = null;
      let bestScore = 0;
      for (const f of facultyList) {
        const score = matchScore(tokens, f.tokens);
        if (score > bestScore) {
          bestScore = score;
          best = f;
        }
      }
      const res = bestScore >= 0.5 ? best : null;
      matchCache.set(cleanRaw, res);
      return res;
    }

    const facultySchedules = new Map<string, FacultyTimetableRecord>();

    let processedDocCount = 0;
    for (const doc of timetables) {
      processedDocCount++;
      if (processedDocCount % 50 === 0 || processedDocCount === timetables.length) {
        updateTimetableProgress({
          completed: processedDocCount,
          currentTarget: `Processed ${processedDocCount}/${timetables.length} student timetables`
        });
      }
      const tt = (doc as any).data?.timetable;
      const subjects = (doc as any).data?.subjects || [];
      const profile = (doc as any).data?.profile || {};
      if (!Array.isArray(tt)) continue;

      const subMap = new Map<string, any>();
      for (const s of subjects) {
        if (s.code) subMap.set(s.code.trim().toUpperCase(), s);
      }

      for (const dayObj of tt) {
        const day = dayObj.day;
        if (!Array.isArray(dayObj.subjects)) continue;

        dayObj.subjects.forEach((slotStr: string, slotIdx: number) => {
          if (!slotStr) return;
          const { code, venue } = parseSubjectSlot(slotStr);
          if (!code) return;

          const subDetail = subMap.get(code.toUpperCase());
          if (!subDetail || !subDetail.faculty || subDetail.faculty === "null") return;

          const rawFaculties = subDetail.faculty.split(",").map((x: string) => x.trim()).filter(Boolean);
          for (const rawF of rawFaculties) {
            const matched = findFaculty(rawF);

            const recordKey = matched ? matched.id : slugify(rawF);
            const facName = matched ? matched.name : rawF.replace(/\s*\(\s*[^)]+\s*\)/g, "").trim();
            const facSlug = matched ? matched.slug : slugify(facName);

            if (!facultySchedules.has(recordKey)) {
              const cabinInfo = getFacultyCabin(facName);
              facultySchedules.set(recordKey, {
                facultyId: matched?.id,
                facultyName: facName,
                facultySlug: facSlug,
                designation: matched?.designation || "Faculty",
                departments: matched?.departments || [],
                email: matched?.email || "",
                imageUrl: matched?.imageUrl || "",
                cabin: matched?.cabin || cabinInfo?.location || "",
                totalClasses: 0,
                schedule: {},
                updatedAt: new Date()
              });
            }

            const facRecord = facultySchedules.get(recordKey)!;
            facRecord.schedule[day] = facRecord.schedule[day] || {};
            facRecord.schedule[day][slotIdx.toString()] = facRecord.schedule[day][slotIdx.toString()] || [];

            const existingSlots = facRecord.schedule[day][slotIdx.toString()];
            const matchingClass = existingSlots.find(entry => entry.code === code && (entry.venue === venue || !venue || !entry.venue));

            if (matchingClass) {
              if (profile.section && !matchingClass.section.split(",").map(s => s.trim()).includes(profile.section)) {
                matchingClass.section = matchingClass.section ? `${matchingClass.section}, ${profile.section}` : profile.section;
              }
            } else {
              existingSlots.push({
                code,
                name: subDetail.name || code,
                venue: venue || subDetail.classrooms || "",
                section: profile.section || "",
                program: profile.program || "",
                semester: profile.semester || ""
              });
              facRecord.totalClasses++;
            }

          }
        });
      }
    }

    const timetableRecords = Array.from(facultySchedules.values());
    const timetablesCollection = facultyDb.collection("faculty_timetables");

    updateTimetableProgress({
      stage: "saving",
      currentTarget: `Saving ${timetableRecords.length} faculty timetables to database`
    });

    await timetablesCollection.deleteMany({});
    if (timetableRecords.length > 0) {
      await timetablesCollection.insertMany(timetableRecords as any);
    }

    await timetablesCollection.createIndex({ facultySlug: 1 });
    await timetablesCollection.createIndex({ facultyName: "text" });
    await timetablesCollection.createIndex({ facultyId: 1 });

    let totalClassesCount = 0;
    for (const r of timetableRecords) {
      totalClassesCount += r.totalClasses;
    }

    const nowIso = new Date().toISOString();
    const meta: FacultyTimetableMeta = {
      lastGeneratedAt: nowIso,
      totalFacultyWithSchedules: timetableRecords.length,
      totalClasses: totalClassesCount,
      totalTimetablesProcessed: timetables.length,
      inProgress: false
    };

    await facultyDb.collection("scrape_state").updateOne(
      { key: "faculty_timetables_meta" },
      { $set: meta },
      { upsert: true }
    );

    updateTimetableProgress({
      inProgress: false,
      stage: "completed",
      total: timetables.length,
      completed: timetables.length,
      count: timetableRecords.length,
      totalClasses: totalClassesCount,
      lastGeneratedAt: nowIso,
      currentTarget: `Completed. Mapped ${timetableRecords.length} faculty across ${totalClassesCount} classes.`
    });

    return {
      success: true,
      count: timetableRecords.length,
      totalClasses: totalClassesCount,
      processedTimetables: timetables.length
    };
  } catch (err: any) {
    updateTimetableProgress({
      inProgress: false,
      stage: "error",
      error: err.message || "Failed generating timetables",
      currentTarget: "Generation failed"
    });
    throw err;
  }
}

export async function getFacultyTimetableMeta(): Promise<FacultyTimetableMeta> {
  const secondaryClient = await useSecondaryMongo();
  const facultyDb = secondaryClient.db("faculty");

  const metaDoc = await facultyDb.collection("scrape_state").findOne({ key: "faculty_timetables_meta" });
  const count = await facultyDb.collection("faculty_timetables").countDocuments();

  return {
    lastGeneratedAt: metaDoc?.lastGeneratedAt || null,
    totalFacultyWithSchedules: count,
    totalClasses: metaDoc?.totalClasses || 0,
    totalTimetablesProcessed: metaDoc?.totalTimetablesProcessed || 0,
    inProgress: timetableProgressState.inProgress,
    progress: getFacultyTimetableProgress()
  };
}

export async function getFacultyTimetableBySlug(slug: string): Promise<FacultyTimetableRecord | null> {
  const secondaryClient = await useSecondaryMongo();
  const facultyDb = secondaryClient.db("faculty");

  const doc = await facultyDb.collection("faculty_timetables").findOne({ facultySlug: slug });
  if (!doc) return null;
  return {
    _id: doc._id.toString(),
    facultyId: doc.facultyId,
    facultyName: doc.facultyName,
    facultySlug: doc.facultySlug,
    designation: doc.designation,
    departments: doc.departments,
    email: doc.email,
    imageUrl: doc.imageUrl,
    cabin: doc.cabin,
    totalClasses: doc.totalClasses,
    schedule: doc.schedule,
    updatedAt: doc.updatedAt
  };
}

export async function matchFacultyTimetables(names: string[]): Promise<FacultyTimetableRecord[]> {
  if (!names || names.length === 0) return [];
  const secondaryClient = await useSecondaryMongo();
  const facultyDb = secondaryClient.db("faculty");

  const allRecords = await facultyDb.collection("faculty_timetables").find().toArray();
  const tokenizedRecords = allRecords.map(r => ({
    record: {
      _id: r._id.toString(),
      facultyId: r.facultyId,
      facultyName: r.facultyName,
      facultySlug: r.facultySlug,
      designation: r.designation,
      departments: r.departments,
      email: r.email,
      imageUrl: r.imageUrl,
      cabin: r.cabin,
      totalClasses: r.totalClasses,
      schedule: r.schedule,
      updatedAt: r.updatedAt
    } as FacultyTimetableRecord,
    tokens: getTokens(r.facultyName)
  }));

  const results: FacultyTimetableRecord[] = [];
  const addedIds = new Set<string>();

  for (const raw of names) {
    if (!raw || /skilling|trainer|tmp\d|ises\d/i.test(raw)) continue;
    const tokens = getTokens(raw);
    let bestRecord: FacultyTimetableRecord | null = null;
    let bestScore = 0;

    for (const item of tokenizedRecords) {
      const score = matchScore(tokens, item.tokens);
      if (score > bestScore) {
        bestScore = score;
        bestRecord = item.record;
      }
    }

    if (bestScore >= 0.5 && bestRecord && !addedIds.has(bestRecord.facultySlug)) {
      addedIds.add(bestRecord.facultySlug);
      results.push(bestRecord);
    }
  }

  return results;
}

export async function searchFacultyTimetables(query: string, limit = 20): Promise<FacultyTimetableRecord[]> {
  const secondaryClient = await useSecondaryMongo();
  const facultyDb = secondaryClient.db("faculty");

  const q = query.trim();
  if (!q) {
    const docs = await facultyDb.collection("faculty_timetables").find().limit(limit).toArray();
    return docs.map(d => ({
      _id: d._id.toString(),
      facultyId: d.facultyId,
      facultyName: d.facultyName,
      facultySlug: d.facultySlug,
      designation: d.designation,
      departments: d.departments,
      email: d.email,
      imageUrl: d.imageUrl,
      cabin: d.cabin,
      totalClasses: d.totalClasses,
      schedule: d.schedule,
      updatedAt: d.updatedAt
    }));
  }

  const regex = new RegExp(q, "i");
  const docs = await facultyDb.collection("faculty_timetables")
    .find({
      $or: [
        { facultyName: { $regex: regex } },
        { facultySlug: { $regex: regex } },
        { email: { $regex: regex } }
      ]
    })
    .limit(limit)
    .toArray();

  return docs.map(d => ({
    _id: d._id.toString(),
    facultyId: d.facultyId,
    facultyName: d.facultyName,
    facultySlug: d.facultySlug,
    designation: d.designation,
    departments: d.departments,
    email: d.email,
    imageUrl: d.imageUrl,
    cabin: d.cabin,
    totalClasses: d.totalClasses,
    schedule: d.schedule,
    updatedAt: d.updatedAt
  }));
}
