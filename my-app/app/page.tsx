"use client";

import { useState, useEffect } from "react";

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Check if user is logged in
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setIsLoggedIn(true);
      const user = JSON.parse(userStr);
      setUserRole(user.role || "student");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserRole(null);
    window.location.href = "/";
  };

  const handleGetStarted = () => {
    if (isLoggedIn) {
      // Redirect based on user role
      if (userRole === "staff") {
        window.location.href = "/staff";
      } else {
        window.location.href = "/student";
      }
    } else {
      window.location.href = "/register";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <button onClick={() => window.location.href = "/"} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cyan-500 rounded flex items-center justify-center text-white font-bold">
              C
            </div>
            <span className="text-xl font-semibold text-gray-800">
              CGPA Calculator
            </span>
          </button>

          <nav className="flex items-center gap-6">
            <button onClick={() => window.location.href = "/"} className="text-gray-600 hover:text-gray-900">
              Home
            </button>
            {isLoggedIn ? (
              <>
                <button 
                  onClick={() => window.location.href = userRole === "staff" ? "/staff" : "/student"} 
                  className="text-gray-600 hover:text-gray-900"
                >
                  Dashboard
                </button>
                <button 
                  onClick={handleLogout}
                  className="px-5 py-2 bg-cyan-500 text-white rounded font-medium hover:bg-cyan-600 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button onClick={() => window.location.href = "/login"} className="text-gray-600 hover:text-gray-900">
                  Login
                </button>
                <button onClick={() => window.location.href = "/register"}>
                  <span className="px-5 py-2 bg-cyan-500 text-white rounded font-medium hover:bg-cyan-600 transition-colors inline-block">
                    Get Started
                  </span>
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 px-4 py-2 bg-cyan-50 border border-cyan-200 rounded-full text-cyan-600 text-sm font-medium">
              Simple & Easy to Use
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
              Calculate Your CGPA
              <br />
              <span className="text-cyan-500">With Ease</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Track your academic performance, calculate your CGPA, and stay on top of your grades with our simple calculator.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button 
                onClick={handleGetStarted}
                className="w-full sm:w-auto px-8 py-3 bg-cyan-500 text-white text-lg rounded font-semibold hover:bg-cyan-600 transition-colors shadow-md"
              >
                {isLoggedIn ? "Go to Dashboard →" : "Start Calculating →"}
              </button>

              {!isLoggedIn && (
                <button 
                  onClick={() => window.location.href = "/login"}
                  className="w-full sm:w-auto px-8 py-3 bg-white text-gray-700 text-lg rounded font-semibold border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                <div className="text-3xl font-bold text-cyan-500 mb-1">100%</div>
                <div className="text-gray-600 text-sm">Free to Use</div>
              </div>
              <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                <div className="text-3xl font-bold text-cyan-500 mb-1">1k+</div>
                <div className="text-gray-600 text-sm">Students</div>
              </div>
              <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                <div className="text-3xl font-bold text-cyan-500 mb-1">Fast</div>
                <div className="text-gray-600 text-sm">Calculation</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-white py-20 border-y border-gray-200">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-3">
                Key Features
              </h2>
              <p className="text-lg text-gray-600">
                Everything you need to track your academic progress
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-cyan-300 hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4 text-2xl">
                  📊
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Calculation</h3>
                <p className="text-gray-600">
                  Calculate your CGPA and GPA quickly with our simple and intuitive interface.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-cyan-300 hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4 text-2xl">
                  📝
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Grade Tracking</h3>
                <p className="text-gray-600">
                  Keep track of all your courses, credits, and grades in one place.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-cyan-300 hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4 text-2xl">
                  📈
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Progress Reports</h3>
                <p className="text-gray-600">
                  View your academic progress with detailed reports and analytics.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-cyan-300 hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4 text-2xl">
                  💾
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Save Your Data</h3>
                <p className="text-gray-600">
                  Your grades are safely stored and accessible anytime you need them.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-cyan-300 hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4 text-2xl">
                  📱
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Mobile Friendly</h3>
                <p className="text-gray-600">
                  Access your calculator from any device - phone, tablet, or computer.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-cyan-300 hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4 text-2xl">
                  🎯
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Goal Setting</h3>
                <p className="text-gray-600">
                  Set target CGPA goals and track your progress towards achieving them.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-12 text-center text-white shadow-lg">
            <div className="text-5xl mb-4">🎓</div>
            <h2 className="text-4xl font-bold mb-4">
              Ready to Track Your Grades?
            </h2>
            <p className="text-lg text-cyan-50 mb-8 max-w-xl mx-auto">
              {isLoggedIn 
                ? "Continue tracking your academic performance with our CGPA Calculator."
                : "Join students who are already using our CGPA Calculator to stay on top of their academic performance."}
            </p>
            <button 
              onClick={handleGetStarted}
              className="px-10 py-4 bg-white text-cyan-600 text-lg rounded-lg font-bold hover:bg-gray-50 transition-colors shadow-md"
            >
              {isLoggedIn ? "Go to Dashboard" : "Get Started Free"}
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-cyan-500 rounded flex items-center justify-center text-white font-bold text-sm">
                C
              </div>
              <span className="font-semibold text-gray-800">CGPA Calculator</span>
            </div>
            <div className="text-gray-600 text-sm">
              © {new Date().getFullYear()} CGPA Calculator. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm">
              <button onClick={() => alert("Privacy page")} className="text-gray-600 hover:text-gray-900">
                Privacy
              </button>
              <button onClick={() => alert("Terms page")} className="text-gray-600 hover:text-gray-900">
                Terms
              </button>
              <button onClick={() => alert("Contact page")} className="text-gray-600 hover:text-gray-900">
                Contact
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}