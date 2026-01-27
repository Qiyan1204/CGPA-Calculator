"use client";

import { useEffect, useState } from "react";

export default function StaffPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [resultStats, setResultStats] = useState<any[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    // 从真实的 localStorage 获取用户数据
    const userStr = localStorage.getItem("user");
    console.log("userStr:", userStr);

    if (!userStr) {
      setLoading(false);
      return;
    }

    const user = JSON.parse(userStr);
    console.log("user:", user);

    // 调用真实的 API
    fetch(`/api/courses?staffId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        console.log("courses api data:", data);
        setCourses(data.courses || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching courses:", err);
        setLoading(false);
      });
  }, []);

  async function handleViewResult(courseId: number) {
    if (!courseId) return;

    setSelectedCourseId(courseId);
    setResultStats([]);
    setLoadingResults(true);

    try {
      const res = await fetch(`/api/results/stats?courseId=${courseId}`);
      const data = await res.json();
      console.log("Result stats data:", data);
      setResultStats(data.stats || []);
    } catch (error) {
      console.error("Error fetching results:", error);
      setResultStats([]);
    } finally {
      setLoadingResults(false);
    }
  }

  function calculatePassRate() {
    if (!selectedCourseId || resultStats.length === 0) {
      return '-';
    }

    const passGrades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D'];
    
    let totalStudents = 0;
    let passedStudents = 0;

    resultStats.forEach(stat => {
      const count = stat._count.grade;
      totalStudents += count;
      
      if (passGrades.includes(stat.grade)) {
        passedStudents += count;
      }
    });

    if (totalStudents === 0) return '0.0';
    
    const passRate = ((passedStudents / totalStudents) * 100).toFixed(1);
    return `${passRate}%`;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Staff Dashboard</h1>
          <p className="text-gray-600">
            Manage courses and view student results.
          </p>
        </div>

        {/* Main Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Courses Management Card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:border-cyan-300 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center text-2xl">
                📚
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Courses</h2>
                <p className="text-sm text-gray-600">
                  Create and manage your courses
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-6">
              <button 
                onClick={() => window.location.href = '/staff/create_course'}
                className="w-full px-5 py-2.5 bg-cyan-500 text-white rounded-lg font-medium hover:bg-cyan-600 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Course
              </button>
            </div>

            {/* Course Count */}
            {!loading && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Courses</span>
                  <span className="text-2xl font-bold text-cyan-500">{courses.length}</span>
                </div>
              </div>
            )}
          </div>

          {/* View Courses Card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:border-cyan-300 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center text-2xl">
                📋
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">View Courses</h2>
                <p className="text-sm text-gray-600">
                  Browse and manage your course list
                </p>
              </div>
            </div>

            {/* Courses List */}
            {loading ? (
              <div className="mt-6 text-center py-8">
                <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 text-sm">Loading courses...</p>
              </div>
            ) : courses.length > 0 ? (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Existing Courses</h3>
                  <span className="text-sm text-gray-600">{courses.length} course{courses.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {courses.map(c => (
                    <div 
                      key={c.id} 
                      className="border border-gray-200 rounded-lg p-4 hover:border-cyan-300 transition-all bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {c.courseCode?.charAt(0) || 'C'}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{c.courseName}</div>
                          <div className="text-sm text-gray-600">{c.courseCode}</div>
                        </div>
                        <button
                          onClick={() => handleViewResult(c.id)}
                          className="px-3 py-1.5 bg-cyan-500 text-white rounded text-xs font-medium hover:bg-cyan-600 transition-colors"
                        >
                          View Result
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-6 text-center py-8">
                <div className="text-4xl mb-2">📚</div>
                <p className="text-gray-600 text-sm mb-4">You haven't created any courses yet.</p>
                <button 
                  onClick={() => window.location.href = '/staff/create_course'}
                  className="px-4 py-2 bg-cyan-500 text-white rounded-lg text-sm font-medium hover:bg-cyan-600 transition-colors"
                >
                  Create Your First Course
                </button>
              </div>
            )}

            {/* Selected Course Results */}
            {selectedCourseId && loadingResults && (
              <div className="mt-6 pt-6 border-t border-gray-200 text-center py-4">
                <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-600 text-sm">Loading results...</p>
              </div>
            )}

            {selectedCourseId && !loadingResults && resultStats.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Result Summary
                </h3>

                <div className="space-y-2">
                  {resultStats.map(r => (
                    <div
                      key={r.grade}
                      className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-2"
                    >
                      <span className="font-medium text-gray-800">
                        Grade {r.grade}
                      </span>
                      <span className="font-bold text-cyan-500">
                        {r._count.grade} student{r._count.grade !== 1 ? "s" : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedCourseId && !loadingResults && resultStats.length === 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200 text-center py-4">
                <div className="text-3xl mb-2">📭</div>
                <p className="text-gray-600 text-sm">No results found for this course.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats Section */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:border-cyan-300 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-cyan-500">{courses.length}</div>
                  <div className="text-sm text-gray-600 mt-1">Active Courses</div>
                </div>
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📚</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:border-cyan-300 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-cyan-500">
                    {selectedCourseId && resultStats.length > 0
                      ? resultStats.reduce((sum, r) => sum + r._count.grade, 0)
                      : '-'}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Total Students</div>
                </div>
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:border-cyan-300 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-cyan-500">
                    {calculatePassRate()}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Pass Rate</div>
                </div>
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}