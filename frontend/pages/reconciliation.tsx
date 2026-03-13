import { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Breadcrumb from "../components/Breadcrumb";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function Reconciliation() {
  const [bank, setBank] = useState<File | null>(null);
  const [gateway, setGateway] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setError(null);
    setResult(null);

    if (!bank || !gateway) {
      setError("Please select both CSV files");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Please login first");
      return;
    }

    const form = new FormData();
    form.append("bank_csv", bank);
    form.append("gateway_csv", gateway);

    try {
      const res = await axios.post(`${API_BASE}/api/reconciliation/run`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResult(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to run reconciliation");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-4xl px-6 py-10">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Reconciliation" },
          ]}
        />

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-navy-900">Reconciliation</h1>

          {/* Timeline Layout */}
          <div className="mt-8 space-y-6">
            {/* Step 1: Bank CSV */}
            <div className="relative flex gap-6">
              {/* Timeline indicator */}
              <div className="flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-500 text-white font-bold text-lg shadow-md">
                  1
                </div>
                <div className="w-0.5 flex-1 bg-primary-200 mt-2"></div>
              </div>

              {/* Content */}
              <div className="flex-1 pb-8">
                <div className="rounded-xl bg-green-50 border-2 border-green-200 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <svg
                      className="h-8 w-8 text-green-600"
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
                    <h3 className="text-2xl font-bold text-green-700">
                      Bank CSV
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Upload your bank statement CSV file
                  </p>
                  <input
                    type="file"
                    accept=".csv"
                    className="block w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    onChange={(e) => setBank(e.target.files?.[0] || null)}
                  />
                  {bank && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-green-700">
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="font-medium">{bank.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2: Gateway CSV */}
            <div className="relative flex gap-6">
              {/* Timeline indicator */}
              <div className="flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-500 text-white font-bold text-lg shadow-md">
                  2
                </div>
                <div className="w-0.5 flex-1 bg-primary-200 mt-2"></div>
              </div>

              {/* Content */}
              <div className="flex-1 pb-8">
                <div className="rounded-xl bg-green-50 border-2 border-green-200 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <svg
                      className="h-8 w-8 text-green-600"
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
                    <h3 className="text-2xl font-bold text-green-700">
                      Gateway CSV
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Upload your payment gateway CSV file
                  </p>
                  <input
                    type="file"
                    accept=".csv"
                    className="block w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    onChange={(e) => setGateway(e.target.files?.[0] || null)}
                  />
                  {gateway && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-green-700">
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="font-medium">{gateway.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Step 3: Run Reconciliation */}
            <div className="relative flex gap-6">
              {/* Timeline indicator */}
              <div className="flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-500 text-white font-bold text-lg shadow-md">
                  3
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                {error && (
                  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
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
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {error}
                  </div>
                )}

                <button
                  className="w-full rounded-xl bg-primary-500 px-6 py-4 font-bold text-lg text-white shadow-lg hover:bg-primary-600 transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  onClick={run}
                  disabled={!bank || !gateway}
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                  Run Reconciliation
                </button>
              </div>
            </div>
          </div>

          {result ? (
            <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="text-sm font-semibold">Summary</div>
              <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-white p-3 border border-gray-200">
                  Matched: {result.summary.matched}
                </div>
                <div className="rounded-lg bg-white p-3 border border-gray-200">
                  Missing in bank: {result.summary.missing_in_bank}
                </div>
                <div className="rounded-lg bg-white p-3 border border-slateMS-200">
                  Missing in gateway: {result.summary.missing_in_gateway}
                </div>
                <div className="rounded-lg bg-white p-3 border border-slateMS-200">
                  Amount mismatch: {result.summary.amount_mismatch}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
