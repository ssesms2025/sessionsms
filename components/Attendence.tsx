"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { User, Mail, Building2, Calendar, Percent, Trash2, Plus } from "lucide-react";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

export default function AttendancePage() {
  const [students, setStudents] = useState<any[]>([]);
  const [manualEmail, setManualEmail] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [month, setMonth] = useState("");
  const [percentage, setPercentage] = useState("");
  const [attendanceList, setAttendanceList] = useState<any[]>([]);

  useEffect(() => {
    
    fetch("/api/admin/students", {
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
    })
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch(() => toast.error("Failed to fetch students"));
  }, []);

  const handleManualSearch = async () => {
    const student = students.find((s) => s.email === manualEmail);
    if (student) {
      setSelectedStudent(student);
      toast.success(`Student found: ${student.name}`);
      fetchAttendance(student.id);
    } else {
      toast.error("No student found");
    }
  };

  const fetchAttendance = async (studentId: string) => {
    try {
      const res = await fetch(`/api/attendence/student/${studentId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAttendanceList(data.attendances || data || []);
      } else {
        toast.error("Failed to fetch attendance ❌");
      }
    } catch {
      toast.error("Network error ❌");
    }
  };

  const handleCreate = async () => {
    if (!selectedStudent) return toast.error("Select a student first");
    if (!month || !percentage) return toast.error("Fill all fields");

    try {
      const res = await fetch("/api/attendence/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({
          attendenceId: selectedStudent.id,
          monthh: month,
          percentage: percentage.toString(),
        }),
      });

      if (res.ok) {
        const newAttendance = await res.json();
        toast.success("Attendance created ✅");
        setAttendanceList([...attendanceList, newAttendance.attendence || newAttendance]);
        setMonth("");
        setPercentage("");
      } else {
        const err = await res.json();
        toast.error(err.error || "Error creating attendance ❌");
      }
    } catch {
      toast.error("Network error ❌");
    }
  };

  const handleUpdate = async (id: string, newMonth: string, newPercentage: string) => {
    try {
      const res = await fetch("/api/attendence/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({ id, monthh: newMonth, percentage: newPercentage }),
      });

      if (res.ok) {
        toast.success("Attendance updated ✅");
        setAttendanceList((prev) =>
          prev.map((a) =>
            a.id === id ? { ...a, monthh: newMonth, percentage: newPercentage } : a
          )
        );
      } else {
        const err = await res.json();
        toast.error(err.error || "Error updating attendance ❌");
      }
    } catch {
      toast.error("Network error ❌");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch("/api/attendence/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        toast.success("Attendance deleted ✅");
        setAttendanceList((prev) => prev.filter((a) => a.id !== id));
      } else {
        const err = await res.json();
        toast.error(err.error || "Error deleting attendance ❌");
      }
    } catch {
      toast.error("Network error ❌");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-white p-4 sm:p-6">
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-purple-800 text-center">
          Attendance Management
        </h1>

        {/* Manual Search */}
        <div className="rounded-xl border p-4 bg-white shadow-lg flex flex-col sm:flex-row gap-2 items-center">
          <input
            type="email"
            placeholder="Enter student email"
            value={manualEmail}
            onChange={(e) => setManualEmail(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleManualSearch}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-400 text-white hover:from-purple-700 hover:to-purple-500"
          >
            <User size={18} /> Search
          </button>
        </div>

        {selectedStudent && (
          <div className="rounded-xl border p-4 bg-white shadow-xl space-y-6">
            {/* Student Info */}
            <div className="space-y-2">
              <h2 className="font-semibold text-purple-700 text-lg">Student Info</h2>
              <p className="flex items-center gap-2"> <User size={16} /> <span className="font-medium">{selectedStudent.name}</span></p>
              <p className="flex items-center gap-2"> <Mail size={16} /> <span className="font-medium">{selectedStudent.email}</span></p>
              <p className="flex items-center gap-2"> <Building2 size={16} /> <span className="font-medium">{selectedStudent.department}</span></p>
            </div>

            {/* Previous Attendance */}
            <div className="space-y-3 border-t pt-4">
              <h3 className="font-semibold text-purple-700 flex items-center gap-2"> <Calendar size={18} /> Previous Attendance</h3>
              {attendanceList.length === 0 && <p className="text-gray-500">No records found.</p>}

              {attendanceList.map((att) => (
                <div key={att.id} className="flex gap-2 items-center">
                  <select
                    className="border rounded-lg px-2 py-1 flex-1"
                    value={att.monthh}
                    onChange={(e) => handleUpdate(att.id, e.target.value, att.percentage)}
                  >
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1">
                    <Percent size={16} />
                    <input
                      type="number"
                      value={att.percentage}
                      onChange={(e) => handleUpdate(att.id, att.monthh, e.target.value)}
                      className="border rounded-lg px-2 py-1 w-20"
                    />
                  </div>

                  <button
                    onClick={() => handleDelete(att.id)}
                    className="flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Attendance */}
            <div className="space-y-3 border-t pt-4">
              <h3 className="font-semibold text-purple-700 flex items-center gap-2"><Plus size={18}/> Add Attendance</h3>
              <select
                className="w-full border rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              >
                <option value="">Select Month</option>
                {MONTHS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <Percent size={16} />
                <input
                  type="number"
                  placeholder="Percentage"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  className="flex-1 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                onClick={handleCreate}
                className="flex items-center justify-center gap-2 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
              >
                <Plus size={16} /> Add Attendance
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
