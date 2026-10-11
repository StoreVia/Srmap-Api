import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireAuthResponse, errorResponse } from "@/server/utils/functions";
import { useSecondaryMongo } from "@/lib/database/useMongo";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuthResponse(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  if (!id) return errorResponse("Missing faculty ID", {}, 400);

  const username = auth.payload.username;
  if (!username) return errorResponse("Unauthorized", {}, 401);

  try {
    const body = await req.json();
    const teaching = Number(body.teaching);
    const exams = Number(body.exams);
    const correction = Number(body.correction);
    const marks = Number(body.marks);

    const values = [teaching, exams, correction, marks];
    const allValid = values.every(v => Number.isFinite(v) && v >= 1 && v <= 5);
    if (!allValid) {
      return errorResponse("All ratings (Teaching, Exams, Correction, Marks) must be between 1 and 5", {}, 400);
    }

    const client = await useSecondaryMongo();
    const db = client.db("faculty");
    const facultyCollection = db.collection("faculty");
    const ratingsCollection = db.collection("faculty_ratings");

    const isHex24 = typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);
    const facultyQuery = isHex24 ? { $or: [{ _id: new ObjectId(id) }, { slug: id }] } : { slug: id };
    const faculty = await facultyCollection.findOne(facultyQuery);
    if (!faculty) {
      return errorResponse("Faculty not found", {}, 404);
    }

    const facultyIdStr = String(faculty._id);
    const overall = Number(((teaching + exams + correction + marks) / 4).toFixed(1));

    const existingRating = await ratingsCollection.findOne({
      username,
      facultyId: facultyIdStr
    });

    if (existingRating) {
      await ratingsCollection.updateOne(
        { _id: existingRating._id },
        {
          $set: {
            teaching,
            exams,
            correction,
            marks,
            overall,
            updatedAt: new Date()
          }
        }
      );
    } else {
      await ratingsCollection.insertOne({
        facultyId: facultyIdStr,
        facultySlug: faculty.slug,
        facultyEmail: faculty.email,
        username,
        teaching,
        exams,
        correction,
        marks,
        overall,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    const allRatings = await ratingsCollection.find({ facultyId: facultyIdStr }).toArray();
    const count = allRatings.length;
    const avg = (field: "teaching" | "exams" | "correction" | "marks") =>
      allRatings.reduce((sum, r) => sum + (r[field] || 0), 0) / count;

    const teachingAvg = Number(avg("teaching").toFixed(1));
    const examsAvg = Number(avg("exams").toFixed(1));
    const correctionAvg = Number(avg("correction").toFixed(1));
    const marksAvg = Number(avg("marks").toFixed(1));
    const overallAvg = Number(((teachingAvg + examsAvg + correctionAvg + marksAvg) / 4).toFixed(1));

    const ratingSummary = {
      teachingAvg,
      examsAvg,
      correctionAvg,
      marksAvg,
      overallAvg,
      totalRatings: count
    };

    await facultyCollection.updateOne(
      { _id: faculty._id },
      { $set: { ratingSummary } }
    );

    return NextResponse.json({
      success: true,
      message: "Rating submitted successfully",
      data: {
        ratingSummary,
        userRating: {
          teaching,
          exams,
          correction,
          marks,
          overall
        }
      }
    });
  } catch (err: any) {
    return errorResponse(err.message || "Failed to submit rating", {}, 500);
  }
}
