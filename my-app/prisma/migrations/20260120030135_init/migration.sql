/*
  Warnings:

  - You are about to drop the column `courseId` on the `Result` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[studentId,course,semester]` on the table `Result` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `course` to the `Result` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Result" DROP CONSTRAINT "Result_courseId_fkey";

-- DropIndex
DROP INDEX "Result_studentId_courseId_semester_key";

-- AlterTable
ALTER TABLE "Result" DROP COLUMN "courseId",
ADD COLUMN     "course" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Result_studentId_course_semester_key" ON "Result"("studentId", "course", "semester");
