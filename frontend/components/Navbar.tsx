import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";

export default function Navbar() {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const email = localStorage.getItem("user_email") || "user@example.com";
    const name = localStorage.getItem("user_name") || email.split("@")[0];
    setUserEmail(email);
    setUserName(name);

    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_name");
    router.push("/login");
  }

  return (
    <div className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <img
            src="/reconflow-logo.png"
            alt="ReconFlow"
            className="object-contain"
            style={{ height: "7rem" }}
          />
        </Link>

        <div className="flex items-center gap-8">
          <nav className="flex gap-6 text-sm font-medium">
            <Link
              href="/dashboard"
              className={`hover:text-primary-600 ${
                router.pathname === "/dashboard"
                  ? "text-primary-600"
                  : "text-gray-700"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/reconciliation"
              className={`hover:text-primary-600 ${
                router.pathname === "/reconciliation"
                  ? "text-primary-600"
                  : "text-gray-700"
              }`}
            >
              Reconciliation
            </Link>
            <Link
              href="/invoices"
              className={`hover:text-primary-600 ${
                router.pathname === "/invoices"
                  ? "text-primary-600"
                  : "text-gray-700"
              }`}
            >
              Invoices
            </Link>
            <Link
              href="/expenses"
              className={`hover:text-primary-600 ${
                router.pathname === "/expenses"
                  ? "text-primary-600"
                  : "text-gray-700"
              }`}
            >
              Expenses
            </Link>
          </nav>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 rounded-full bg-primary-400 px-5 py-2 text-sm font-semibold text-navy-900 hover:bg-primary-500"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              {userName}
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-gray-200 bg-white shadow-lg">
                <div className="border-b border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                      <svg
                        className="h-6 w-6 text-primary-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-navy-900">
                        {userName}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {userEmail}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
