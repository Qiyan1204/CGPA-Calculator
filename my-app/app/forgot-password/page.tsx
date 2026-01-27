"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      console.log("📌 Forgot password request sending:", email);

      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      console.log("📌 Forgot password response:", data);

      if (!res.ok) {
        setError(data.message || "Something went wrong");
        return;
      }

      // 不管 email 是否存在，都显示成功（安全）
      setMessage("If an account exists, a reset link has been sent to your email.");
      setEmail("");
    } catch (err) {
      console.log("❌ Forgot password error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Forgot Password
        </h1>

        {message && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 text-white py-2 rounded hover:bg-cyan-600 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          <Link href="/login" className="text-cyan-600 hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
