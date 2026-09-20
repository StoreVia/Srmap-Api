import { useMongo } from "@/lib/database/useMongo";
import { getTime } from "@/shared/utils/functions";
import { NextRequest, NextResponse } from "next/server";
import { requireAuthResponseAdmin, errorResponse } from "@/server/utils/functions";
import { isValidResource } from "@/validators/srmapi/resource";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  const auth = await requireAuthResponseAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { courseCode, year, subjectId, category, examType, title, size, fileType, downloadUrl } = body;

    const [valid, errorMsg] = isValidResource({
      courseCode,
      year,
      subjectId,
      category,
      examType,
      title,
      size,
      fileType,
      downloadUrl,
    });

    if (!valid) {
      return errorResponse(errorMsg || "Invalid resource data", {}, 400);
    }

    const initDb = await useMongo();
    const db = initDb.db("resources");
    const subjectsCollection = db.collection("subjects");
    const resourcesCollection = db.collection("resources");

    const trimmedCourseCode = String(courseCode).trim().toUpperCase();
    const trimmedYear = String(year).trim();
    const trimmedSubjectId = String(subjectId).trim();

    let subjectObjectId: ObjectId | null = null;
    try {
      subjectObjectId = new ObjectId(trimmedSubjectId);
    } catch {
      subjectObjectId = null;
    }

    const subjectExists = await subjectsCollection.findOne({
      $or: [
        ...(subjectObjectId ? [{ _id: subjectObjectId }] : []),
        { id: trimmedSubjectId },
        { id: Number(trimmedSubjectId) },
      ],
    });

    if (!subjectExists) {
      return errorResponse("Subject does not exist", {}, 404);
    }

    const timestamp = getTime();
    const newDoc = {
      courseCode: trimmedCourseCode,
      year: trimmedYear,
      subjectId: trimmedSubjectId,
      category,
      ...(category === "previousYearPapers" ? { examType } : {}),
      title: String(title).trim(),
      size: String(size).trim(),
      fileType: String(fileType).trim().toLowerCase(),
      downloadUrl: String(downloadUrl).trim(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const result = await resourcesCollection.insertOne(newDoc);

    return NextResponse.json({
      success: true,
      message: "Resource Added Successfully!",
      data: { _id: result.insertedId, ...newDoc },
    });
  } catch (err) {
    console.error("Error in POST /api/admin/resources/resources:", err);
    return errorResponse(undefined, {}, 500);
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireAuthResponseAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { id, _id, courseCode, year, subjectId, category, examType, title, size, fileType, downloadUrl } = body;
    const targetId = id || _id;

    if (!targetId) {
      return errorResponse("Resource ID is required", {}, 400);
    }

    const [valid, errorMsg] = isValidResource({
      courseCode,
      year,
      subjectId,
      category,
      examType,
      title,
      size,
      fileType,
      downloadUrl,
    });

    if (!valid) {
      return errorResponse(errorMsg || "Invalid resource data", {}, 400);
    }

    const initDb = await useMongo();
    const db = initDb.db("resources");
    const resourcesCollection = db.collection("resources");

    let objectId: ObjectId;
    try {
      objectId = new ObjectId(String(targetId));
    } catch {
      return errorResponse("Invalid resource ID", {}, 400);
    }

    const currentDoc = await resourcesCollection.findOne({ _id: objectId });
    if (!currentDoc) {
      return errorResponse("Resource not found", {}, 404);
    }

    const timestamp = getTime();
    const updateDoc = {
      courseCode: String(courseCode).trim().toUpperCase(),
      year: String(year).trim(),
      subjectId: String(subjectId).trim(),
      category,
      ...(category === "previousYearPapers" ? { examType } : { examType: null }),
      title: String(title).trim(),
      size: String(size).trim(),
      fileType: String(fileType).trim().toLowerCase(),
      downloadUrl: String(downloadUrl).trim(),
      updatedAt: timestamp,
    };

    await resourcesCollection.updateOne(
      { _id: objectId },
      { $set: updateDoc }
    );

    return NextResponse.json({
      success: true,
      message: "Resource Updated Successfully!",
      data: {
        _id: targetId,
        ...updateDoc,
      },
    });
  } catch (err) {
    console.error("Error in PUT /api/admin/resources/resources:", err);
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
      return errorResponse("Resource ID is required", {}, 400);
    }

    const initDb = await useMongo();
    const db = initDb.db("resources");
    const resourcesCollection = db.collection("resources");

    let objectId: ObjectId;
    try {
      objectId = new ObjectId(String(targetId));
    } catch {
      return errorResponse("Invalid resource ID", {}, 400);
    }

    const result = await resourcesCollection.deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return errorResponse("Resource not found", {}, 404);
    }

    return NextResponse.json({
      success: true,
      message: "Resource deleted successfully!",
    });
  } catch (err) {
    console.error("Error in DELETE /api/admin/resources/resources:", err);
    return errorResponse(undefined, {}, 500);
  }
}