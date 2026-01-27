import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const staffIdParam = searchParams.get("staffId");
  const staffId = staffIdParam ? Number(staffIdParam) : null;

  if (staffId) {
    const courses = await prisma.course.findMany({
      where: { staffId },
    });
    return NextResponse.json({ courses }, { status: 200 });
  }

  // 如果没有 staffId，则返回全部课程（student 可见）
  const courses = await prisma.course.findMany();
  return NextResponse.json({ courses }, { status: 200 });
}

export async function POST(req: Request) {
  const { courseName, courseCode, staffId } = await req.json();

  if (!staffId) {
    return Response.json({ message: "Staff ID required" }, { status: 400 });
  }

  const course = await prisma.course.create({
    data: {
      courseName,
      courseCode,
      staffId
    }
  });

  return Response.json({ course });
}