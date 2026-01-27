import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * 假设：
 * - 登录后你在前端 localStorage 存了 user.id
 * - 前端请求时用 query ?userId=xx
 * 实习作业 & 学校系统：完全可接受
 */

/* ======================
   GET: 获取 Student Profile
   ====================== */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = Number(searchParams.get("userId"));

    if (!userId) {
      return NextResponse.json(
        { message: "Missing userId" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("GET /api/user/profile error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/* ======================
   PUT: 更新 Profile（不含密码）
   ====================== */
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { userId, name, email } = body;

    if (!userId || !name || !email) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // 检查 email 是否被其他人用
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id: userId },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email already in use" },
        { status: 409 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /api/user/profile error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
