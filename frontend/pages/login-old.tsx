import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Link from "next/link";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, {
        email,
        password,
      });
      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("user_email", email);

      // Fetch user details to get full name
      try {
        const userRes = await axios.get(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${res.data.access_token}` },
        });
        if (userRes.data.full_name) {
          localStorage.setItem("user_name", userRes.data.full_name);
        }
      } catch (err) {
        // If fetching user details fails, use email prefix as name
        localStorage.setItem("user_name", email.split("@")[0]);
      }

      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error("Login error:", err);
      let errorMsg = "Login failed. Please check your credentials.";

      if (err?.response?.data) {
        if (typeof err.response.data === "string") {
          errorMsg = err.response.data;
        } else if (err.response.data.detail) {
          if (typeof err.response.data.detail === "string") {
            errorMsg = err.response.data.detail;
          } else {
            errorMsg = JSON.stringify(err.response.data.detail);
          }
        } else {
          errorMsg = JSON.stringify(err.response.data);
        }
      } else if (err?.message) {
        errorMsg = err.message;
      }

      alert(errorMsg);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Form */}
      <div className="flex w-full items-center justify-center bg-gray-50 lg:w-1/2">
        <div className="w-full max-w-md px-8">
          <div className="mb-8" style={{ height: "7rem" }}>
            <img
              src="/reconflow-logo.png"
              alt="ReconFlow"
              className="object-contain"
              style={{ height: "7rem" }}
            />
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-navy-900">
              Welcome to ReconFlow
            </h1>
            <p className="mt-2 text-gray-600">
              Start your experience with ReconFlow by signing in or signing up.
            </p>
          </div>

          <div className="mb-6 flex gap-3">
            <button className="flex-1 rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white">
              Sign In
            </button>
            <Link
              href="/register"
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Sign Up
            </Link>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                </div>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Password *
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-10 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-teal-600 py-3 font-semibold text-white hover:bg-teal-700"
            >
              Sign In
            </button>
          </form>

          <div className="my-6 text-center text-sm text-gray-500">
            Or continue with
          </div>

          <div className="flex justify-center gap-4">
            <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Right Side - Financial Dashboard Preview */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 p-12 relative overflow-hidden">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 w-full max-w-lg space-y-6">
          {/* Financial Plan Card */}
          <div className="bg-white rounded-2xl p-6 shadow-2xl transform rotate-[-2deg] hover:rotate-0 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700">
                Financial Plan
              </h3>
              <span className="text-xs text-gray-500">This Month</span>
            </div>
            <div className="flex items-center gap-4 mb-4">
              {/* Donut Chart */}
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    fill="none"
                    stroke="#0d9488"
                    strokeWidth="8"
                    strokeDasharray="140 200"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="8"
                    strokeDasharray="60 200"
                    strokeDashoffset="-140"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  $2,005.45
                </div>
                <div className="text-xs text-gray-500">Available</div>
              </div>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-teal-600"></div>
                <span className="text-gray-600">Budgeted Expenses</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <span className="text-gray-600">Additional Spending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                <span className="text-gray-600">In Stock</span>
              </div>
            </div>
          </div>

          {/* Capital Allocations Card */}
          <div className="bg-white rounded-2xl p-6 shadow-2xl transform rotate-[1deg] hover:rotate-0 transition-transform">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">
                Capital Allocations
              </h3>
              <span className="text-xs text-teal-600">3 Upcoming</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-4">
              $17,366.00
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">iPhone 16 Pro Max</span>
                <span className="font-semibold text-gray-900">$1,200</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Qatar Air Conditioner</span>
                <span className="font-semibold text-gray-900">$850</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tax Advisor RYM Blue</span>
                <span className="font-semibold text-gray-900">$1,600</span>
              </div>
            </div>
            <button className="w-full mt-4 bg-gray-900 text-white py-2 rounded-lg text-sm font-semibold hover:bg-gray-800">
              Review Investment
            </button>
          </div>

          {/* Bucket List Trip Card */}
          <div className="bg-white rounded-2xl p-5 shadow-2xl transform rotate-[-1deg] hover:rotate-0 transition-transform">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700">
                Bucket List Trip
              </h3>
              <span className="text-xs text-gray-500">Goal - Feb 02, 2025</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              $1900{" "}
              <span className="text-sm font-normal text-gray-400">
                / $4,000
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div
                className="bg-teal-600 h-2 rounded-full"
                style={{ width: "47.5%" }}
              ></div>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Saved to Complete</span>
              <span className="font-semibold text-teal-600">$2,100 (52%)</span>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="text-center mt-12 space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-700 rounded-2xl shadow-lg">
              <svg
                className="w-10 h-10 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white leading-tight">
              A Unified Hub for Smarter
              <br />
              Financial Decision-Making
            </h2>
            <p className="text-teal-100 text-sm max-w-md mx-auto">
              ReconFlow empowers you with a unified financial command
              center—delivering deep insights and a 360° view of your entire
              economic world.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
