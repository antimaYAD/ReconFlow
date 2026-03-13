import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Breadcrumb from "../components/Breadcrumb";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  auto_categorized: boolean;
}

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    category: "Office Supplies",
  });

  useEffect(() => {
    loadExpenses();
  }, []);

  function loadExpenses() {
    const token = localStorage.getItem("access_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    axios
      .get(`${API_BASE}/api/expenses`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setExpenses(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  function exportCSV() {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    axios
      .get(`${API_BASE}/api/reports/expenses/export-csv`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      })
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "expenses.csv");
        document.body.appendChild(link);
        link.click();
        link.remove();
      });
  }

  async function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      await axios.post(
        `${API_BASE}/api/expenses`,
        {
          description: formData.description,
          amount: parseFloat(formData.amount),
          date: formData.date,
          category: formData.category,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setShowModal(false);
      setFormData({
        description: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        category: "Office Supplies",
      });
      loadExpenses();
      alert("Expense added successfully!");
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Failed to add expense");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-6">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Expenses" },
          ]}
        />

        <div className="mt-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-navy-900">Expenses</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 rounded-lg bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 shadow-md"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Expense
            </button>
            <button
              onClick={exportCSV}
              className="rounded-lg bg-primary-400 px-5 py-2.5 text-sm font-semibold text-navy-900 hover:bg-primary-500"
            >
              Export CSV
            </button>
          </div>
        </div>

        {loading ? (
          <div className="mt-4 text-sm text-gray-600">Loading expenses...</div>
        ) : expenses.length === 0 ? (
          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="text-gray-600">
              No expenses found. Add your first expense to get started.
            </div>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-2xl border border-slateMS-200 bg-white shadow-sm">
            <table className="w-full">
              <thead className="border-b border-slateMS-200 bg-slateMS-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold tracking-widest text-slateMS-600">
                    DATE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold tracking-widest text-slateMS-600">
                    DESCRIPTION
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold tracking-widest text-slateMS-600">
                    CATEGORY
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold tracking-widest text-slateMS-600">
                    AMOUNT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold tracking-widest text-slateMS-600">
                    AUTO
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slateMS-200">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slateMS-50">
                    <td className="px-6 py-4 text-sm">{exp.date}</td>
                    <td className="px-6 py-4 text-sm">{exp.description}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block rounded-full bg-navy-900 px-3 py-1 text-xs font-medium text-white">
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      ${exp.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {exp.auto_categorized ? "✓" : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-navy-900">
                Add New Expense
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Office supplies purchase"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pl-8 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="Travel">Travel</option>
                  <option value="Meals">Meals</option>
                  <option value="Software">Software</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Rent">Rent</option>
                  <option value="Salaries">Salaries</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-600"
                >
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
