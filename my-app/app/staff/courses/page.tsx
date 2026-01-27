"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Course = {
  id: number;
  courseName: string;
  courseCode: string;
  createdAt: string;
};

export default function StaffCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // ⚠️ 现在先写死 staffId（测试用）
  const staffId = 1;

  useEffect(() => {
    async function fetchCourses() {
      const res = await fetch(`/api/courses/my?staffId=${staffId}`);
      const data = await res.json();

      if (res.ok) {
        setCourses(data.courses);
      }

      setLoading(false);
    }

    fetchCourses();
  }, []);

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Courses</h1>

        <Link href="/staff/create_course">
          <button className="px-4 py-2 bg-blue-700 text-white rounded-lg">
            Create Course
          </button>
        </Link>
      </div>

      {loading && <p>Loading...</p>}

      {!loading && courses.length === 0 && (
        <p className="text-slate-600">No courses created yet.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="border rounded-xl p-6 bg-white shadow-sm"
          >
            <h2 className="font-bold text-lg">{course.courseName}</h2>
            <p className="text-slate-600">{course.courseCode}</p>
            <p className="text-xs text-slate-400 mt-2">
              Created at {new Date(course.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
