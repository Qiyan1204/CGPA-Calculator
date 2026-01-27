import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = Number(searchParams.get("courseId"));

    if (!courseId) {
      return NextResponse.json(
        { message: "courseId is required" },
        { status: 400 }
      );
    }

    // ✅ 按 grade 分组统计
    const stats = await prisma.result.groupBy({
      by: ["grade"],
      where: {
        courseId,
      },
      _count: {
        grade: true,
      },
      orderBy: {
        grade: "asc",
      },
    });

    /**
     * 返回格式示例：
     * [
     *   { grade: "A", _count: { grade: 5 } },
     *   { grade: "B+", _count: { grade: 8 } }
     * ]
     */

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Result stats error:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
