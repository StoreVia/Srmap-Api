import { useMongo } from "@/lib/database/useMongo";
import { getTime } from "@/shared/utils/functions";
import { NextRequest, NextResponse } from "next/server";
import { requireAuthResponseAdmin, errorResponse } from "@/server/utils/functions";
import { isValidCourse } from "@/validators/srmapi/resource";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  const auth = await requireAuthResponseAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { year, code, name } = body;

    const [valid, errorMsg] = isValidCourse({ year, code, name });
    if (!valid) {
      return errorResponse(errorMsg || "Invalid course data", {}, 400);
    }

    const initDb = await useMongo();
    const db = initDb.db("resources");
    const coursesCollection = db.collection("courses");
    const yearsCollection = db.collection("years");

    const trimmedYear = String(year).trim();
    const trimmedCode = String(code).trim().toUpperCase();
    const trimmedName = String(name).trim();

    const existing = await coursesCollection.findOne({
      year: trimmedYear,
      code: trimmedCode,
    });

    if (existing) {
      return errorResponse("Course with this code already exists for this year!", {}, 400);
    }

    const timestamp = getTime();

    await yearsCollection.updateOne(
      { year: trimmedYear },
      {
        $setOnInsert: {
          year: trimmedYear,
          name: `Year ${trimmedYear}`,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      },
      { upsert: true }
    );

    const newDoc = {
      year: trimmedYear,
      code: trimmedCode,
      name: trimmedName,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const result = await coursesCollection.insertOne(newDoc);

    return NextResponse.json({
      success: true,
      message: "Course Added Successfully!",
      data: { _id: result.insertedId, ...newDoc },
    });
  } catch (err) {
    console.error("Error in POST /api/admin/resources/courses:", err);
    return errorResponse(undefined, {}, 500);
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireAuthResponseAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { id, _id, year, code, name } = body;
    const targetId = id || _id;

    if (!targetId) {
      return errorResponse("Course ID is required", {}, 400);
    }

    const [valid, errorMsg] = isValidCourse({ year, code, name });
    if (!valid) {
      return errorResponse(errorMsg || "Invalid course data", {}, 400);
    }

    const initDb = await useMongo();
    const db = initDb.db("resources");
    const coursesCollection = db.collection("courses");
    const subjectsCollection = db.collection("subjects");
    const resourcesCollection = db.collection("resources");
    const yearsCollection = db.collection("years");

    let objectId: ObjectId;
    try {
      objectId = new ObjectId(String(targetId));
    } catch {
      return errorResponse("Invalid course ID", {}, 400);
    }

    const currentDoc = await coursesCollection.findOne({ _id: objectId });
    if (!currentDoc) {
      return errorResponse("Course not found", {}, 404);
    }

    const trimmedYear = String(year).trim();
    const trimmedCode = String(code).trim().toUpperCase();
    const trimmedName = String(name).trim();

    const duplicate = await coursesCollection.findOne({
      _id: { $ne: objectId },
      year: trimmedYear,
      code: trimmedCode,
    });

    if (duplicate) {
      return errorResponse("Course with this code already exists for this year!", {}, 400);
    }

    const timestamp = getTime();

    await yearsCollection.updateOne(
      { year: trimmedYear },
      {
        $setOnInsert: {
          year: trimmedYear,
          name: `Year ${trimmedYear}`,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      },
      { upsert: true }
    );

    await coursesCollection.updateOne(
      { _id: objectId },
      {
        $set: {
          year: trimmedYear,
          code: trimmedCode,
          name: trimmedName,
          updatedAt: timestamp,
        },
      }
    );

    if (currentDoc.code !== trimmedCode || currentDoc.year !== trimmedYear) {
      await subjectsCollection.updateMany(
        {
          courseCode: currentDoc.code,
          year: currentDoc.year,
        },
        {
          $set: {
            courseCode: trimmedCode,
            year: trimmedYear,
            updatedAt: timestamp,
          },
        }
      );

      await resourcesCollection.updateMany(
        {
          courseCode: currentDoc.code,
          year: currentDoc.year,
        },
        {
          $set: {
            courseCode: trimmedCode,
            year: trimmedYear,
            updatedAt: timestamp,
          },
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Course Updated Successfully!",
      data: {
        _id: targetId,
        year: trimmedYear,
        code: trimmedCode,
        name: trimmedName,
        updatedAt: timestamp,
      },
    });
  } catch (err) {
    console.error("Error in PUT /api/admin/resources/courses:", err);
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
      return errorResponse("Course ID is required", {}, 400);
    }

    const initDb = await useMongo();
    const db = initDb.db("resources");
    const coursesCollection = db.collection("courses");
    const subjectsCollection = db.collection("subjects");
    const resourcesCollection = db.collection("resources");

    let objectId: ObjectId;
    try {
      objectId = new ObjectId(String(targetId));
    } catch {
      return errorResponse("Invalid course ID", {}, 400);
    }

    const courseDoc = await coursesCollection.findOne({ _id: objectId });
    if (!courseDoc) {
      return errorResponse("Course not found", {}, 404);
    }

    await coursesCollection.deleteOne({ _id: objectId });

    await subjectsCollection.deleteMany({
      courseCode: courseDoc.code,
      year: courseDoc.year,
    });

    await resourcesCollection.deleteMany({
      courseCode: courseDoc.code,
      year: courseDoc.year,
    });

    return NextResponse.json({
      success: true,
      message: "Course and related data deleted successfully!",
    });
  } catch (err) {
    console.error("Error in DELETE /api/admin/resources/courses:", err);
    return errorResponse(undefined, {}, 500);
  }
}