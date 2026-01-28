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
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const router = useRouter();

  function validateEmail(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function validatePassword(password: string) {
    return password.length >= 8;
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    
    // Validate email format
    if (!validateEmail(email)) {
      setError("Please enter a valid email address with @");
      return;
    }

    // Validate password length
    if (!validatePassword(password)) {
      setError("Password must be at least 8 characters long");
      return;
    }

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

  // Password strength indicator
  function getPasswordStrength(password: string) {
    if (password.length === 0) return { text: "", color: "" };
    if (password.length < 8) return { text: "Too short", color: "text-red-600" };
    if (password.length < 10) return { text: "Weak", color: "text-orange-600" };
    if (password.length < 12) return { text: "Good", color: "text-yellow-600" };
    return { text: "Strong", color: "text-green-600" };
  }

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
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
                  {email && !validateEmail(email) && (
                    <p className="text-red-600 text-xs mt-1">
                      Please enter a valid email with @
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Password
                  </label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    type="password"
                    required
                    minLength={8}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                  {password && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-gray-200 rounded">
                          <div 
                            className={`h-full rounded transition-all ${
                              password.length < 8 ? 'bg-red-500 w-1/4' :
                              password.length < 10 ? 'bg-orange-500 w-1/2' :
                              password.length < 12 ? 'bg-yellow-500 w-3/4' :
                              'bg-green-500 w-full'
                            }`}
                          />
                        </div>
                        <span className={`text-xs font-medium ${passwordStrength.color}`}>
                          {passwordStrength.text}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs mt-1">
                        Must be at least 8 characters
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Confirm Password
                  </label>
                  <input
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    type="password"
                    required
                    minLength={8}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-red-600 text-xs mt-1">
                      Passwords do not match
                    </p>
                  )}
                  {confirmPassword && password === confirmPassword && (
                    <p className="text-green-600 text-xs mt-1">
                      ✓ Passwords match
                    </p>
                  )}
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
                    <button
                      type="button"
                      onClick={() => setShowTerms(true)}
                      className="text-cyan-500 hover:text-cyan-600 underline"
                    >
                      Terms of Service
                    </button>
                    {" "}and{" "}
                    <button
                      type="button"
                      onClick={() => setShowPrivacy(true)}
                      className="text-cyan-500 hover:text-cyan-600 underline"
                    >
                      Privacy Policy
                    </button>
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
      
{/* Terms of Service Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Terms of Service</h2>
              <button
                onClick={() => setShowTerms(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-gray-700">
                Welcome to CGPA Calculator. By using our service, you agree to these terms.
              </p>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h3>
                <p className="text-gray-700">
                  By accessing and using CGPA Calculator, you accept and agree to be bound by the terms
                  and provision of this agreement.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Use of Service</h3>
                <p className="text-gray-700">
                  You agree to use this service for lawful purposes only. You are responsible for
                  maintaining the confidentiality of your account information.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">3. User Responsibilities</h3>
                <p className="text-gray-700">
                  You are responsible for the accuracy of the information you provide and for keeping
                  your account credentials secure.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">4. Limitation of Liability</h3>
                <p className="text-gray-700">
                  CGPA Calculator is provided "as is" without any warranties. We are not liable for
                  any damages arising from the use of this service.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">5. Changes to Terms</h3>
                <p className="text-gray-700">
                  We reserve the right to modify these terms at any time. Continued use of the service
                  constitutes acceptance of modified terms.
                </p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
              <button
                onClick={() => setShowTerms(false)}
                className="w-full py-2 bg-cyan-500 text-white rounded font-medium hover:bg-cyan-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Privacy Policy</h2>
              <button
                onClick={() => setShowPrivacy(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-gray-700">
                This Privacy Policy explains how CGPA Calculator collects, uses, and protects your
                personal information.
              </p>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Information We Collect</h3>
                <p className="text-gray-700">
                  We collect basic personal information such as your name, email address, and academic
                  data for CGPA calculation purposes.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">2. How We Use Your Information</h3>
                <p className="text-gray-700">
                  Your data is used only to provide and improve our services. We do not sell or share
                  your information with third parties.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Data Security</h3>
                <p className="text-gray-700">
                  We take reasonable measures to protect your personal information from unauthorized
                  access, disclosure, or destruction.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">4. Changes to This Policy</h3>
                <p className="text-gray-700">
                  This Privacy Policy may be updated from time to time. We will notify you of any
                  significant changes.
                </p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
              <button
                onClick={() => setShowPrivacy(false)}
                className="w-full py-2 bg-cyan-500 text-white rounded font-medium hover:bg-cyan-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}