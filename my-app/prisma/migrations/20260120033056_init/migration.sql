/*
  Warnings:

  - You are about to drop the column `course` on the `Result` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[studentId,courseId,semester]` on the table `Result` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `courseId` to the `Result` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Result_studentId_course_semester_key";

-- AlterTable
ALTER TABLE "Result" DROP COLUMN "course",
ADD COLUMN     "courseId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Result_studentId_courseId_semester_key" ON "Result"("studentId", "courseId", "semester");

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
