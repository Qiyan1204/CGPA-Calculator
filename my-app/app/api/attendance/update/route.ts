import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request) {
  const { attendanceId, status } = await req.json();

  const attendance = await prisma.attendance.update({
    where: { id: attendanceId },
    data: { status },
  });

  return NextResponse.json({ attendance });
}
