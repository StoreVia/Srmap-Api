import axios from "axios";
import * as cheerio from "cheerio";
import { useSecondaryMongo } from "@/lib/database/useMongo";
import { FacultyItem, StaffItem, ScrapeProgressState, FacultyEducationItem } from "@/types/faculty";

let progressState: ScrapeProgressState = {
  inProgress: false,
  stage: "idle",
  total: 0,
  completed: 0,
  left: 0,
  currentTarget: "",
  error: null,
  lastScrapedAt: null,
  startedAt: null,
  totalFaculty: 0,
  totalStaff: 0
};

export function getScrapeProgress(): ScrapeProgressState {
  return { ...progressState };
}

function updateProgress(patch: Partial<ScrapeProgressState>) {
  progressState = { ...progressState, ...patch };
}

function extractTextLines(elements: cheerio.Cheerio<any>): string[] {
  const result: string[] = [];
  elements.each((_, el) => {
    const text = cheerio.load(el).text().replace(/\s+/g, " ").trim();
    if (text && text.length > 2 && !result.includes(text)) {
      result.push(text);
    }
  });
  return result;
}

async function scrapeFacultyProfile(url: string): Promise<Partial<FacultyItem>> {
  if (!url || !url.startsWith("http")) return {};
  try {
    const res = await axios.get(url, {
      timeout: 15000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    const $ = cheerio.load(res.data);
    const education: FacultyEducationItem[] = [];
    $(".edu_card").each((_, el) => {
      const year = $(el).find(".edu_year").text().replace(/\s+/g, " ").trim();
      const degree = $(el).find(".edu_degree").text().replace(/\s+/g, " ").trim();
      const details = $(el).find(".edu_details").children().not(".edu_degree").map((__, d) => $(d).text().replace(/\s+/g, " ").trim()).get().filter(Boolean);
      if (degree || year) {
        education.push({ year, degree, details });
      }
    });

    const experience = extractTextLines($("#Experience li, #Experience p"));
    const researchInterests = extractTextLines($("#Research li, #Research p"));
    const awards = extractTextLines($("#Awards li, #Awards p"));
    const publications = extractTextLines($("#Publications .elementor-post__title, #Publications li, #Publications p"));
    const patents = extractTextLines($("#Patents li, #Patents p"));
    const projects = extractTextLines($("#Projects li, #Projects p"));
    const doctoralScholars = extractTextLines($("#Scholars li, #Scholars p"));
    const interests = extractTextLines($("#Interests li, #Interests p"));
    const thoughtLeadership = extractTextLines($("#thought-leadership li, #thought-leadership p"));
    const memberships = extractTextLines($("#Memberships li, #Memberships p"));

    let officeLocation = "";
    $("[id*='Contact'], .office_location, .office-location").each((_, el) => {
      const text = $(el).text();
      const match = text.match(/Office\s*(?:Location|Room)?[:\s]+([^\n\r,]+)/i);
      if (match && match[1]) {
        officeLocation = match[1].trim();
      }
    });

    const socialLinks: { title: string; url: string }[] = [];
    $("a").each((_, el) => {
      const href = $(el).attr("href") || "";
      if (href.includes("linkedin.com") || href.includes("scholar.google") || href.includes("researchgate.net") || href.includes("orcid.org") || href.includes("twitter.com") || href.includes("x.com")) {
        socialLinks.push({ title: $(el).text().trim() || href, url: href });
      }
    });

    return {
      officeLocation: officeLocation || undefined,
      socialLinks: socialLinks.length > 0 ? socialLinks : undefined,
      details: {
        education: education.length > 0 ? education : undefined,
        experience: experience.length > 0 ? experience : undefined,
        researchInterests: researchInterests.length > 0 ? researchInterests : undefined,
        awards: awards.length > 0 ? awards : undefined,
        publications: publications.length > 0 ? publications : undefined,
        patents: patents.length > 0 ? patents : undefined,
        projects: projects.length > 0 ? projects : undefined,
        doctoralScholars: doctoralScholars.length > 0 ? doctoralScholars : undefined,
        interests: interests.length > 0 ? interests : undefined,
        thoughtLeadership: thoughtLeadership.length > 0 ? thoughtLeadership : undefined,
        memberships: memberships.length > 0 ? memberships : undefined
      }
    };
  } catch {
    return {};
  }
}

async function scrapeFacultyPage(page: number): Promise<{ items: FacultyItem[]; maxPage: number }> {
  const res = await axios.post(
    "https://www.srmap.edu.in/wp-admin/admin-ajax.php",
    `action=load_faculty_by_department&page=${page}&search_keyword_name=`,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0"
      },
      timeout: 20000
    }
  );

  const $ = cheerio.load(res.data);
  let maxPage = page;
  $(".faculty-pagination-btn").each((_, el) => {
    const p = parseInt($(el).attr("data-page") || "0", 10);
    if (p > maxPage) maxPage = p;
  });

  const items: FacultyItem[] = [];
  $(".facultyStaff_dataBox").each((_, el) => {
    const rawName = $(el).find("h5").first().text().replace(/\s+/g, " ").trim();
    const name = rawName.replace(/^(Prof\.|Dr\.)([^\s])/i, "$1 $2");
    if (!name) return;

    const profileUrl = $(el).find("h5 a").first().attr("href") || $(el).find(".facultyStaffImgbox a").first().attr("href") || "";
    const imageUrl = $(el).find(".facultyStaffImgbox img").attr("src") || "";
    const desigElements = $(el).find("p.staff_designation");
    const designation = $(desigElements[0]).text().replace(/\s+/g, " ").trim() || $(el).closest("[data-designation]").attr("data-designation") || "";
    const deptRaw = $(desigElements[1]).text().replace(/\s+/g, " ").trim();
    const departments = deptRaw ? deptRaw.split(",").map(d => d.trim()).filter(Boolean) : [];
    const degree = $(el).find(".fp_phd_dts").text().replace(/\s+/g, " ").trim();
    const email = $(el).find(".staff_email span").text().replace(/\s+/g, " ").trim();
    const slug = profileUrl.split("/").filter(Boolean).pop() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    items.push({
      name,
      slug,
      designation,
      departments,
      degree,
      email,
      imageUrl,
      profileUrl
    });
  });

  return { items, maxPage };
}

async function scrapeStaffPage(page: number): Promise<{ items: StaffItem[]; maxPage: number }> {
  const res = await axios.post(
    "https://www.srmap.edu.in/wp-admin/admin-ajax.php",
    `action=load_staff_by_department&paged=${page}`,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0"
      },
      timeout: 20000
    }
  );

  const $ = cheerio.load(res.data);
  let maxPage = page;
  $(".faculty-staff-page-button").each((_, el) => {
    const p = parseInt($(el).attr("data-page") || "0", 10);
    if (p > maxPage) maxPage = p;
  });

  const items: StaffItem[] = [];
  $(".facultyStaff_dataBox").each((_, el) => {
    const name = $(el).find("h5").text().replace(/\s+/g, " ").trim();
    if (!name) return;

    const desigElements = $(el).find("p.staff_designation");
    const designation = $(desigElements[0]).text().replace(/\s+/g, " ").trim();
    const deptRaw = $(desigElements[1]).text().replace(/\s+/g, " ").trim();
    const departments = deptRaw ? deptRaw.split(",").map(d => d.trim()).filter(Boolean) : [];
    const phone = $(el).find(".staff_phone span").text().replace(/\s+/g, " ").trim();
    const email = $(el).find(".staff_email span").text().replace(/\s+/g, " ").trim();
    const imageUrl = $(el).find(".facultyStaffImgbox img").attr("src") || "";

    items.push({
      name,
      designation,
      departments,
      phone: phone || undefined,
      email: email || undefined,
      imageUrl
    });
  });

  return { items, maxPage };
}

async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex++;
      results[currentIndex] = await fn(items[currentIndex], currentIndex);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

export async function runFacultyAndStaffScrape(): Promise<void> {
  if (progressState.inProgress) {
    throw new Error("Scrape already in progress");
  }

  const startTime = new Date().toISOString();
  updateProgress({
    inProgress: true,
    stage: "faculty_list",
    total: 0,
    completed: 0,
    left: 0,
    currentTarget: "Fetching faculty catalog pages",
    error: null,
    startedAt: startTime
  });

  try {
    const allFaculty: FacultyItem[] = [];
    const firstFacultyPage = await scrapeFacultyPage(1);
    allFaculty.push(...firstFacultyPage.items);
    const facultyMaxPages = firstFacultyPage.maxPage || 18;

    for (let p = 2; p <= facultyMaxPages; p++) {
      updateProgress({
        currentTarget: `Fetching faculty list page ${p} of ${facultyMaxPages}`
      });
      const pageResult = await scrapeFacultyPage(p);
      allFaculty.push(...pageResult.items);
    }

    const totalProfiles = allFaculty.length;
    updateProgress({
      stage: "faculty_details",
      total: totalProfiles,
      completed: 0,
      left: totalProfiles,
      currentTarget: "Starting faculty profile detail scraping"
    });

    let completedProfiles = 0;
    const enrichedFaculty = await mapWithConcurrency(allFaculty, 6, async (fac) => {
      updateProgress({
        currentTarget: `Scraping profile: ${fac.name} (${completedProfiles + 1}/${totalProfiles})`
      });
      const profileData = await scrapeFacultyProfile(fac.profileUrl);
      completedProfiles++;
      updateProgress({
        completed: completedProfiles,
        left: totalProfiles - completedProfiles
      });
      return {
        ...fac,
        ...profileData,
        updatedAt: new Date()
      };
    });

    updateProgress({
      stage: "staff_list",
      total: 0,
      completed: 0,
      left: 0,
      currentTarget: "Fetching staff directory"
    });

    const allStaff: StaffItem[] = [];
    const firstStaffPage = await scrapeStaffPage(1);
    allStaff.push(...firstStaffPage.items);
    const staffMaxPages = firstStaffPage.maxPage || 7;

    for (let p = 2; p <= staffMaxPages; p++) {
      updateProgress({
        currentTarget: `Fetching staff list page ${p} of ${staffMaxPages}`
      });
      const pageResult = await scrapeStaffPage(p);
      allStaff.push(...pageResult.items);
    }

    const stampedStaff = allStaff.map(s => ({ ...s, updatedAt: new Date() }));

    updateProgress({
      stage: "saving",
      currentTarget: "Applying atomic database updates"
    });

    const client = await useSecondaryMongo();
    const db = client.db("faculty");
    const facultyCollection = db.collection("faculty");
    const staffCollection = db.collection("staff");
    const ratingsCollection = db.collection("faculty_ratings");
    const metaCollection = db.collection("scrape_state");

    const existingRatings = await ratingsCollection.find({}).toArray();
    const ratingsByEmailOrSlug = new Map<string, { teaching: number[]; exams: number[]; correction: number[]; marks: number[] }>();

    for (const r of existingRatings) {
      const key = String(r.facultyEmail || r.facultySlug || r.facultyId).toLowerCase();
      if (!ratingsByEmailOrSlug.has(key)) {
        ratingsByEmailOrSlug.set(key, { teaching: [], exams: [], correction: [], marks: [] });
      }
      const entry = ratingsByEmailOrSlug.get(key)!;
      if (typeof r.teaching === "number") entry.teaching.push(r.teaching);
      if (typeof r.exams === "number") entry.exams.push(r.exams);
      if (typeof r.correction === "number") entry.correction.push(r.correction);
      if (typeof r.marks === "number") entry.marks.push(r.marks);
    }

    const finalFaculty = enrichedFaculty.map(f => {
      const keyEmail = (f.email || "").toLowerCase();
      const keySlug = (f.slug || "").toLowerCase();
      const ratingData = ratingsByEmailOrSlug.get(keyEmail) || ratingsByEmailOrSlug.get(keySlug);

      if (ratingData && ratingData.teaching.length > 0) {
        const count = ratingData.teaching.length;
        const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / count;
        const teachingAvg = avg(ratingData.teaching);
        const examsAvg = avg(ratingData.exams);
        const correctionAvg = avg(ratingData.correction);
        const marksAvg = avg(ratingData.marks);
        const overallAvg = (teachingAvg + examsAvg + correctionAvg + marksAvg) / 4;
        return {
          ...f,
          ratingSummary: {
            teachingAvg: Number(teachingAvg.toFixed(1)),
            examsAvg: Number(examsAvg.toFixed(1)),
            correctionAvg: Number(correctionAvg.toFixed(1)),
            marksAvg: Number(marksAvg.toFixed(1)),
            overallAvg: Number(overallAvg.toFixed(1)),
            totalRatings: count
          }
        };
      }
      return f;
    });

    await facultyCollection.deleteMany({});
    if (finalFaculty.length > 0) {
      await facultyCollection.insertMany(finalFaculty as any);
      await facultyCollection.createIndex({ name: "text", designation: "text", email: 1 });
      await facultyCollection.createIndex({ slug: 1 });
      await facultyCollection.createIndex({ email: 1 });
    }

    await staffCollection.deleteMany({});
    if (stampedStaff.length > 0) {
      await staffCollection.insertMany(stampedStaff as any);
      await staffCollection.createIndex({ name: "text", designation: "text", email: 1 });
    }

    const nowIso = new Date().toISOString();
    await metaCollection.updateOne(
      { key: "last_scrape" },
      {
        $set: {
          key: "last_scrape",
          lastScrapedAt: nowIso,
          totalFaculty: finalFaculty.length,
          totalStaff: stampedStaff.length,
          status: "success"
        }
      },
      { upsert: true }
    );


    updateProgress({
      inProgress: false,
      stage: "completed",
      totalFaculty: finalFaculty.length,
      totalStaff: stampedStaff.length,
      lastScrapedAt: nowIso,
      currentTarget: `Completed successfully. Scraped ${finalFaculty.length} faculty and ${stampedStaff.length} staff.`
    });
  } catch (err: any) {
    updateProgress({
      inProgress: false,
      stage: "error",
      error: err.message || "Failed during scrape",
      currentTarget: "Scraping failed"
    });
    throw err;
  }
}