"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { QrCode, X, Trash } from "lucide-react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

const QrReader = dynamic(() => import("react-qr-reader"), { ssr: false });

// Interfaces
interface Complaint {
  id: string;
  photo: string;
  reason: string;
  createdAt: string;
  approvedBy: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  department: string;
  complaintsAsStudent: Complaint[];
}

interface HostelSubmission {
  id: number;
  submit: boolean;
  returned: boolean;
  number: string;
  photo: string;
  approvedby?: string | null;
  comeoutTime: string | null;
  comeinTime: string | null;
  hostel: {
    name: string;
    email: string;
  };
}

export default function AdminHostelPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"users" | "hostel">("users");
  const [scannedStudent, setScannedStudent] = useState<User | null>(null);

  /*** USERS PAGE STATES ***/
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [scanning, setScanning] = useState(false);
  const [department, setDepartment] = useState("");
  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  /*** HOSTEL PAGE STATES ***/
  const [submissions, setSubmissions] = useState<HostelSubmission[]>([]);
  const [loadingHostel, setLoadingHostel] = useState(true);
  const [filterSubmit, setFilterSubmit] = useState<boolean | "all">("all");

  /*** FETCH USERS ***/
  useEffect(() => {
    if (activeTab !== "users") return;
    if (!session) return;

    const token = session?.user?.id;

    fetch(`/api/admin/users?email=${search}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Error:", err));
  }, [search, activeTab, session]);

  /*** FETCH HOSTEL SUBMISSIONS ***/
  const fetchSubmissions = async () => {
    try {
      const res = await fetch("/api/hostel/create");
      const data: HostelSubmission[] = await res.json();
      setSubmissions(data);
    } catch (err) {
      toast.error("Failed to fetch hostel submissions.");
      setSubmissions([]);
    } finally {
      setLoadingHostel(false);
    }
  };

  useEffect(() => {
    if (activeTab !== "hostel") return;
    fetchSubmissions();
  }, [activeTab]);

  /*** USER FILTERS ***/
  const isInRange = (dateStr: string) => {
    const d = new Date(dateStr);

    if (!startDate && !endDate) return true;

    if (startDate && !endDate) {
      const start = new Date(startDate);
      return (
        d.getFullYear() === start.getFullYear() &&
        d.getMonth() === start.getMonth() &&
        d.getDate() === start.getDate()
      );
    }

    if (!startDate && endDate) {
      const end = new Date(endDate);
      return (
        d.getFullYear() === end.getFullYear() &&
        d.getMonth() === end.getMonth() &&
        d.getDate() === end.getDate()
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    return d >= start && d <= end;
  };

  const filteredUsers = users.filter((u) => {
    let ok = true;
    if (department && u.department !== department) ok = false;
    if (reason && !u.complaintsAsStudent.some((c) => c.reason === reason))
      ok = false;
    if (
      (startDate || endDate) &&
      !u.complaintsAsStudent.some((c) => isInRange(c.createdAt))
    )
      ok = false;
    return ok;
  });

  /*** HOSTEL FILTER ***/
  const filteredSubmissions = submissions.filter((s) =>
    filterSubmit === "all" ? true : s.submit === filterSubmit
  );

  /*** DELETE COMPLAINT HANDLER ***/
  const handleDeleteComplaint = async (userId: string, complaintId: string) => {
    try {
      const res = await fetch(`/api/complaint/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaintId }),
      });

      if (!res.ok) {
        toast.error("Failed to delete complaint");
        return;
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                complaintsAsStudent: u.complaintsAsStudent.filter(
                  (c) => c.id !== complaintId
                ),
              }
            : u
        )
      );

      toast.success("Complaint deleted");
    } catch (err) {
      console.error("Error deleting complaint:", err);
      toast.error("Error deleting complaint");
    }
  };

  /*** TOGGLE SCANNER ***/
  const toggleScanner = () => setScanning((prev) => !prev);


  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      {/* Tabs */}
      <div className="flex justify-center gap-4">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "users"
              ? "bg-purple-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setActiveTab("users")}
        >
          Admin Users
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "hostel"
              ? "bg-orange-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setActiveTab("hostel")}
        >
          Hostel Submissions
        </button>
      </div>

      {activeTab === "users" && (
        <>
          <h1 className="text-2xl sm:text-3xl font-bold text-center bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
            SSE – Admin Dashboard
          </h1>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 snap-x items-center">
            <input
              type="text"
              placeholder="🔍 Roll No..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-shrink-0 w-44 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 snap-start"
            />
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="flex-shrink-0 px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500 snap-start"
            >
              <option value="">Dept</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="MECH">MECH</option>
              <option value="CIVIL">CIVIL</option>
            </select>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="flex-shrink-0 px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500 snap-start"
            >
              <option value="">Reason</option>
              <option value="Late">Late</option>
              <option value="Beard">Beard</option>
              <option value="Shoes">Shoes</option>
              <option value="Dress-Code">Dress Code</option>
              <option value="Others">Others</option>
            </select>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-shrink-0 px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500 snap-start"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-shrink-0 px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500 snap-start"
            />
            <button
              onClick={() => {
                setSearch("");
                setDepartment("");
                setReason("");
                setStartDate("");
                setEndDate("");
              }}
              className="px-3 py-2 bg-purple-200 hover:bg-purple-400 rounded-md text-sm"
            >
              Reset
            </button>
          </div>

          {/* QR Scanner */}
          <div
            className={`rounded-xl border p-4 mt-4 ${
              scanning ? "border-purple-500" : "border-gray-200"
            } bg-white shadow-sm`}
          >
            <h2 className="font-semibold text-purple-700 mb-2 text-sm sm:text-base">
              Attendance QR Scanner
            </h2>
            <button
              onClick={toggleScanner}
              className={`flex items-center justify-center w-full px-4 py-2 rounded-lg gap-2 text-sm ${
                scanning ? "bg-red-600 text-white" : "bg-purple-600 text-white"
              }`}
            >
              {scanning ? <X size={20} /> : <QrCode size={20} />}{" "}
              {scanning ? "Close Scanner" : "Open Scanner"}
            </button>

            {scanning && (
              <div className="w-full h-80 border rounded-lg overflow-hidden mt-2">
                <QrReader
                  delay={100}
                  onError={(err) => console.error(err)}
                  onScan={async (data) => {
                    if (data) {
                      try {
                        const token = session?.user?.id;
                        const res = await fetch(
                          `/api/admin/users?email=${encodeURIComponent(data)}`,
                          { headers: { Authorization: `Bearer ${token}` } }
                        );

                        if (!res.ok) {
                          toast.error("Failed to fetch student details");
                          return;
                        }

                        const result = await res.json();
                        const student = Array.isArray(result)
                          ? result[0]
                          : result;

                        if (student) {
                          setScannedStudent(student);
                          toast.success("Student data fetched!");
                          
                          setScanning(false);
                        } else {
                          toast.error("No student found");
                        }
                      } catch (err) {
                        console.error("Error fetching scanned student:", err);
                        toast.error("Error fetching data");
                      }
                    }
                  }}
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
            )}

            {scannedStudent && (
              <div className="mt-4 p-4 border rounded-lg bg-gray-50 shadow-lg">
                <h3 className="font-semibold text-lg text-purple-700">
                  Scanned Student
                </h3>
                <p>
                  <strong>Name:</strong> {scannedStudent.name}
                </p>
                <p>
                  <strong>Email:</strong> {scannedStudent.email}
                </p>
                <p>
                  <strong>Department:</strong> {scannedStudent.department}
                </p>

                <h4 className="mt-2 font-medium">Complaints:</h4>
                {scannedStudent.complaintsAsStudent.length > 0 ? (
                  <ul className="list-disc ml-5">
                    {scannedStudent.complaintsAsStudent.map((c) => (
                      <li key={c.id}>
                        {c.reason} (
                        {new Date(c.createdAt).toLocaleDateString()})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-gray-500">No complaints 🎉</span>
                )}
              </div>
            )}
          </div>

          {/* Users Table */}
          <div className="border rounded-lg shadow p-4 bg-white overflow-x-auto mt-4">
            <h2 className="text-lg font-semibold mb-3">Users & Complaints</h2>
            <table className="min-w-full border rounded-lg table-auto">
              <thead className="bg-purple-600 text-white">
                <tr>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2 text-left">Department</th>
                  <th className="p-2 text-left">Complaints</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b hover:bg-gray-50 odd:bg-white even:bg-gray-50">
                    <td className="p-2">{u.name}</td>
                    <td className="p-2 break-words">{u.email}</td>
                    <td className="p-2">{u.department}</td>
                    <td className="p-2">
                      <ul className="list-disc ml-5 space-y-1">
                        {u.complaintsAsStudent
                          .filter((c) => isInRange(c.createdAt))
                          .map((c) => (
                            <li key={c.id} className="flex items-center gap-2">
                              <span className="font-medium">{c.reason}</span>
                              ({new Date(c.createdAt).toLocaleDateString()})
                              <button
                                onClick={() => handleDeleteComplaint(u.id, c.id)}
                                className="text-red-600 hover:text-red-800 ml-2"
                              >
                                <Trash size={16} />
                              </button>
                            </li>
                          ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === "hostel" && (
        <div className="space-y-4">
          <div className="flex gap-2 items-center">
            <span>Filter by Submitted:</span>
            <select
              value={filterSubmit.toString()}
              onChange={(e) =>
                setFilterSubmit(
                  e.target.value === "all"
                    ? "all"
                    : e.target.value === "true"
                    ? true
                    : false
                )
              }
              className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All</option>
              <option value="true">Submitted</option>
              <option value="false">Not Submitted</option>
            </select>
          </div>

          {loadingHostel ? (
            <p>Loading hostel submissions...</p>
          ) : (
            <div className="overflow-x-auto border rounded-lg bg-white p-4 shadow">
              <table className="min-w-full table-auto border">
                <thead className="bg-orange-600 text-white">
                  <tr>
                    <th className="p-2">Student</th>
                    <th className="p-2">Number</th>
                    <th className="p-2">Photo</th>
                    <th className="p-2">Submitted</th>
                    <th className="p-2">Returned</th>
                    <th className="p-2">Come Out</th>
                    <th className="p-2">Come In</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((s) => (
                    <tr key={s.id} className="border-b hover:bg-gray-50 odd:bg-white even:bg-gray-50">
                      <td className="p-2">{s.hostel.name}</td>
                      <td className="p-2">{s.number}</td>
                      <td className="p-2">
                        <img
                          src={s.photo}
                          alt="hostel submission"
                          className="w-16 h-16 object-cover rounded-lg border hover:scale-105 transition-transform"
                        />
                      </td>
                      <td className="p-2">
                        {s.submit ? (
                          <span className="text-green-600 font-semibold">Yes</span>
                        ) : (
                          <span className="text-red-600 font-semibold">No</span>
                        )}
                      </td>
                      <td className="p-2">
                        {s.returned ? (
                          <span className="text-green-600 font-semibold">Yes</span>
                        ) : (
                          <span className="text-red-600 font-semibold">No</span>
                        )}
                      </td>
                      <td className="p-2">{s.comeoutTime || "-"}</td>
                      <td className="p-2">{s.comeinTime || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}