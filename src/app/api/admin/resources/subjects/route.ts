import { useMongo } from "@/lib/database/useMongo";
import { getTime } from "@/shared/utils/functions";
import { NextRequest, NextResponse } from "next/server";
import { requireAuthResponseAdmin, errorResponse } from "@/server/utils/functions";
import { isValidSubject } from "@/validators/srmapi/resource";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  const auth = await requireAuthResponseAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { courseCode, year, code, name } = body;

    const [valid, errorMsg] = isValidSubject({ courseCode, year, code, name });
    if (!valid) {
      return errorResponse(errorMsg || "Invalid subject data", {}, 400);
    }

    const initDb = await useMongo();
    const db = initDb.db("resources");
    const coursesCollection = db.collection("courses");
    const subjectsCollection = db.collection("subjects");

    const trimmedCourseCode = String(courseCode).trim().toUpperCase();
    const trimmedYear = String(year).trim();
    const trimmedCode = String(code).trim();
    const trimmedName = String(name).trim();

    const courseExists = await coursesCollection.findOne({
      code: trimmedCourseCode,
      year: trimmedYear,
    });

    if (!courseExists) {
      return errorResponse("Associated course does not exist for this year", {}, 404);
    }

    const existing = await subjectsCollection.findOne({
      courseCode: trimmedCourseCode,
      year: trimmedYear,
      code: trimmedCode,
    });

    if (existing) {
      return errorResponse("Subject with this code already exists for this course and year!", {}, 400);
    }

    const timestamp = getTime();
    const newDoc = {
      courseCode: trimmedCourseCode,
      year: trimmedYear,
      code: trimmedCode,
      name: trimmedName,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const result = await subjectsCollection.insertOne(newDoc);

    return NextResponse.json({
      success: true,
      message: "Subject Added Successfully!",
      data: { _id: result.insertedId, ...newDoc },
    });
  } catch (err) {
    console.error("Error in POST /api/admin/resources/subjects:", err);
    return errorResponse(undefined, {}, 500);
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireAuthResponseAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { id, _id, courseCode, year, code, name } = body;
    const targetId = id || _id;

    if (!targetId) {
      return errorResponse("Subject ID is required", {}, 400);
    }

    const [valid, errorMsg] = isValidSubject({ courseCode, year, code, name });
    if (!valid) {
      return errorResponse(errorMsg || "Invalid subject data", {}, 400);
    }

    const initDb = await useMongo();
    const db = initDb.db("resources");
    const coursesCollection = db.collection("courses");
    const subjectsCollection = db.collection("subjects");

    let objectId: ObjectId;
    try {
      objectId = new ObjectId(String(targetId));
    } catch {
      return errorResponse("Invalid subject ID", {}, 400);
    }

    const currentDoc = await subjectsCollection.findOne({ _id: objectId });
    if (!currentDoc) {
      return errorResponse("Subject not found", {}, 404);
    }

    const trimmedCourseCode = String(courseCode).trim().toUpperCase();
    const trimmedYear = String(year).trim();
    const trimmedCode = String(code).trim();
    const trimmedName = String(name).trim();

    const courseExists = await coursesCollection.findOne({
      code: trimmedCourseCode,
      year: trimmedYear,
    });

    if (!courseExists) {
      return errorResponse("Associated course does not exist for this year", {}, 404);
    }

    const duplicate = await subjectsCollection.findOne({
      _id: { $ne: objectId },
      courseCode: trimmedCourseCode,
      year: trimmedYear,
      code: trimmedCode,
    });

    if (duplicate) {
      return errorResponse("Subject with this code already exists for this course and year!", {}, 400);
    }

    const timestamp = getTime();

    await subjectsCollection.updateOne(
      { _id: objectId },
      {
        $set: {
          courseCode: trimmedCourseCode,
          year: trimmedYear,
          code: trimmedCode,
          name: trimmedName,
          updatedAt: timestamp,
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Subject Updated Successfully!",
      data: {
        _id: targetId,
        courseCode: trimmedCourseCode,
        year: trimmedYear,
        code: trimmedCode,
        name: trimmedName,
        updatedAt: timestamp,
      },
    });
  } catch (err) {
    console.error("Error in PUT /api/admin/resources/subjects:", err);
    return errorResponse(undefined, {}, 500);
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAuthResponseAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    let targetId = searchParams.get("id");

    if (!targetId) {
      const body = await req.json().catch(() => ({}));
      targetId = body.id || body._id;
    }

    if (!targetId) {
      return errorResponse("Subject ID is required", {}, 400);
    }

    const initDb = await useMongo();
    const db = initDb.db("resources");
    const subjectsCollection = db.collection("subjects");
    const resourcesCollection = db.collection("resources");

    let objectId: ObjectId;
    try {
      objectId = new ObjectId(String(targetId));
    } catch {
      return errorResponse("Invalid subject ID", {}, 400);
    }

    const subjectDoc = await subjectsCollection.findOne({ _id: objectId });
    if (!subjectDoc) {
      return errorResponse("Subject not found", {}, 404);
    }

    await subjectsCollection.deleteOne({ _id: objectId });

    await resourcesCollection.deleteMany({
      subjectId: String(targetId),
    });

    return NextResponse.json({
      success: true,
      message: "Subject and related resources deleted successfully!",
    });
  } catch (err) {
    console.error("Error in DELETE /api/admin/resources/subjects:", err);
    return errorResponse(undefined, {}, 500);
  }
}