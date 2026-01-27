import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

export async function main() {
  // 1️⃣ Create Staff
  const staff = await prisma.user.create({
    data: {
      name: "Alice Lecturer",
      email: "alice@university.edu",
      password: "password123", // 实际项目要 hash
      role: "staff",
    },
  });

  // 2️⃣ Create Student
  const student = await prisma.user.create({
    data: {
      name: "Bob Student",
      email: "bob@student.edu",
      password: "password123",
      role: "student",
    },
  });

  // 3️⃣ Create Course
  const course = await prisma.course.create({
    data: {
      courseName: "Web Development",
      courseCode: "WD101",
      staffId: staff.id,
    },
  });

  // 4️⃣ Enroll Student into Course
  await prisma.enrollment.create({
    data: {
      studentId: student.id,
      courseId: course.id,
    },
  });

  // 5️⃣ (Optional) Create Attendance
  await prisma.attendance.create({
    data: {
      studentId: student.id,
      courseId: course.id,
      attendanceDate: new Date(),
    },
  });

  console.log("Seed data inserted successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
