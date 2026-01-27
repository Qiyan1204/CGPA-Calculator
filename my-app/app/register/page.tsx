"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role:"student" }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message);
      return;
    }

    console.log("Register success", data.user);
    // Redirect to login page
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Simple Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cyan-500 rounded flex items-center justify-center text-white font-bold">
              C
            </div>
            <span className="text-xl font-semibold text-gray-800">
              CGPA Calculator
            </span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <Link href="/login" className="text-gray-600 hover:text-gray-900">
              Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Register Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-md p-8">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
              <p className="text-gray-600">Sign up to start calculating your CGPA</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleRegister}>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Full Name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    type="email"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Password
                  </label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    type="password"
                    required
                    minLength={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Confirm Password
                  </label>
                  <input
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    type="password"
                    required
                    minLength={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div className="flex items-start pt-2">
                  <input 
                    type="checkbox" 
                    id="terms"
                    required
                    className="mt-1 mr-2"
                  />
                  <label htmlFor="terms" className="text-gray-600 text-sm">
                    I agree to the{" "}
                    <Link href="/terms" className="text-cyan-500 hover:text-cyan-600">
                      Terms of Service
                    </Link>
                    {" "}and{" "}
                    <Link href="/privacy" className="text-cyan-500 hover:text-cyan-600">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-cyan-500 text-white rounded font-medium hover:bg-cyan-600 transition-colors mt-2"
                >
                  Create Account
                </button>
              </div>
            </form>

            {/* Login Link */}
            <p className="mt-6 text-center text-gray-600 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-cyan-500 hover:text-cyan-600 font-medium">
                Sign in here
              </Link>
            </p>
          </div>

          {/* Footer Note */}
          <p className="mt-4 text-center text-gray-500 text-xs">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}