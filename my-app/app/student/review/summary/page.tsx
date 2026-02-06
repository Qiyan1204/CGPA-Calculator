"use client";

import { useEffect, useState } from "react";

type SemesterReview = {
  semesterId: string;
  gpa: number;
  timeManagement: number;
  difficulty: number;
  engagement: number;
  notes: string;
};

export default function SummaryPage() {
  const [reviews, setReviews] = useState<SemesterReview[]>([]);
  const [summary, setSummary] = useState<string>("");

  useEffect(() => {
    const stored = localStorage.getItem("semesterReviews");
    if (stored) {
      const data: SemesterReview[] = JSON.parse(stored);
      setReviews(data);
      setSummary(generateSummary(data));
    }
  }, []);

  // 🧠 核心总结逻辑
  const generateSummary = (reviews: SemesterReview[]): string => {
    if (reviews.length === 0) return "No reviews available.";

    // GPA 趋势
    const gpas = reviews.map(r => r.gpa);
    const avgGPA =
      gpas.reduce((sum, g) => sum + g, 0) / gpas.length;

    const lowGPA = reviews.filter(r => r.gpa < 3.0);
    const highGPA = reviews.filter(r => r.gpa >= 3.5);

    // 时间管理趋势
    const avgTime = reviews.reduce((sum, r) => sum + r.timeManagement, 0) / reviews.length;

    // 难度适应趋势
    const hardSemesters = reviews.filter(r => r.difficulty >= 4 && r.gpa >= 3.5);

    // 构建自然语言总结
    let summaryText = `You have completed ${reviews.length} semester(s). `;
    summaryText += `Your average GPA is ${avgGPA.toFixed(2)}. `;

    if (lowGPA.length > 0) {
      summaryText += `Some semesters had GPA below 3.0, consider reviewing time management. `;
    }
    if (highGPA.length > 0) {
      summaryText += `Several semesters were strong (GPA >= 3.5), well done! `;
    }

    summaryText += `Your average time management rating is ${avgTime.toFixed(1)}. `;

    if (hardSemesters.length > 0) {
      summaryText += `You handled high difficulty semesters well, showing strong resilience.`;
    }

    return summaryText;
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Semester Summary Insight</h1>

      {reviews.length === 0 ? (
        <p className="text-gray-500">No reviews saved yet.</p>
      ) : (
        <>
          <p className="mb-4 text-gray-700">{summary}</p>

          <div className="space-y-2">
            {reviews.map((r) => (
              <div key={r.semesterId} className="border rounded p-3 shadow-sm">
                <div className="flex justify-between">
                  <h2 className="font-semibold">{r.semesterId}</h2>
                  <span>GPA: {r.gpa.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-700">
                  Time Management: {r.timeManagement}/5, Difficulty: {r.difficulty}/5, Engagement: {r.engagement}/5
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
