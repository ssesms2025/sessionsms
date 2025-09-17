"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { Bell } from "lucide-react";

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
  };
};

export default function WardenHostelPage() {
  const { data: session } = useSession();
  const [submissions, setSubmissions] = useState<HostelSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComplaints, setShowComplaints] = useState(false);

  // Map of refs for each row
  const rowRefs = useRef<{ [key: number]: HTMLTableRowElement | null }>({});

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

  const handleSubmit = async (id: number) => {
    try {
      await axios.put(`/api/hostel/${id}`, { submit: true });
      toast.success("Submission approved");
      fetchSubmissions();
    } catch {
      toast.error("Failed to approve");
    }
  };

  // Fresh complaints = submissions not yet approved
  const freshComplaints = submissions.filter((s) => !s.submit);

  // Scroll to table row when clicking notification
  const handleNotificationClick = (id: number) => {
    setShowComplaints(false);
    const row = rowRefs.current[id];
    if (row) {
      row.scrollIntoView({ behavior: "smooth", block: "center" });
      row.classList.add("bg-yellow-100"); // Highlight
      setTimeout(() => row.classList.remove("bg-yellow-100"), 2000);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50 relative">
      {/* Header with Notification */}
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
                    <li
                      key={c.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleNotificationClick(c.id)}
                    >
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

      {/* Existing Table */}
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
              {submissions.map((s) => (
                <tr
                  key={s.id}
                  ref={(el) => {
                    rowRefs.current[s.id] = el; // ✅ just assign, don't return anything
                  }}
                  className="border-t bg-white hover:bg-orange-50 transition"
                >

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
                        onClick={() => handleSubmit(s.id)}
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
