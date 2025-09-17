"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import {
  User,
  Mail,
  Building2,
  CheckCircle,
  Menu,
  X,
  BookOpen,
  AlertTriangle,
  Home,
  Calendar,
} from "lucide-react";
import HostelProtected from "@/app/hostelcomplaint/page"; // Hostel form component
import ViewTimetablePage from "@/app/time/page";

type Attendance = {
  id: string;
  monthh: string;
  percentage: string;
};

type Complaint = {
  id: string;
  reason: string;
  photo?: string;
  createdAt: string;
};

type Hostel = {
  id: string;
  reason: string;
  village: string;
  number: string;
  duration: string;
  photo?: string;
  submit: boolean;
  returned: boolean;
  createdAt: string;
};

type Student = {
  id: string;
  name: string;
  email: string;
  department: string;
  type: "HOSTELER" | "DAY_SCHOLAR";
  complaintsAsStudent?: Complaint[];
};

type Section = "attendance" | "complaints" | "hostel" | "timetable";

export default function StudentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [student, setStudent] = useState<Student | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<Section>("attendance");
  const [showHostelForm, setShowHostelForm] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/user/signin");
      return;
    }

    if (status === "authenticated" && session?.user) {
      const token = (session as any).accessToken || ""; // JWT token if used
      const fetchData = async () => {
        try {
          // Fetch student data
          const resStudent = await fetch(`/api/student/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!resStudent.ok) throw new Error("Unauthorized");
          const studentData: Student = await resStudent.json();
          setStudent(studentData);

          // Attendance
          const resAttendance = await fetch(
            `/api/attendence/student/${studentData.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setAttendance(resAttendance.ok ? await resAttendance.json() : []);

          // Hostel requests (only fetch if HOSTELER)
          if (studentData.type === "HOSTELER") {
            const resHostel = await fetch(`/api/hostel/${studentData.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setHostels(resHostel.ok ? await resHostel.json() : []);
          }

          setLoading(false);
        } catch (err) {
          console.error(err);
          router.push("/user/signin");
        }
      };

      fetchData();
    }
  }, [status, session, router]);

  if (loading || status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Loading student info...
      </div>
    );
  }

  if (!student) return null;

  const totalPercentage =
    attendance.length > 0
      ? (
          attendance.reduce((acc, curr) => acc + parseFloat(curr.percentage), 0) /
          attendance.length
        ).toFixed(2)
      : "N/A";

  const menuItems = [
    { key: "attendance", label: "Attendance", icon: <BookOpen size={18} /> },
    { key: "complaints", label: "Complaints", icon: <AlertTriangle size={18} /> },
    // Show hostel only if HOSTELER
    ...(student.type === "HOSTELER"
      ? [{ key: "hostel", label: "Hostel", icon: <Home size={18} /> }]
      : []),
    { key: "timetable", label: "Timetable", icon: <Calendar size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-purple-50 flex flex-col items-center p-4 relative">
      {/* Menu Button */}
      <div className="w-full max-w-md flex justify-end mb-4 relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 text-purple-700 hover:text-purple-900 transition-all"
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-10 w-48 bg-white rounded-xl shadow-lg p-2 z-20">
            {menuItems.map((item) => (
              <button
                key={item.key}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-purple-100 transition-all ${
                  activeSection === item.key ? "bg-purple-200" : ""
                }`}
                onClick={() => {
                  setActiveSection(item.key as Section);
                  setMenuOpen(false);
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Student Info & QR Code */}
      <div className="w-full max-w-md rounded-3xl p-6 space-y-6 bg-gradient-to-br from-purple-600 to-purple-200 shadow-xl relative">
        <div className="space-y-3 text-white">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <User size={24} /> {student.name}
          </h1>
          <p className="flex items-center gap-2 text-sm">
            <Mail size={18} /> {student.email}
          </p>
          <p className="flex items-center gap-2 text-sm">
            <Building2 size={18} /> {student.department}
          </p>
          <p className="flex items-center gap-2 font-semibold text-sm">
            <CheckCircle size={18} /> Attendance: {totalPercentage}%
          </p>
        </div>

        <div className="flex flex-col items-center mt-4">
          <h2 className="font-semibold text-white mb-2">Your QR Code</h2>
          <div className="p-4 bg-white rounded-xl">
            <QRCodeCanvas value={student.email} size={150} />
          </div>
        </div>

        {/* Section Content */}
        <div className="mt-6 bg-white p-4 rounded-xl shadow-sm w-full">
          {activeSection === "attendance" && (
            <div>
              <h2 className="font-semibold text-purple-700 mb-2">Attendance</h2>
              {attendance.length > 0 ? (
                <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-purple-100">
                    <tr>
                      <th className="px-3 py-2 text-left">Month</th>
                      <th className="px-3 py-2 text-left">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((a) => (
                      <tr key={a.id} className="border-t">
                        <td className="px-3 py-2">{a.monthh}</td>
                        <td className="px-3 py-2">{a.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-700 text-sm">No attendance records yet.</p>
              )}
            </div>
          )}

          {activeSection === "complaints" && (
            <div>
              <h2 className="font-semibold text-purple-700 mb-2">
                Complaints Against You
              </h2>
              {student.complaintsAsStudent &&
              student.complaintsAsStudent.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {student.complaintsAsStudent.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center gap-3 border border-purple-200 px-3 py-2 rounded-lg bg-purple-50 shadow-sm"
                    >
                      {c.photo && (
                        <img
                          src={c.photo}
                          alt="Evidence"
                          className="w-12 h-12 object-cover rounded-full"
                        />
                      )}
                      <div className="flex flex-col">
                        <p className="font-medium text-black text-sm">{c.reason}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          {new Date(c.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-700 text-center text-sm">
                  No complaints yet 🎉
                </p>
              )}
            </div>
          )}

          {activeSection === "hostel" && student.type === "HOSTELER" && (
            <div>
              <div className="flex justify-center mb-4">
                <button
                  onClick={() => setShowHostelForm(!showHostelForm)}
                  className="bg-purple-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-purple-700 transition-all"
                >
                  {showHostelForm ? "Close Request Form" : "Request Hostel"}
                </button>
              </div>

              {showHostelForm && <HostelProtected />}

              <div className="mt-4">
                <h3 className="font-semibold text-purple-700 mb-2">
                  Previous Submissions
                </h3>
                {hostels.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {hostels.map((h) => (
                      <div
                        key={h.id}
                        className="flex items-center justify-between border border-purple-200 px-3 py-2 rounded-lg bg-purple-50 shadow-sm"
                      >
                        <div className="flex flex-col">
                          <p className="font-medium text-black">{h.reason}</p>
                          <p className="text-gray-500 text-xs">
                            {h.village} | {h.number} | {h.duration}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {new Date(h.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`px-2 py-1 rounded text-white text-xs ${
                              h.submit ? "bg-green-500" : "bg-red-500"
                            }`}
                          >
                            {h.submit ? "Submitted" : "Pending"}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-white text-xs ${
                              h.returned ? "bg-green-500" : "bg-red-500"
                            }`}
                          >
                            {h.returned ? "Returned" : "Not Returned"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-700 text-center text-sm">
                    No hostel requests yet.
                  </p>
                )}
              </div>
            </div>
          )}

          {activeSection === "timetable" && (
            <div className="mt-4">
              <h2 className="font-semibold text-purple-700 mb-2 text-center">
                Your Timetable
              </h2>
              <ViewTimetablePage />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
