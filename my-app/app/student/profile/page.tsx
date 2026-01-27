"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type UserProfile = {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

export default function StudentProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [cgpa, setCgpa] = useState<number | null>(null);
  const [creditHours, setCreditHours] = useState<number | null>(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (storedUser?.id) {
      fetchProfile(storedUser.id);
      fetchStats(storedUser.id);
    } else {
      setMessage("User not logged in");
      setLoading(false);
    }
  }, []);

  async function fetchStats(userId: number) {
  try {
    const res = await fetch(`/api/user/stats?userId=${userId}`);
    const data = await res.json();

    if (res.ok) {
      setCgpa(data.cgpa);
      setCreditHours(data.creditHours);
    }
  } catch (err) {
    console.error("Failed to load CGPA stats");
  }
}

  async function fetchProfile(userId: number) {
    try {
      const res = await fetch(`/api/user/profile?userId=${userId}`);
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to load profile");
        setLoading(false);
        return;
      }

      setUser(data.user);
      setName(data.user.name);
      setEmail(data.user.email);
    } catch (err) {
      setMessage("Server error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!user) return;

    setMessage("");

    const res = await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        name,
        email,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.message || "Update failed");
      return;
    }

    setUser(data.user);
    setMessage("Profile updated successfully");
    setIsEditing(false);
    
    // Update localStorage
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    storedUser.name = data.user.name;
    storedUser.email = data.user.email;
    localStorage.setItem("user", JSON.stringify(storedUser));
  }

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-red-600 mb-6">{message}</p>
            <Link href="/login">
              <button className="px-5 py-2.5 bg-cyan-500 text-white rounded font-medium hover:bg-cyan-600 transition-colors">
                Go to Login
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Profile</h1>
          <p className="text-gray-600">
            View and manage your personal information.
          </p>
        </div>

        {/* Success Message */}
        {message && (
          <div className="mb-6 rounded-lg bg-cyan-50 border border-cyan-200 px-4 py-3 flex items-center gap-3">
            <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-cyan-700 text-sm font-medium">{message}</span>
          </div>
        )}

        {/* Main Profile Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Card Header */}
          <div className="border-b border-gray-200 px-6 sm:px-8 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                {name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Personal Information
              </h2>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-cyan-500 text-white rounded font-medium hover:bg-cyan-600 transition text-sm"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {/* Card Body */}
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student ID */}
              <div>
                <label className="block text-sm text-gray-600 font-medium mb-2">
                  Student ID
                </label>
                <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-900">
                  {user.id}
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm text-gray-600 font-medium mb-2">
                  Role
                </label>
                <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-900 capitalize">
                  {user.role}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm text-gray-600 font-medium mb-2">
                  Full Name
                </label>
                <input
                  className={`w-full px-4 py-2.5 border rounded-lg transition-all ${
                    isEditing 
                      ? 'border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500' 
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed text-gray-700'
                  }`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm text-gray-600 font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className={`w-full px-4 py-2.5 border rounded-lg transition-all ${
                    isEditing 
                      ? 'border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500' 
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed text-gray-700'
                  }`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              {/* Created At */}
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 font-medium mb-2">
                  Account Created
                </label>
                <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="my-8 border-t border-gray-200"></div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              {isEditing && (
                <button
                  onClick={handleSave}
                  className="px-5 py-2.5 bg-cyan-500 text-white rounded-lg font-bold hover:bg-cyan-600 transition-colors"
                >
                  Save Changes
                </button>
              )}

              <Link href="/student/change-password">
                <button className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                  Change Password
                </button>
              </Link>

              <button
                onClick={handleLogout}
                className="sm:ml-auto px-5 py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Section */}
        <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:border-cyan-300 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-cyan-500">98%</div>
                  <div className="text-sm text-gray-600 mt-1">Attendance Rate</div>
                </div>
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center text-2xl">
                  📊
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:border-cyan-300 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-cyan-500">
                    {cgpa !== null ? cgpa : "--"}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Current CGPA</div>
                </div>
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center text-2xl">
                  🎓
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:border-cyan-300 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-cyan-500">
                    {creditHours !== null ? creditHours : "--"}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Enrolled Courses</div>
                </div>
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center text-2xl">
                  📚
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}