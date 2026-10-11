import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireAuthResponse, errorResponse } from "@/server/utils/functions";
import { useSecondaryMongo } from "@/lib/database/useMongo";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuthResponse(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  if (!id) return errorResponse("Missing faculty ID", {}, 400);

  try {
    const client = await useSecondaryMongo();
    const db = client.db("faculty");
    const facultyCollection = db.collection("faculty");
    const ratingsCollection = db.collection("faculty_ratings");

    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { slug: id };
    const faculty = await facultyCollection.findOne(query);

    if (!faculty) {
      return errorResponse("Faculty not found", {}, 404);
    }

    const username = auth.payload.username;
    const studentRating = await ratingsCollection.findOne({
      username,
      facultyId: String(faculty._id)
    });

    let name = faculty.name || "";
    const half = name.length / 2;
    if (name.length % 2 === 0 && name.slice(0, half) === name.slice(half)) {
      name = name.slice(0, half);
    }
    name = name.replace(/^(Prof\.|Dr\.)([^\s])/i, "$1 $2");
    faculty.name = name;

    return NextResponse.json({
      success: true,
      data: {
        faculty,
        studentRating: studentRating ? {
          teaching: studentRating.teaching,
          exams: studentRating.exams,
          correction: studentRating.correction,
          marks: studentRating.marks,
          overall: studentRating.overall,
          createdAt: studentRating.createdAt
        } : null
      }
    });
  } catch (err: any) {
    return errorResponse(err.message || "Failed to load faculty details", {}, 500);
  }
}
