import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Breadcrumb from "../components/Breadcrumb";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

interface Invoice {
  id: string;
  invoice_type: string;
  invoice_number: string;
  vendor_name: string | null;
  customer_name: string | null;
  amount: number;
  invoice_date: string;
  due_date: string | null;
  status: string;
}

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [ocrData, setOcrData] = useState<any>(null);
  const [formData, setFormData] = useState({
    invoice_type: "payable",
    invoice_number: "",
    vendor_name: "",
    customer_name: "",
    amount: "",
    invoice_date: "",
    due_date: "",
    status: "pending",
  });

  useEffect(() => {
    loadInvoices();
  }, [filter]);

  function loadInvoices() {
    const token = localStorage.getItem("access_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const params = filter !== "all" ? `?invoice_type=${filter}` : "";
    axios
      .get(`${API_BASE}/api/invoices${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setInvoices(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  async function handleOCRUpload() {
    if (!uploadFile) return;

    const token = localStorage.getItem("access_token");
    const form = new FormData();
    form.append("file", uploadFile);

    try {
      const res = await axios.post(
        `${API_BASE}/api/invoices/upload-ocr`,
        form,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setOcrData(res.data);
      setFormData({
        ...formData,
        invoice_number: res.data.invoice_number || "",
        vendor_name: res.data.vendor_name || "",
        amount: res.data.amount || "",
        invoice_date: res.data.invoice_date || "",
        due_date: res.data.due_date || "",
      });
    } catch (err) {
      alert("OCR extraction failed");
    }
  }

  async function handleCreateInvoice() {
    const token = localStorage.getItem("access_token");
    try {
      await axios.post(`${API_BASE}/api/invoices/`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowUploadModal(false);
      loadInvoices();
      setFormData({
        invoice_type: "payable",
        invoice_number: "",
        vendor_name: "",
        customer_name: "",
        amount: "",
        invoice_date: "",
        due_date: "",
        status: "pending",
      });
      setUploadFile(null);
      setOcrData(null);
    } catch (err) {
      alert("Failed to create invoice");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-6">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Invoices" },
          ]}
        />

        <div className="mt-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-navy-900">Invoices</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowUploadModal(true)}
              className="rounded-lg bg-primary-400 px-5 py-2.5 text-sm font-semibold text-navy-900 hover:bg-primary-500"
            >
              + Upload Invoice
            </button>
            <button
              onClick={() => setFilter("all")}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                filter === "all"
                  ? "bg-primary-500 text-white"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("payable")}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                filter === "payable"
                  ? "bg-primary-500 text-white"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Payable
            </button>
            <button
              onClick={() => setFilter("receivable")}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                filter === "receivable"
                  ? "bg-primary-500 text-white"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Receivable
            </button>
          </div>
        </div>

        {loading ? (
          <div className="mt-4 text-sm text-gray-600">Loading invoices...</div>
        ) : invoices.length === 0 ? (
          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="text-gray-600">
              No invoices found. Upload your first invoice to get started.
            </div>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold tracking-widest text-gray-600">
                    TYPE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold tracking-widest text-gray-600">
                    NUMBER
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold tracking-widest text-gray-600">
                    VENDOR/CUSTOMER
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold tracking-widest text-gray-600">
                    AMOUNT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold tracking-widest text-gray-600">
                    DUE DATE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold tracking-widest text-gray-600">
                    STATUS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{inv.invoice_type}</td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {inv.invoice_number}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {inv.vendor_name || inv.customer_name || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      ${inv.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">{inv.due_date || "-"}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                          inv.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : inv.status === "pending"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Upload Invoice</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-500 hover:text-navy-900"
                >
                  ✕
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Upload File (for OCR extraction)
                  </label>
                  <input
                    type="file"
                    accept=".txt,.pdf,.jpg,.png"
                    className="mt-1 w-full"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  />
                  {uploadFile && (
                    <button
                      onClick={handleOCRUpload}
                      className="mt-2 rounded-lg bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700 hover:bg-primary-200"
                    >
                      Extract Data (OCR)
                    </button>
                  )}
                </div>

                {ocrData && (
                  <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                    ✓ OCR extraction completed. Review and edit fields below.
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Invoice Type</label>
                    <select
                      className="mt-1 w-full rounded-lg border border-slateMS-200 px-3 py-2"
                      value={formData.invoice_type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          invoice_type: e.target.value,
                        })
                      }
                    >
                      <option value="payable">Payable</option>
                      <option value="receivable">Receivable</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      Invoice Number
                    </label>
                    <input
                      className="mt-1 w-full rounded-lg border border-slateMS-200 px-3 py-2"
                      value={formData.invoice_number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          invoice_number: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Vendor Name</label>
                    <input
                      className="mt-1 w-full rounded-lg border border-slateMS-200 px-3 py-2"
                      value={formData.vendor_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vendor_name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Customer Name</label>
                    <input
                      className="mt-1 w-full rounded-lg border border-slateMS-200 px-3 py-2"
                      value={formData.customer_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customer_name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      className="mt-1 w-full rounded-lg border border-slateMS-200 px-3 py-2"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Invoice Date</label>
                    <input
                      type="date"
                      className="mt-1 w-full rounded-lg border border-slateMS-200 px-3 py-2"
                      value={formData.invoice_date}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          invoice_date: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Due Date</label>
                    <input
                      type="date"
                      className="mt-1 w-full rounded-lg border border-slateMS-200 px-3 py-2"
                      value={formData.due_date}
                      onChange={(e) =>
                        setFormData({ ...formData, due_date: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <select
                      className="mt-1 w-full rounded-lg border border-slateMS-200 px-3 py-2"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateInvoice}
                    className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600"
                  >
                    Create Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
