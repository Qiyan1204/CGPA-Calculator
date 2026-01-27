"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function GpaTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  const diff =
    data.prevGpa !== undefined
      ? Number((data.gpa - data.prevGpa).toFixed(2))
      : null;

  const color =
    diff === null
      ? "text-slate-500"
      : diff > 0
      ? "text-green-600"
      : diff < 0
      ? "text-red-600"
      : "text-slate-500";

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm shadow-lg">
      <div className="font-bold mb-1">{data.semester}</div>
      <div>GPA: {data.gpa.toFixed(2)}</div>
      {diff !== null && (
        <div className={`mt-1 font-semibold ${color}`}>
          {diff > 0 && "+"}
          {diff.toFixed(2)} compared to last semester
        </div>
      )}
    </div>
  );
}

export default function CgpaPage() {
  const [studentId, setStudentId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [courses, setCourses] = useState<any[]>([]);
  const [course, setCourse] = useState("");
  const [grade, setGrade] = useState("A+");
  const [credit, setCredit] = useState(3);
  const [semester, setSemester] = useState("Y1S1");
  const [results, setResults] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  const gradeMap: any = {
    "A+": 4.0,
    A: 4.0,
    "A-": 3.67,
    "B+": 3.33,
    B: 3.0,
    "B-": 2.67,
    "C+": 2.33,
    C: 2.0,
    F: 0.0,
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user?.id) {
      setStudentId(user.id);
    }

    fetchCourses();
  }, []);

  useEffect(() => {
    if (studentId) {
      fetchResults();
    }
  }, [studentId]);

  async function fetchCourses() {
    const res = await fetch("/api/courses");
    const data = await res.json();
    setCourses(data.courses || []);
  }

  async function fetchResults() {
    const res = await fetch(`/api/results?studentId=${studentId}`);
    const data = await res.json();
    setResults(data.results || []);
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure to delete this result?")) return;

    await fetch(`/api/results?id=${id}`, {
      method: "DELETE",
    });

    fetchResults();
  }

  async function handleSave(r: any) {
    await fetch("/api/results", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: r.id,
        grade: r.grade,
        gradePoint: gradeMap[r.grade],
        credit: r.credit,
        semester: r.semester,
      }),
    });

    setEditingId(null);
    fetchResults();
  }

  async function handleAdd() {
    if (!course) {
      setMessage("Please select course");
      return;
    }

    if (!studentId) {
      setMessage("Student not logged in");
      return;
    }

    const res = await fetch("/api/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId,
        courseId: Number(course),
        grade,
        gradePoint: gradeMap[grade],
        credit,
        semester,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.message || "Failed to add result");
      return;
    }

    setMessage("Result added successfully!");
    setCourse("");
    fetchResults();
    
    setTimeout(() => setMessage(""), 3000);
  }

  function buildSemesterChartData(results: any[]) {
    const map: Record<string, { points: number; credits: number }> = {};

    results.forEach((r) => {
      if (!map[r.semester]) {
        map[r.semester] = { points: 0, credits: 0 };
      }
      map[r.semester].points += r.gradePoint * r.credit;
      map[r.semester].credits += r.credit;
    });

    return Object.keys(map).map((sem) => ({
      semester: sem,
      gpa: Number((map[sem].points / map[sem].credits).toFixed(2)),
    }));
  }

  function buildChartWithTrend(results: any[]) {
    const chartData = buildSemesterChartData(results);
    chartData.sort((a, b) => a.semester.localeCompare(b.semester));

    return chartData.map((item, index) => {
      const prev = chartData[index - 1];
      const trend =
        !prev ? "same" : item.gpa > prev.gpa ? "up" : item.gpa < prev.gpa ? "down" : "same";
      return {
        ...item,
        trend,
        prevGpa: prev?.gpa,
      };
    });
  }

  const chartData = buildChartWithTrend(results);

  function groupBySemester(data: any[]) {
    const groups: Record<string, any[]> = {};

    data.forEach((r) => {
      const sem = r.semester || "Unknown";
      if (!groups[sem]) groups[sem] = [];
      groups[sem].push(r);
    });

    return groups;
  }

  function calcSemesterAvg(results: any[]) {
    let totalPoints = 0;
    let totalCredits = 0;

    results.forEach((r) => {
      totalPoints += r.gradePoint * r.credit;
      totalCredits += r.credit;
    });

    return totalCredits ? (totalPoints / totalCredits).toFixed(2) : "0.00";
  }

  function calculateCGPA() {
    let totalPoints = 0;
    let totalCredits = 0;

    results.forEach((r) => {
      totalPoints += r.gradePoint * r.credit;
      totalCredits += r.credit;
    });

    return totalCredits ? (totalPoints / totalCredits).toFixed(2) : "0.00";
  }

  const grouped = groupBySemester(results);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CGPA Calculator</h1>
          <p className="text-gray-600">
            Track your academic performance and calculate your cumulative GPA.
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes("success") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Quick Stats */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:border-cyan-300 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-cyan-500">{calculateCGPA()}</div>
                <div className="text-sm text-gray-600 mt-1">Overall CGPA</div>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:border-cyan-300 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-cyan-500">{results.length}</div>
                <div className="text-sm text-gray-600 mt-1">Total Courses</div>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:border-cyan-300 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-cyan-500">
                  {results.reduce((sum, r) => sum + r.credit, 0)}
                </div>
                <div className="text-sm text-gray-600 mt-1">Total Credits</div>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎓</span>
              </div>
            </div>
          </div>
        </div>

        {/* Add Result Form */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center text-xl">
              ➕
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Add New Result</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
              <select
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.courseName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
              <select
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              >
                {Object.keys(gradeMap).map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Credit Hours</label>
              <input
                type="number"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                value={credit}
                onChange={(e) => setCredit(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
              <select
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
              >
                <option>Y1S1</option>
                <option>Y1S2</option>
                <option>Y1S3</option>
                <option>Y2S1</option>
                <option>Y2S2</option>
                <option>Y2S3</option>
                <option>Y3S1</option>
                <option>Y3S2</option>
                <option>Y3S3</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleAdd}
            className="px-6 py-2.5 bg-cyan-500 text-white rounded-lg font-medium hover:bg-cyan-600 transition-colors"
          >
            Add Result
          </button>
        </div>

        {/* GPA Trend Chart */}
        {chartData.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center text-xl">
                📈
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Semester GPA Trend</h2>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="semester" stroke="#6b7280" />
                <YAxis domain={[0, 4]} stroke="#6b7280" />
                <Tooltip content={<GpaTooltip />} />
                <Line
                  type="monotone"
                  dataKey="gpa"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#06b6d4" }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              {chartData.map((d) => (
                <div
                  key={d.semester}
                  className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                >
                  <div className="text-sm font-medium text-gray-700">{d.semester}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-lg font-bold text-gray-900">{d.gpa.toFixed(2)}</span>
                    <span
                      className={`text-sm font-semibold ${
                        d.trend === "up"
                          ? "text-green-600"
                          : d.trend === "down"
                          ? "text-red-600"
                          : "text-gray-500"
                      }`}
                    >
                      {d.trend === "up" ? "↑" : d.trend === "down" ? "↓" : "→"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results by Semester */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center text-xl">
              📋
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Course Results</h2>
          </div>

          {Object.keys(grouped).length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📚</div>
              <p className="text-gray-600 mb-2">No results added yet</p>
              <p className="text-sm text-gray-500">Start by adding your first course result above</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.keys(grouped)
                .sort()
                .map((sem) => (
                  <div key={sem} className="border border-gray-200 rounded-lg p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">{sem}</h3>
                      <div className="text-sm">
                        <span className="text-gray-600">Semester GPA: </span>
                        <span className="font-bold text-cyan-600">{calcSemesterAvg(grouped[sem])}</span>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Course</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Grade</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Credits</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Points</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {grouped[sem].map((r) => (
                            <tr key={r.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">{r.course.courseName}</td>

                              {editingId === r.id ? (
                                <>
                                  <td className="px-4 py-3">
                                    <select
                                      className="p-1.5 border border-gray-300 rounded text-sm"
                                      value={r.grade}
                                      onChange={(e) =>
                                        setResults((prev) =>
                                          prev.map((x) =>
                                            x.id === r.id
                                              ? {
                                                  ...x,
                                                  grade: e.target.value,
                                                  gradePoint: gradeMap[e.target.value],
                                                }
                                              : x
                                          )
                                        )
                                      }
                                    >
                                      {Object.keys(gradeMap).map((g) => (
                                        <option key={g}>{g}</option>
                                      ))}
                                    </select>
                                  </td>

                                  <td className="px-4 py-3">
                                    <input
                                      type="number"
                                      className="w-20 p-1.5 border border-gray-300 rounded text-sm"
                                      value={r.credit}
                                      onChange={(e) =>
                                        setResults((prev) =>
                                          prev.map((x) =>
                                            x.id === r.id ? { ...x, credit: Number(e.target.value) } : x
                                          )
                                        )
                                      }
                                    />
                                  </td>

                                  <td className="px-4 py-3 text-sm text-gray-900">{r.gradePoint.toFixed(2)}</td>

                                  <td className="px-4 py-3">
                                    <button
                                      onClick={() => handleSave(r)}
                                      className="text-sm text-green-600 hover:text-green-700 font-medium"
                                    >
                                      Save
                                    </button>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="px-4 py-3 text-sm">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800">
                                      {r.grade}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{r.credit}</td>
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                    {r.gradePoint.toFixed(2)}
                                  </td>

                                  <td className="px-4 py-3 space-x-3">
                                    <button
                                      onClick={() => setEditingId(r.id)}
                                      className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDelete(r.id)}
                                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                                    >
                                      Delete
                                    </button>
                                  </td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}