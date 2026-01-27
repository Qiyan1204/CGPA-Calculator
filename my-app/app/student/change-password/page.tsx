"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function getPasswordStrength(password: string) {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { label: "Weak", color: "text-red-600", bgColor: "bg-red-100", progressColor: "bg-red-500", width: "w-1/3" };
  if (score === 3 || score === 4)
    return { label: "Medium", color: "text-yellow-600", bgColor: "bg-yellow-100", progressColor: "bg-yellow-500", width: "w-2/3" };
  return { label: "Strong", color: "text-green-600", bgColor: "bg-green-100", progressColor: "bg-green-500", width: "w-full" };
}

export default function ChangePasswordPage() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);

  const strength = getPasswordStrength(newPassword);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }

    if (strength.label === "Weak") {
      setError("Password is too weak. Please use a stronger password.");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user?.id) {
      setError("User not logged in");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/user/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          currentPassword,
          newPassword,
        }),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch (e) {
        setLoading(false);
        setError("Server returned invalid response");
        return;
      }

      setLoading(false);

      if (!res.ok) {
        setError(data.message || "Failed to change password");
        return;
      }

      setMessage("Password changed successfully!");
      setPasswordChangeSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Redirect back after 2 seconds
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (err) {
      setLoading(false);
      setError("Server error. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Change Password</h1>
            </div>
          </div>
          <p className="text-gray-600">
            Update your password to keep your account secure
          </p>
        </div>

        {/* Success Message */}
        {message && (
          <div className="mb-6 rounded-lg bg-green-50 border border-green-200 px-4 py-3 flex items-center gap-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-green-700 text-sm font-medium">{message}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 flex items-center gap-3">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <span className="text-red-700 text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Card Header */}
          <div className="border-b border-gray-200 px-6 sm:px-8 py-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Update Your Password
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Please enter your current password and choose a new one
                </p>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Password */}
              <div>
                <label className="block text-sm text-gray-600 font-medium mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    disabled={passwordChangeSuccess}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={passwordChangeSuccess}
                  >
                    {showCurrentPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* New Password */}
              <div>
                <label className="block text-sm text-gray-600 font-medium mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your new password"
                    disabled={passwordChangeSuccess}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={passwordChangeSuccess}
                  >
                    {showNewPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Password Strength:</span>
                      <span className={`text-xs font-semibold ${strength.color}`}>
                        {strength.label}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`${strength.progressColor} h-2 rounded-full transition-all duration-300 ${strength.width}`}></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-sm text-gray-600 font-medium mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    disabled={passwordChangeSuccess}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={passwordChangeSuccess}
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Passwords do not match
                  </p>
                )}
                {confirmPassword && newPassword === confirmPassword && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Passwords match
                  </p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Password Requirements:
                </h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className={newPassword.length >= 8 ? "text-green-500" : "text-gray-400"}>
                      {newPassword.length >= 8 ? "✓" : "○"}
                    </span>
                    At least 8 characters long
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={/[A-Z]/.test(newPassword) ? "text-green-500" : "text-gray-400"}>
                      {/[A-Z]/.test(newPassword) ? "✓" : "○"}
                    </span>
                    Contains uppercase letter (A-Z)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={/[a-z]/.test(newPassword) ? "text-green-500" : "text-gray-400"}>
                      {/[a-z]/.test(newPassword) ? "✓" : "○"}
                    </span>
                    Contains lowercase letter (a-z)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={/[0-9]/.test(newPassword) ? "text-green-500" : "text-gray-400"}>
                      {/[0-9]/.test(newPassword) ? "✓" : "○"}
                    </span>
                    Contains number (0-9)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={/[^A-Za-z0-9]/.test(newPassword) ? "text-green-500" : "text-gray-400"}>
                      {/[^A-Za-z0-9]/.test(newPassword) ? "✓" : "○"}
                    </span>
                    Contains special character (!@#$%^&*)
                  </li>
                </ul>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={loading || passwordChangeSuccess}
                  className="flex-1 px-5 py-2.5 bg-cyan-500 text-white rounded-lg font-bold hover:bg-cyan-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Changing Password...</span>
                    </>
                  ) : passwordChangeSuccess ? (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Password Changed</span>
                    </>
                  ) : (
                    "Change Password"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Security Tips Section */}
        <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Security Tips
          </h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p className="flex items-start gap-2">
              <span className="text-cyan-500 mt-0.5">•</span>
              <span>Use a unique password that you don't use for other accounts</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-cyan-500 mt-0.5">•</span>
              <span>Avoid using personal information like your name or birthday</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-cyan-500 mt-0.5">•</span>
              <span>Consider using a password manager to generate and store strong passwords</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-cyan-500 mt-0.5">•</span>
              <span>Change your password regularly to maintain account security</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}