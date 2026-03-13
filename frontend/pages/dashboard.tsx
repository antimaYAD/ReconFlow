import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import Navbar from "../components/Navbar";
import Breadcrumb from "../components/Breadcrumb";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

interface DashboardData {
  total_transactions: number;
  reconciliation: {
    matched: number;
    missing_in_bank: number;
    missing_in_gateway: number;
  };
  expense_breakdown: Array<{ category: string; total: number }>;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    axios
      .get(`${API_BASE}/api/reports/dashboard-summary`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const COLORS = ["#0A1D3A", "#0F2B55", "#4C5B70", "#D8E1EE", "#EEF2F7"];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-6">
        <Breadcrumb items={[{ label: "Dashboard" }]} />
        <h1 className="mt-4 text-3xl font-bold text-navy-900">
          Financial Dashboard
        </h1>

        {loading ? (
          <div className="mt-8 text-slateMS-600">Loading...</div>
        ) : !data ? (
          <div className="mt-8 text-slateMS-600">
            Failed to load dashboard data
          </div>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-gradient-to-br from-primary-400 to-primary-500 p-6 shadow-md">
                <div className="text-sm font-medium text-navy-900">
                  Total Transactions
                </div>
                <div className="mt-2 text-4xl font-bold text-white">
                  {data?.total_transactions || 0}
                </div>
                <div className="mt-2 text-xs text-navy-800">All time</div>
              </div>

              <div className="rounded-xl bg-gradient-to-br from-green-400 to-green-500 p-6 shadow-md">
                <div className="text-sm font-medium text-green-900">
                  Matched Transactions
                </div>
                <div className="mt-2 text-4xl font-bold text-white">
                  {data?.reconciliation.matched || 0}
                </div>
                <div className="mt-2 text-xs text-green-800">
                  Successfully reconciled
                </div>
              </div>

              <div className="rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 p-6 shadow-md">
                <div className="text-sm font-medium text-orange-900">
                  Pending Settlements
                </div>
                <div className="mt-2 text-4xl font-bold text-white">
                  {(data?.reconciliation.missing_in_bank || 0) +
                    (data?.reconciliation.missing_in_gateway || 0)}
                </div>
                <div className="mt-2 text-xs text-orange-800">
                  Requires attention
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-navy-900">
                  Expense Distribution
                </h2>
                {data.expense_breakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={data.expense_breakdown}
                        dataKey="total"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {data.expense_breakdown.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="mt-4 text-sm text-slateMS-600">
                    No expense data yet
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-navy-900">
                    Quick Actions
                  </h2>
                  <Link
                    href="#"
                    className="text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    View all
                  </Link>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Link
                    href="/reconciliation"
                    className="flex flex-col items-center rounded-lg border border-gray-200 p-4 hover:border-primary-400 hover:bg-primary-50"
                  >
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
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    <div className="mt-2 text-center text-sm font-medium text-navy-900">
                      Reconciliation
                    </div>
                  </Link>
                  <Link
                    href="/invoices"
                    className="flex flex-col items-center rounded-lg border border-gray-200 p-4 hover:border-primary-400 hover:bg-primary-50"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                      <svg
                        className="h-6 w-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div className="mt-2 text-center text-sm font-medium text-navy-900">
                      Invoices
                    </div>
                  </Link>
                  <Link
                    href="/expenses"
                    className="flex flex-col items-center rounded-lg border border-gray-200 p-4 hover:border-primary-400 hover:bg-primary-50"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <svg
                        className="h-6 w-6 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="mt-2 text-center text-sm font-medium text-navy-900">
                      Expenses
                    </div>
                  </Link>
                  <Link
                    href="#"
                    className="flex flex-col items-center rounded-lg border border-gray-200 p-4 hover:border-primary-400 hover:bg-primary-50"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                      <svg
                        className="h-6 w-6 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <div className="mt-2 text-center text-sm font-medium text-navy-900">
                      Reports
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
