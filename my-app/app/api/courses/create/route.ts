import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { courseName, courseCode, staffId } = await req.json();

    if (!courseName || !courseCode || !staffId) {
      return NextResponse.json(
        { message: "Missing fields" },
        { status: 400 }
      );
    }

    const course = await prisma.course.create({
      data: {
        courseName,
        courseCode,
        staffId,
      },
    });

    return NextResponse.json(
      { message: "Course created", course },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "Course code already exists" },
        { status: 409 }
      );
    }

    console.error(error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
