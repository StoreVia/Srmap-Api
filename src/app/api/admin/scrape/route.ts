import { NextRequest, NextResponse } from "next/server";
import { requireAuthResponseAdmin, errorResponse } from "@/server/utils/functions";
import { runFacultyAndStaffScrape, getScrapeProgress } from "@/server/faculty/scraperService";

export async function POST(req: NextRequest) {
  const auth = await requireAuthResponseAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const current = getScrapeProgress();
  if (current.inProgress) {
    return errorResponse("Scrape already in progress", { progress: current }, 409);
  }

  runFacultyAndStaffScrape().catch(() => {});

  return NextResponse.json({
    success: true,
    message: "Scraping process initiated",
    data: getScrapeProgress()
  });
}
