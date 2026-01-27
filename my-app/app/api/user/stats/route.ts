import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = Number(searchParams.get("userId"));

  if (!userId) {
    return NextResponse.json(
      { message: "User ID required" },
      { status: 400 }
    );
  }

  const results = await prisma.result.findMany({
    where: {
        studentId: userId 
    },
    select: {
      gradePoint: true,
      credit: true,
    },
  });

  if (results.length === 0) {
    return NextResponse.json({
      cgpa: 0,
      creditHours: 0,
    });
  }

  let totalPoints = 0;
  let totalCredits = 0;

  for (const r of results) {
    totalPoints += r.gradePoint * r.credit;
    totalCredits += r.credit;
  }

  const cgpa = Number((totalPoints / totalCredits).toFixed(2));

  return NextResponse.json({
    cgpa,
    creditHours: totalCredits,
  });
}
