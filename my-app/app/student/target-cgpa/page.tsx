"use client";

import { useEffect, useState } from "react";

export default function TargetCgpaPage() {
  const [results, setResults] = useState<any[]>([]);
  const [studentId, setStudentId] = useState<number | null>(null);

  const [targetCgpa, setTargetCgpa] = useState(3.8);
  const [remainingSemesters, setRemainingSemesters] = useState(1);
  const [avgCreditsPerSem, setAvgCreditsPerSem] = useState(10);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user?.id) {
      setStudentId(user.id);
    }
  }, []);

  useEffect(() => {
    if (studentId) {
      fetch(`/api/results?studentId=${studentId}`)
        .then((res) => res.json())
        .then((data) => setResults(data.results || []));
    }
  }, [studentId]);

  function calcCurrentCgpa() {
    let totalPoints = 0;
    let totalCredits = 0;

    results.forEach((r) => {
      totalPoints += r.gradePoint * r.credit;
      totalCredits += r.credit;
    });

    return {
      cgpa: totalCredits ? totalPoints / totalCredits : 0,
      credits: totalCredits,
      points: totalPoints,
    };
  }

  function calcRequiredGpa() {
    const current = calcCurrentCgpa();

    const remainingCredits = remainingSemesters * avgCreditsPerSem;
    const targetTotalPoints = targetCgpa * (current.credits + remainingCredits);

    const neededPoints = targetTotalPoints - current.points;

    if (remainingCredits <= 0) return 0;

    return neededPoints / remainingCredits;
  }

  const current = calcCurrentCgpa();
  const requiredGpa = calcRequiredGpa();
  const isAchievable = requiredGpa <= 4.0;
  const difficulty = requiredGpa > 3.5 ? "challenging" : requiredGpa > 3.0 ? "moderate" : "achievable";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Target CGPA Planner</h1>
          <p className="text-gray-600">
            Set your target CGPA and calculate what grades you need to achieve it.
          </p>
        </div>

        {/* Current Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:border-cyan-300 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-cyan-500">
                  {current.cgpa.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600 mt-1">Current CGPA</div>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:border-cyan-300 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-cyan-500">{current.credits}</div>
                <div className="text-sm text-gray-600 mt-1">Completed Credits</div>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:border-cyan-300 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-cyan-500">
                  {remainingSemesters * avgCreditsPerSem}
                </div>
                <div className="text-sm text-gray-600 mt-1">Remaining Credits</div>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center text-xl">
                🎯
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Set Your Goal</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target CGPA
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  value={targetCgpa}
                  onChange={(e) => setTargetCgpa(Number(e.target.value))}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
                <p className="mt-1 text-xs text-gray-500">Enter a value between 0.00 and 4.00</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remaining Semesters
                </label>
                <input
                  type="number"
                  min="1"
                  value={remainingSemesters}
                  onChange={(e) => setRemainingSemesters(Number(e.target.value))}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
                <p className="mt-1 text-xs text-gray-500">How many semesters do you have left?</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Average Credits per Semester
                </label>
                <input
                  type="number"
                  min="1"
                  value={avgCreditsPerSem}
                  onChange={(e) => setAvgCreditsPerSem(Number(e.target.value))}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
                <p className="mt-1 text-xs text-gray-500">Typical credit hours per semester</p>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center text-xl">
                📈
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Required Performance</h2>
            </div>

            <div className="space-y-6">
              {/* Required GPA Display */}
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-6 text-center">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Required Average GPA per Semester
                </div>
                <div
                  className={`text-5xl font-bold mb-2 ${
                    !isAchievable
                      ? "text-red-600"
                      : requiredGpa > 3.5
                      ? "text-orange-600"
                      : "text-green-600"
                  }`}
                >
                  {requiredGpa.toFixed(2)}
                </div>
                {!isAchievable && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                    <span>⚠️</span>
                    <span>Not Achievable</span>
                  </div>
                )}
                {isAchievable && requiredGpa > 3.5 && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                    <span>💪</span>
                    <span>Challenging</span>
                  </div>
                )}
                {isAchievable && requiredGpa <= 3.5 && requiredGpa > 3.0 && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                    <span>📝</span>
                    <span>Moderate</span>
                  </div>
                )}
                {isAchievable && requiredGpa <= 3.0 && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    <span>✨</span>
                    <span>Achievable</span>
                  </div>
                )}
              </div>

              {/* Analysis */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Current → Target</span>
                  <span className="font-semibold text-gray-900">
                    {current.cgpa.toFixed(2)} → {targetCgpa.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">CGPA Increase Needed</span>
                  <span className={`font-semibold ${targetCgpa > current.cgpa ? 'text-cyan-600' : 'text-gray-900'}`}>
                    +{Math.max(0, targetCgpa - current.cgpa).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Total Future Credits</span>
                  <span className="font-semibold text-gray-900">
                    {remainingSemesters * avgCreditsPerSem}
                  </span>
                </div>
              </div>

              {/* Advice */}
              <div className={`p-4 rounded-lg border-l-4 ${
                !isAchievable
                  ? "bg-red-50 border-red-500"
                  : requiredGpa > 3.5
                  ? "bg-orange-50 border-orange-500"
                  : "bg-green-50 border-green-500"
              }`}>
                <div className="text-sm font-medium mb-1">
                  {!isAchievable && "Recommendation"}
                  {isAchievable && requiredGpa > 3.5 && "Tips for Success"}
                  {isAchievable && requiredGpa <= 3.5 && "Keep It Up!"}
                </div>
                <div className="text-xs text-gray-700">
                  {!isAchievable && "Your target CGPA exceeds the maximum possible (4.00). Consider adjusting your target or increasing remaining semesters."}
                  {isAchievable && requiredGpa > 3.5 && "This goal is challenging but achievable! Focus on your strongest subjects and seek help early if needed."}
                  {isAchievable && requiredGpa <= 3.5 && requiredGpa > 3.0 && "Your target is realistic. Stay consistent with your studies and maintain good study habits."}
                  {isAchievable && requiredGpa <= 3.0 && "Great news! Your target is very achievable with consistent effort. Keep up the good work!"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="mt-6 bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center text-xl">
              💡
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Understanding Your Results</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-semibold text-gray-900 mb-2">How is this calculated?</div>
              <p className="text-sm text-gray-600">
                The required GPA is calculated based on your current CGPA, completed credits, 
                and how many credits you'll take in remaining semesters.
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-semibold text-gray-900 mb-2">Grade Equivalents</div>
              <div className="text-sm text-gray-600 space-y-1">
                <div>4.00 = A/A+</div>
                <div>3.67 = A-</div>
                <div>3.33 = B+</div>
                <div>3.00 = B</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}