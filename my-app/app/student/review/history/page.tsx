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

export default function ReviewHistoryPage() {
  const [reviews, setReviews] = useState<SemesterReview[]>([]);

  const deleteReview = (semesterId: string) => {
    const updated = reviews.filter(r => r.semesterId !== semesterId);
    setReviews(updated);
    localStorage.setItem("semesterReviews", JSON.stringify(updated));
  };

  useEffect(() => {
    const stored = localStorage.getItem("semesterReviews");
    if (stored) {
      setReviews(JSON.parse(stored));
    }
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-6">Semester Review History</h1>

      {reviews.length === 0 && (
        <p className="text-gray-500">No reviews saved yet.</p>
      )}

      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.semesterId}
            className="border rounded p-4 shadow-sm"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold">
                Semester: {review.semesterId}
              </h2>
              <span className="text-sm text-gray-600">
                GPA: {review.gpa.toFixed(2)}
              </span>
            </div>

            <p className="text-sm text-blue-700 mb-2">
              Insight: {generateInsight(review)}
            </p>

            <div className="text-sm text-gray-700">
              <p>Time Management: {review.timeManagement}/5</p>
              <p>Difficulty: {review.difficulty}/5</p>
              <p>Engagement: {review.engagement}/5</p>
            </div>

            {review.notes && (
              <p className="mt-2 text-sm text-gray-600">
                Notes: {review.notes}
              </p>
            )}

            {/* Delete 按钮 */}
            <div className="flex justify-end mt-2 space-x-2">
              <button
                className="text-sm text-blue-600 hover:underline"
                onClick={() => {
              // 存入 localStorage
                  localStorage.setItem(
                    "currentEdit",
                    JSON.stringify(review)
                  );
                  // 跳转回 Review Page
                  window.location.href = "/student/review";
                }}
              >
                Edit
              </button>

              <button
                className="text-sm text-red-600 hover:underline"
                onClick={() => deleteReview(review.semesterId)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
