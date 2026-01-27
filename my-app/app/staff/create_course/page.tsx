"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CreateCoursePage() {
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [staffId, setStaffId] = useState<number | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return;

    const user = JSON.parse(userStr);
    setStaffId(user.id);
  }, []);

  async function handleCreateCourse() {
    if (!staffId) {
      setMessage("Staff not logged in");
      setMessageType("error");
      return;
    }

    if (!courseName.trim() || !courseCode.trim()) {
      setMessage("Please fill in all fields");
      setMessageType("error");
      return;
    }

    setMessage("");

    const res = await fetch("/api/courses/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseName,
        courseCode,
        staffId,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.message || "Failed to create course");
      setMessageType("error");
      return;
    }

    setMessage("Course created successfully!");
    setMessageType("success");
    setCourseName("");
    setCourseCode("");
    
    // Auto-hide success message after 3 seconds
    setTimeout(() => setMessage(""), 3000);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/staff" className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 mb-4 font-medium">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Course</h1>
          <p className="text-gray-600">
            Add a new course to your teaching portfolio.
          </p>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`mb-6 rounded-lg border px-4 py-3 flex items-center gap-3 ${
            messageType === "success" 
              ? "bg-green-50 border-green-200" 
              : "bg-red-50 border-red-200"
          }`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
              messageType === "success" ? "bg-green-500" : "bg-red-500"
            }`}>
              {messageType === "success" ? (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <span className={`text-sm font-medium ${
              messageType === "success" ? "text-green-700" : "text-red-700"
            }`}>
              {message}
            </span>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Card Header */}
          <div className="border-b border-gray-200 px-6 sm:px-8 py-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center text-2xl">
                📚
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Course Information</h2>
                <p className="text-sm text-gray-600">Enter the details for your new course</p>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6 sm:p-8">
            <div className="space-y-6">
              {/* Course Name */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Course Name
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                  placeholder="e.g. Introduction to Computer Science"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter the full name of the course
                </p>
              </div>

              {/* Course Code */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Course Code
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                  placeholder="e.g. CS101"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter a unique course code (letters and numbers)
                </p>
              </div>

              {/* Preview */}
              {(courseName || courseCode) && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Preview</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center text-white font-bold">
                      {courseCode ? courseCode.charAt(0) : "?"}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {courseName || "Course Name"}
                      </div>
                      <div className="text-sm text-gray-600">
                        {courseCode || "Course Code"}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="my-8 border-t border-gray-200"></div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCreateCourse}
                className="flex-1 px-6 py-3 bg-cyan-500 text-white rounded-lg font-bold hover:bg-cyan-600 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Course
              </button>
              
              <Link href="/staff" className="flex-1">
                <button className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                  Cancel
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}