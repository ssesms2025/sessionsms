"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { QrCode, X } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

const QrReader = dynamic(() => import("react-qr-reader"), { ssr: false });

interface Complaint {
  id: string;
  photo: string;
  reason: string;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  department: string;
  complaintsAsStudent: Complaint[];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [scanning, setScanning] = useState(false);

  // Filters
  const [department, setDepartment] = useState("");
  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    

    fetch(`/api/admin/users?email=${search}`)
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Error:", err));
  }, [search]);

  // ✅ Date range check helper
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

  // Filtered users
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

  // Complaints per Day chart data
  const complaintStats = filteredUsers
    .flatMap((u) => u.complaintsAsStudent)
    .filter((c) => isInRange(c.createdAt))
    .reduce<Record<string, number>>((acc, complaint) => {
      const date = new Date(complaint.createdAt).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

  const chartData = Object.entries(complaintStats).map(([date, count]) => ({
    date,
    count,
  }));

  // Complaints by reason
  const reasonStats = filteredUsers
    .flatMap((u) => u.complaintsAsStudent)
    .filter((c) => isInRange(c.createdAt))
    .reduce<Record<string, number>>((acc, c) => {
      acc[c.reason] = (acc[c.reason] || 0) + 1;
      return acc;
    }, {});

  const reasonChartData = Object.entries(reasonStats).map(
    ([reason, count]) => ({
      reason,
      count,
    })
  );

  const maxReasonCount = Math.max(
    ...reasonChartData.map((d) => d.count),
    1
  );

  // 🎨 Bright color palette for each reason (unchanged)
  const reasonColors: Record<string, string> = {
    Late: "#ffa5ab",
    Beard: "#b5179e",
    Shoes: "#90e0ef",
    "Dress-Code": "#f72585",
    Others: "#ff9100",
  };

  // ✅ Function to set color
  const getReasonColor = (reason: string, count: number) => {
    // 🔴 Override: if > 10 complaints → blood red
    if (count > 10) return "#FF0000";

    const baseColor = reasonColors[reason] || "#9c27b0"; // fallback purple
    const intensity = Math.min(count / maxReasonCount, 1);
    return intensity > 0.66
      ? baseColor
      : intensity > 0.33
      ? `${baseColor}CC`
      : `${baseColor}80`;
  };

  return (
    <div className="p-4 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent text-center">
        SSE – Admin Dashboard
      </h1>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
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
      </div>

      {/* QR Scanner (toggle on click) */}
      <div
        className="rounded-xl border p-4 bg-white shadow-sm cursor-pointer"
        onClick={() => setScanning((prev) => !prev)}
      >
        <h2 className="font-semibold text-purple-700 mb-2 text-sm sm:text-base">
          QR Scanner (Click to {scanning ? "Close" : "Open"})
        </h2>
        {scanning ? (
          <div className="relative">
            <div className="w-full h-100 border rounded-lg overflow-hidden">
              <QrReader
                delay={100}
                onError={(err) => console.error(err)}
                onScan={(result: string | null) => {
                  if (result) setSearch(result);
                }}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full px-4 py-2 rounded-lg bg-purple-600 text-white gap-2 text-sm">
            <QrCode size={20} /> Click to Start Scanning
          </div>
        )}
      </div>

      {/* Complaints per Day Chart */}
      <div className="border rounded-lg shadow p-4 bg-white overflow-x-auto">
        <h2 className="text-lg font-semibold mb-3">Complaints per Day</h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500">No complaints data yet 🎉</p>
        )}
      </div>

      {/* Complaints by Reason */}
      <div className="border rounded-lg shadow p-4 bg-white overflow-x-auto">
        <h2 className="text-lg font-semibold mb-3">Complaints by Reason</h2>
        {reasonChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={reasonChartData}>
              <XAxis dataKey="reason" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {reasonChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getReasonColor(entry.reason, entry.count)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500">No complaints for this filter 🎉</p>
        )}
      </div>

      {/* Users Table */}
      <div className="border rounded-lg shadow p-4 bg-white overflow-x-auto">
        <h2 className="text-lg font-semibold mb-3">Users & Complaints</h2>
        <table className="min-w-full border rounded-lg table-auto">
          <thead className="bg-purple-600 text-white">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Department</th>
              <th className="p-2 text-left">Role</th>
              <th className="p-2 text-left">Complaints</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <tr
                  key={u.id}
                  className="border-b hover:bg-gray-50 sm:text-sm text-xs"
                >
                  <td className="p-2">{u.name}</td>
                  <td className="p-2 break-words">{u.email}</td>
                  <td className="p-2">{u.department}</td>
                  <td className="p-2">{u.role}</td>
                  <td className="p-2">
                    {u.complaintsAsStudent.length > 0 ? (
                      <ul className="list-disc ml-5">
                        {u.complaintsAsStudent
                          .filter((c) => isInRange(c.createdAt))
                          .map((c) => (
                            <li key={c.id}>
                              <span className="font-medium">{c.reason}</span>{" "}
                              ({new Date(c.createdAt).toLocaleDateString()}{" "}
                              {new Date(c.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })})
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <span className="text-gray-500">No complaints 🎉</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="p-4 text-center text-gray-500 italic"
                >
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}