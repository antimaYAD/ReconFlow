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
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4 lg:p-8">
      {/* Main Card Container */}
      <div className="bg-white rounded-[32px] shadow-2xl max-w-7xl w-full overflow-hidden flex flex-col lg:flex-row">
        {/* Left Side - Login Form */}
        <div className="flex w-full lg:w-1/2 items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="mb-16">
              <img
                src="/reconflow-logo.png"
                alt="ReconFlow"
                className="object-contain"
                style={{ height: "2rem" }}
              />
            </div>

            {/* Welcome Text */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Welcome to ReconFlow
              </h1>
              <p className="text-sm text-gray-500">
                Start your experience with ReconFlow by signing in or signing
                up.
              </p>
            </div>

            {/* Sign In / Sign Up Tabs */}
            <div className="mb-8 flex gap-3 bg-gray-100 p-1.5 rounded-xl">
              <button className="flex-1 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-sm">
                Sign In
              </button>
              <Link
                href="/register"
                className="flex-1 rounded-lg px-4 py-3 text-center text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign Up
              </Link>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
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
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="w-full rounded-xl border border-gray-300 bg-white py-3.5 pl-12 pr-4 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
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
                    className="w-full rounded-xl border border-gray-300 bg-white py-3.5 pl-12 pr-12 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4"
                  >
                    <svg
                      className="h-5 w-5 text-gray-400 hover:text-gray-600"
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
                className="w-full rounded-xl bg-teal-600 py-3.5 font-semibold text-sm text-white hover:bg-teal-700 transition-colors shadow-sm"
              >
                Sign In
              </button>
            </form>

            {/* Social Login */}
            <div className="mt-8">
              <div className="text-center text-sm text-gray-500 mb-5">
                Or continue with
              </div>
              <div className="flex justify-center gap-4">
                <button className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors">
                  <svg className="h-6 w-6" viewBox="0 0 24 24">
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
                <button className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors">
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                </button>
                <button className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors">
                  <svg className="h-6 w-6" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>
                <button className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors">
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-16 text-center text-xs text-gray-400">
              <p>Copyright · ReconFlow. All Right Reserved</p>
              <div className="mt-2 flex justify-center gap-4">
                <a href="#" className="text-teal-500 hover:text-teal-600">
                  Term & Condition
                </a>
                <span className="text-gray-300">|</span>
                <a href="#" className="text-teal-500 hover:text-teal-600">
                  Privacy & Policy
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Financial Dashboard Preview - EXACT MATCH */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gradient-to-br from-[#4a7c7e] via-[#3d6b6d] to-[#2f5a5c] p-12 relative overflow-hidden rounded-r-[32px]">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-white rounded-full blur-[100px]"></div>
            <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-white rounded-full blur-[100px]"></div>
          </div>

          <div className="relative z-10 w-full max-w-[480px] space-y-5">
            {/* Financial Plan Card */}
            <div className="bg-white rounded-[20px] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.3)] transform rotate-[-3deg] hover:rotate-0 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[13px] font-bold text-gray-800">
                  Financial Plan
                </h3>
                <span className="text-[11px] text-gray-500">This Month</span>
              </div>
              <div className="flex items-start gap-3 mb-3">
                {/* Donut Chart */}
                <div className="relative w-[70px] h-[70px] flex-shrink-0">
                  <svg className="w-[70px] h-[70px] transform -rotate-90">
                    <circle
                      cx="35"
                      cy="35"
                      r="28"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="10"
                    />
                    <circle
                      cx="35"
                      cy="35"
                      r="28"
                      fill="none"
                      stroke="#14b8a6"
                      strokeWidth="10"
                      strokeDasharray="110 176"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="35"
                      cy="35"
                      r="28"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="10"
                      strokeDasharray="50 176"
                      strokeDashoffset="-110"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-[26px] font-bold text-gray-900 leading-tight">
                    $2,005.45
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    Available
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                      <span className="text-gray-600">Budgeted Expenses</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      <span className="text-gray-600">Additional Spending</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                      <span className="text-gray-600">In Stock</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-3 mt-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-600 font-medium">
                    Anticipated Costs
                  </span>
                  <span className="text-gray-500">Future Funds</span>
                </div>
                <div className="flex items-center justify-between text-[11px] mt-1">
                  <span className="text-gray-800 font-semibold">
                    Samsung Tv
                  </span>
                  <span className="text-gray-800 font-semibold">$900</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-500 mt-0.5">
                  <span>Low-Utility</span>
                  <span>$1,200</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-teal-500 h-1.5 rounded-full"
                    style={{ width: "75%" }}
                  ></div>
                </div>
                <button className="w-full mt-3 bg-gray-900 text-white py-2 rounded-lg text-[11px] font-semibold hover:bg-gray-800 transition-colors">
                  Expand All Trips
                </button>
              </div>
            </div>

            {/* Capital Allocations Card */}
            <div className="bg-white rounded-[20px] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.3)] transform rotate-[2deg] hover:rotate-0 transition-all duration-300 ml-8">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[13px] font-bold text-gray-800">
                  Capital Allocations
                </h3>
                <span className="text-[11px] text-teal-600 font-medium">
                  3 Upcoming
                </span>
              </div>
              <div className="text-[32px] font-bold text-gray-900 leading-none mb-3">
                $17,366.00
              </div>
              <div className="space-y-2.5 text-[11px]">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-gray-800 font-medium">
                      iPhone 16 Pro Max
                    </div>
                    <div className="text-gray-500 text-[10px]">
                      Apple - 01 Items
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-900 font-bold">$1,200</div>
                    <div className="text-gray-500 text-[10px]">+15%</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-gray-800 font-medium">
                      Qatar Air Conditioner
                    </div>
                    <div className="text-gray-500 text-[10px]">
                      Qatar - 02 Items
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-900 font-bold">$850</div>
                    <div className="text-gray-500 text-[10px]">+8%</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-gray-800 font-medium">
                      Tax Advisor RYM Blue
                    </div>
                    <div className="text-gray-500 text-[10px]">
                      Tax - 01 Items
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-900 font-bold">$1,600</div>
                    <div className="text-gray-500 text-[10px]">+12%</div>
                  </div>
                </div>
              </div>
              <button className="w-full mt-4 bg-gray-900 text-white py-2.5 rounded-lg text-[11px] font-semibold hover:bg-gray-800 transition-colors">
                Review Investment
              </button>
            </div>

            {/* Bucket List Trip Card */}
            <div className="bg-white rounded-[20px] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.3)] transform rotate-[-2deg] hover:rotate-0 transition-all duration-300 mr-8">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[13px] font-bold text-gray-800">
                  Bucket List Trip
                </h3>
                <span className="text-[10px] text-gray-500">
                  Goal - Feb 02, 2025
                </span>
              </div>
              <div className="text-[28px] font-bold text-gray-900 leading-none mb-1">
                $1900{" "}
                <span className="text-[14px] font-normal text-gray-400">
                  / $4,000
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2.5">
                <div
                  className="bg-teal-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: "47.5%" }}
                ></div>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-500">Saved to Complete</span>
                <span className="font-bold text-teal-600">$2,100 (52%)</span>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="text-center mt-16 space-y-5 px-4">
              <div className="inline-flex items-center justify-center w-[72px] h-[72px] bg-teal-700/80 rounded-[18px] shadow-xl backdrop-blur-sm">
                <svg
                  className="w-11 h-11 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                </svg>
              </div>
              <h2 className="text-[32px] font-bold text-white leading-[1.2]">
                A Unified Hub for Smarter
                <br />
                Financial Decision-Making
              </h2>
              <p className="text-teal-100/90 text-[13px] max-w-[420px] mx-auto leading-relaxed">
                ReconFlow empowers you with a unified financial command
                center—delivering deep insights and a 360° view of your entire
                economic world.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
