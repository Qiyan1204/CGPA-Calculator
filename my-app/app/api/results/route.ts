import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = Number(searchParams.get("studentId"));

    // 🔒 没 studentId 不给查
    if (!studentId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const results = await prisma.result.findMany({
      where: {
        studentId: studentId, // ✅ 关键点
      },
      include: {
        course: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error("GET /api/results error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { studentId, courseId, grade, gradePoint, credit, semester } = body;

    if (!studentId || !courseId) {
      return NextResponse.json(
        { message: "Missing studentId or courseId" },
        { status: 400 }
      );
    }

    const result = await prisma.result.create({
      data: {
        studentId,
        courseId,
        grade,
        gradePoint,
        credit,
        semester,
      },
    });

    return NextResponse.json({ result });
  } catch (error) {
    console.error("POST /api/results error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/* PUT - Edit */
export async function PUT(req: Request) {
  try {
    const { id, grade, gradePoint, credit, semester } = await req.json();

    const updated = await prisma.result.update({
      where: { id },
      data: {
        grade,
        gradePoint,
        credit,
        semester,
      },
    });

    return NextResponse.json({ updated });
  } catch {
    return NextResponse.json(
      { message: "Update failed" },
      { status: 500 }
    );
  }
}

/* DELETE */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));

    await prisma.result.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Deleted" });
  } catch {
    return NextResponse.json(
      { message: "Delete failed" },
      { status: 500 }
    );
  }
}