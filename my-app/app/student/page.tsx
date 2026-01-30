"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function StudentDashboard() {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(userStr);
    setStudentId(user.id);
  }, [router]);

  useEffect(() => {
    if (studentId) {
      fetchResults();
    }
  }, [studentId]);

  async function fetchResults() {
    try {
      const res = await fetch(`/api/results?studentId=${studentId}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setLoading(false);
    }
  }

  function calculateCGPA() {
    if (results.length === 0) return "0.00";

    let totalPoints = 0;
    let totalCredits = 0;

    results.forEach((r) => {
      totalPoints += r.gradePoint * r.credit;
      totalCredits += r.credit;
    });

    return totalCredits ? (totalPoints / totalCredits).toFixed(2) : "0.00";
  }

  function getTotalCourses() {
    return results.length;
  }

  function getTotalCredits() {
    return results.reduce((sum, r) => sum + r.credit, 0);
  }

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  const cgpa = calculateCGPA();
  const totalCourses = getTotalCourses();
  const totalCredits = getTotalCredits();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <button onClick={() => router.push("/")} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cyan-500 rounded flex items-center justify-center text-white font-bold">
              C
            </div>
            <span className="text-xl font-semibold text-gray-800">
              CGPA Calculator
            </span>
          </button>

          <nav className="flex items-center gap-6">
            <button onClick={() => router.push("/")} className="text-gray-600 hover:text-gray-900">
              Home
            </button>
            <button onClick={() => router.push("/student")} className="text-cyan-600 font-medium">
              Dashboard
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="text-gray-600 hover:text-gray-900"
              >
                Profile
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-50">
                  <button 
                    onClick={() => router.push("/student/profile")}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    My Profile
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Dashboard</h1>
          <p className="text-gray-600">
            Welcome back! Manage your academic information and track your progress.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CGPA Calculator Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-cyan-300 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4 text-2xl">
              📊
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">CGPA Calculator</h2>
            <p className="text-sm text-gray-600 mb-6">
              Calculate your CGPA based on your course results and grades.
            </p>
            <button 
              onClick={() => router.push("/student/cgpa")}
              className="px-5 py-2 bg-cyan-500 text-white rounded font-medium hover:bg-cyan-600 transition-colors"
            >
              Open Calculator
            </button>
          </div>

          {/* Target CGPA Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-cyan-300 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4 text-2xl">
              🎯
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Target CGPA</h2>
            <p className="text-sm text-gray-600 mb-6">
              Set and track your desired CGPA goal to stay motivated.
            </p>
            <button 
              onClick={() => router.push("/student/target-cgpa")}
              className="px-5 py-2 bg-cyan-500 text-white rounded font-medium hover:bg-cyan-600 transition-colors"
            >
              Set Target
            </button>
          </div>

          {/* Investment */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-cyan-300 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4 text-2xl">
              💹
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Investment</h2>
            <p className="text-sm text-gray-600 mb-6">
              Track real-time and historical stock market data.
            </p>
            <button 
              onClick={() => router.push("/student/Investment")}
              className="px-5 py-2 bg-cyan-500 text-white rounded font-medium hover:bg-cyan-600 transition-colors"
            >
              Investment
            </button>
          </div>


        </div>

        {/* Quick Stats Section */}
        <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Overview</h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors">
                <div className="text-2xl font-bold text-cyan-500 mb-1">{cgpa}</div>
                <div className="text-sm text-gray-600">Current CGPA</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors">
                <div className="text-2xl font-bold text-cyan-500 mb-1">{totalCourses}</div>
                <div className="text-sm text-gray-600">Total Courses</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors">
                <div className="text-2xl font-bold text-cyan-500 mb-1">{totalCredits}</div>
                <div className="text-sm text-gray-600">Total Credits</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📚</div>
              <p className="text-gray-600 mb-2">No course results yet</p>
              <p className="text-sm text-gray-500 mb-4">
                Start by adding your first course result to see your statistics
              </p>
              <button 
                onClick={() => router.push("/student/cgpa")}
                className="px-5 py-2 bg-cyan-500 text-white rounded font-medium hover:bg-cyan-600 transition-colors"
              >
                Add Your First Result
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}