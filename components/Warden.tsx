"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { Bell, QrCode, X } from "lucide-react";

const QrReader = dynamic(() => import("react-qr-reader"), { ssr: false });

type HostelSubmission = {
  id: number;
  reason: string;
  village: string;
  photo: string;
  submit: boolean;
  returned: boolean;
  createdAt: string;
  approvedby?: string | null;
  hostel: {
    name: string;
    email: string;
    department: string;
  };
};

export default function WardenHostelPage() {
  const { data: session } = useSession();
  const [submissions, setSubmissions] = useState<HostelSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  /** QR Scanner */
  const [scanning, setScanning] = useState(false);
  const [scannedStudent, setScannedStudent] = useState<HostelSubmission[]>([]);

  /** Filters */
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  /** Fetch Submissions */
  const fetchSubmissions = async () => {
    try {
      const res = await axios.get("/api/hostel/create");
      setSubmissions(res.data);
    } catch {
      toast.error("Failed to fetch hostel submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  /** Approve submission */
  const handleApprove = async (id: number) => {
    try {
      await axios.put(`/api/hostel/${id}`, { submit: true });
      
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, submit: true, approvedby: session?.user?.name || "You" } : s
        )
      );

      setScannedStudent((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, submit: true, approvedby: session?.user?.name || "You" } : s
        )
      );
      toast.success("Approved!");
      fetchSubmissions();
    } catch {
      toast.error("Failed to approve");
    }
  };

  /** Filter Logic */
  const isInRange = (dateStr: string) => {
    const d = new Date(dateStr);
    if (!startDate && !endDate) return true;
    if (startDate && !endDate) return d >= new Date(startDate);
    if (!startDate && endDate) return d <= new Date(endDate);
    return d >= new Date(startDate) && d <= new Date(endDate);
  };

  const filteredSubmissions = submissions.filter(
    (s) =>
      (!search || s.hostel.name.toLowerCase().includes(search.toLowerCase())) &&
      (!department || s.hostel.department === department) &&
      (!reason || s.reason.toLowerCase().includes(reason.toLowerCase())) &&
      isInRange(s.createdAt)
  );

  const toggleScanner = () => setScanning((prev) => !prev);

  /** Fresh complaints for notification bell */
  const freshComplaints = submissions.filter((s) => !s.submit);
  const [showComplaints, setShowComplaints] = useState(false);

  return (
    <div className="p-6 min-h-screen bg-gray-50 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-orange-600">Hostel Submissions</h1>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowComplaints(!showComplaints)}
            className="relative text-gray-600 hover:text-gray-800"
          >
            <Bell size={28} />
            {freshComplaints.length > 0 && (
              <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full px-1.5">
                {freshComplaints.length}
              </span>
            )}
          </button>

          {showComplaints && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-auto">
              <div className="p-3 border-b border-gray-200 font-semibold">
                Fresh Complaints ({freshComplaints.length})
              </div>
              {freshComplaints.length === 0 ? (
                <p className="p-3 text-gray-500 text-sm">No new complaints</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {freshComplaints.map((c) => (
                    <li key={c.id} className="p-3 hover:bg-gray-50 cursor-pointer">
                      <p className="font-medium text-gray-800">{c.reason}</p>
                      <p className="text-xs text-gray-500">
                        {c.hostel.name} | {new Date(c.createdAt).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 items-center mb-4 overflow-x-auto whitespace-nowrap">
        <input
          type="text"
          placeholder="Search Student..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-shrink-0 px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500"
        />
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="flex-shrink-0 px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500"
        >
          <option value="">Department</option>
          <option value="CSE">CSE</option>
          <option value="ECE">ECE</option>
          <option value="EEE">EEE</option>
          <option value="MECH">MECH</option>
          <option value="CIVIL">CIVIL</option>
        </select>
        <input
          type="text"
          placeholder="Search Reason..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="flex-shrink-0 px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500"
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="flex-shrink-0 px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="flex-shrink-0 px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500"
        />
        <button
          onClick={() => {
            setSearch("");
            setDepartment("");
            setReason("");
            setStartDate("");
            setEndDate("");
          }}
          className="flex-shrink-0 px-3 py-2 bg-orange-200 hover:bg-orange-400 rounded-md"
        >
          Reset
        </button>
      </div>

      {/* QR Scanner */}
      <div className="mb-4">
        <button
          onClick={toggleScanner}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            scanning ? "bg-red-600 text-white" : "bg-orange-500 text-white"
          }`}
        >
          {scanning ? <X /> : <QrCode />} {scanning ? "Close Scanner" : "Scan Student"}
        </button>

        {scanning && (
          <div className="w-full h-80 border rounded-lg overflow-hidden mt-2">
            <QrReader
              delay={100}
              onError={(err) => console.error(err)}
              onScan={(data) => {
                if (data) {
                  const studentSubmissions = submissions.filter(
                    (s) => s.hostel.email === data
                  );
                  if (studentSubmissions.length) {
                    setScannedStudent(studentSubmissions);
                    setScanning(false);
                    toast.success("Student data fetched!");
                  } else {
                    toast.error("No student found");
                  }
                }
              }}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        )}

        {scannedStudent.length > 0 && (
          <div className="mt-4 p-4 border rounded-lg bg-white shadow-lg">
            <h3 className="font-semibold text-lg text-orange-600">
              Scanned Student Submissions
            </h3>
            {scannedStudent.map((s) => (
              <div
                key={s.id}
                className="flex justify-between items-center border-b py-2"
              >
                <div>
                  <p>
                    <strong>Reason:</strong> {s.reason}
                  </p>
                  <p>
                    <strong>Village:</strong> {s.village}
                  </p>
                </div>
                {!s.submit && (
                  <button
                    onClick={() => handleApprove(s.id)}
                    className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600"
                  >
                    Approve
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto border border-orange-300 rounded-lg">
          <table className="w-full text-left text-gray-700">
            <thead className="bg-orange-100 text-orange-600 text-sm uppercase">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Reason</th>
                <th className="px-4 py-2">Village</th>
                <th className="px-4 py-2">Photo</th>
                <th className="px-4 py-2">Submit</th>
                <th className="px-4 py-2">Approved By</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((s) => (
                <tr key={s.id} className="border-t bg-white hover:bg-orange-50 transition">
                  <td className="px-4 py-2">{s.hostel.name}</td>
                  <td className="px-4 py-2">{s.hostel.email}</td>
                  <td className="px-4 py-2">{s.reason}</td>
                  <td className="px-4 py-2">{s.village}</td>
                  <td className="px-4 py-2">
                    <img
                      src={s.photo}
                      alt="photo"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </td>
                  <td className="px-4 py-2">
                    {s.submit ? (
                      <span className="text-green-600 font-semibold">Submitted</span>
                    ) : (
                      <button
                        onClick={() => handleApprove(s.id)}
                        className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600"
                      >
                        Approve
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {s.approvedby ? (
                      <span className="text-blue-600">{s.approvedby}</span>
                    ) : (
                      <span className="text-gray-400 italic">Pending</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}