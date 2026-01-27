import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const courseId = Number(url.searchParams.get("courseId"));

  const attendance = await prisma.attendance.findMany({
    where: { courseId },
    include: { student: true },  // 讓你可以看到 student name
    orderBy: { attendanceDate: "desc" },
  });

  return NextResponse.json({ attendance });
}
