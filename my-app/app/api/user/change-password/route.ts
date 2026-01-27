import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { userId, currentPassword, newPassword } = body;

    // 1️⃣ 基本校验
    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // 2️⃣ 找用户
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // 3️⃣ 验证旧密码
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { message: "Current password is incorrect" },
        { status: 401 }
      );
    }

    // 4️⃣ 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 5️⃣ 更新密码
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
