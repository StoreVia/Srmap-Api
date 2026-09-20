import { useMongo } from "@/lib/database/useMongo";
import { NextRequest, NextResponse } from "next/server";
import { requireAuthResponseAdmin, errorResponse } from "@/server/utils/functions";

export async function GET(req: NextRequest) {
  const auth = await requireAuthResponseAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year");
    const courseCode = searchParams.get("courseCode");
    const subjectId = searchParams.get("subjectId");

    const initDb = await useMongo();
    const db = initDb.db("resources");

    const coursesCollection = db.collection("courses");
    const subjectsCollection = db.collection("subjects");
    const resourcesCollection = db.collection("resources");
    const yearsCollection = db.collection("years");

    const courseQuery: Record<string, any> = {};
    const subjectQuery: Record<string, any> = {};
    const resourceQuery: Record<string, any> = {};

    if (year) {
      courseQuery.year = year;
      subjectQuery.year = year;
      resourceQuery.year = year;
    }

    if (courseCode) {
      courseQuery.code = courseCode.toUpperCase();
      subjectQuery.courseCode = courseCode.toUpperCase();
      resourceQuery.courseCode = courseCode.toUpperCase();
    }

    if (subjectId) {
      resourceQuery.subjectId = subjectId;
    }

    const [courses, subjects, resources, years, totalCourses, totalSubjects, totalResources, totalYears] = await Promise.all([
      coursesCollection.find(courseQuery).sort({ year: 1, code: 1 }).toArray(),
      subjectsCollection.find(subjectQuery).sort({ code: 1 }).toArray(),
      resourcesCollection.find(resourceQuery).sort({ title: 1 }).toArray(),
      yearsCollection.find({}).sort({ year: 1 }).toArray(),
      coursesCollection.countDocuments(),
      subjectsCollection.countDocuments(),
      resourcesCollection.countDocuments(),
      yearsCollection.countDocuments(),
    ]);

    const formattedCourses = courses.map((c) => ({
      ...c,
      _id: c._id.toString(),
    }));

    const formattedSubjects = subjects.map((s) => ({
      ...s,
      _id: s._id.toString(),
    }));

    const formattedResources = resources.map((r) => ({
      ...r,
      _id: r._id.toString(),
    }));

    const formattedYears = years.map((y) => ({
      ...y,
      _id: y._id.toString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        courses: formattedCourses,
        subjects: formattedSubjects,
        resources: formattedResources,
        years: formattedYears,
        stats: {
          totalCourses,
          totalSubjects,
          totalResources,
          totalYears,
        },
      },
    });
  } catch (err) {
    console.error("Error in GET /api/admin/resources/list:", err);
    return errorResponse(undefined, {}, 500);
  }
}