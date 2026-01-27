"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setIsLoggedIn(true);
    }
  }, []);

  async function handleLogin() {
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message);
      return;
    }

    // Save user data to localStorage
    localStorage.setItem("user", JSON.stringify(data.user));

    // Login success
    console.log("Login success", data.user);
    if (data.user.role === "student") {
      router.push("/student");
    } else if (data.user.role === "staff") {
      router.push("/staff");
    } else {
      setError("Unknown role");
    }
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
            {isLoggedIn ? (
              <Link href="/student" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
            ) : (
              <span className="text-gray-400 cursor-not-allowed" title="Please login first">
                Dashboard
              </span>
            )}
            <Link href="/register" className="text-gray-600 hover:text-gray-900">
              Register
            </Link>
          </nav>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-md p-8">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Login</h1>
              <p className="text-gray-600">Welcome back! Please login to your account.</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
              <div className="space-y-4">
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
                    placeholder="Enter your password"
                    type="password"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center text-gray-600">
                    <input type="checkbox" className="mr-2" />
                    Remember me
                  </label>
                  <Link href="/forgot-password" className="text-cyan-500 hover:text-cyan-600">
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-cyan-500 text-white rounded font-medium hover:bg-cyan-600 transition-colors"
                >
                  Login
                </button>
              </div>
            </form>

            {/* Register Link */}
            <p className="mt-6 text-center text-gray-600 text-sm">
              Don't have an account?{" "}
              <Link href="/register" className="text-cyan-500 hover:text-cyan-600 font-medium">
                Sign up here
              </Link>
            </p>
          </div>

          {/* Footer Note */}
          <p className="mt-4 text-center text-gray-500 text-xs">
            By logging in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}