"use client";

import { useState, useEffect} from "react";
import Link from "next/link";




/* ✅ 直接写在这里，不用 types 文件 */
type SemesterReview = {
  semesterId: string;
  gpa: number;

  timeManagement: number; // 1–5
  difficulty: number;     // 1–5
  engagement: number;     // 1–5

  notes: string;
};



/* ✅ 直接写在这里，不用 utils 文件 */
function generateInsight(review: SemesterReview): string {
  if (review.gpa < 3.0 && review.timeManagement <= 2) {
    return "Low GPA may be related to poor time management.";
  }

  if (review.gpa >= 3.5 && review.engagement >= 4) {
    return "High engagement correlates with strong academic performance.";
  }

  if (review.difficulty >= 4 && review.gpa >= 3.5) {
    return "You perform well under challenging academic conditions.";
  }

  return "Your academic performance is stable this semester.";
}

export default function ReviewPage() {
  const [review, setReview] = useState<SemesterReview>({
    semesterId: "Y2S1",
    gpa: 3.45,
    timeManagement: 3,
    difficulty: 3,
    engagement: 3,
    notes: "",
  });

  useEffect(() => {
    // 如果是 Edit，预填数据
    const editData = localStorage.getItem("currentEdit");
    if (editData) {
      setReview(JSON.parse(editData));
      localStorage.removeItem("currentEdit"); // 防止下一次刷新重复
    }
  }, []);

  const saveReview = () => {
    const existing = localStorage.getItem("semesterReviews");
    const reviews = existing ? JSON.parse(existing) : [];

    const updated = reviews.filter(
      (r: SemesterReview) => r.semesterId !== review.semesterId
    );

    updated.push(review);
    localStorage.setItem("semesterReviews", JSON.stringify(updated));

    alert("Review saved!");
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Semester Review</h1>
        <label className="block mb-2">
          Time Management: {review.timeManagement}
        </label>
        <input
          type="range"
          min={1}
          max={5}
          value={review.timeManagement}
          onChange={(e) =>
            setReview({ ...review, timeManagement: Number(e.target.value) })
          }
        />

        <label className="block mt-4 mb-2">
          Difficulty: {review.difficulty}
        </label>
        <input
          type="range"
          min={1}
          max={5}
          value={review.difficulty}
          onChange={(e) =>
            setReview({ ...review, difficulty: Number(e.target.value) })
          }
        />

        <label className="block mt-4 mb-2">
          Engagement: {review.engagement}
        </label>
        <input
          type="range"
          min={1}
          max={5}
          value={review.engagement}
          onChange={(e) =>
            setReview({ ...review, engagement: Number(e.target.value) })
          }
        />

        <label className="block mt-4 mb-2">
          Notes
        </label>
        <textarea
          className="w-full border p-2"
          value={review.notes}
          onChange={(e) =>
            setReview({ ...review, notes: e.target.value })
          }
        />

      <button
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        onClick={saveReview}
      >
        Save Review
      </button>

      <Link href="/student/review/history">
        <button className="mt-4 ml-2 bg-gray-600 text-white px-4 py-2 rounded">
          View History
        </button>
      </Link>

      <Link href="/student/review/summary">
        <button className="mt-4 bg-purple-600 text-white px-4 py-2 rounded">
          View Summary Insight
        </button>
      </Link>

      <p className="mt-4 text-sm text-gray-700">
        Insight: {generateInsight(review)}
      </p>
    </div>
  );
}
