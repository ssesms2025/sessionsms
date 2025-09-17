"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  QrCode,
  X,
  RefreshCw,
  Users,
  Menu,
  CalendarCheck,
} from "lucide-react";
import Webcam from "react-webcam";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// ✅ Dynamically import QR Reader to avoid SSR crash
const QrReader = dynamic(() => import("react-qr-reader"), { ssr: false });

const DEFAULT_PHOTO = "https://via.placeholder.com/150.png?text=No+Photo";

export default function AdminPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [reason, setReason] = useState("beard");
  const [photo, setPhoto] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [scanning, setScanning] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [otherReason, setOtherReason] = useState("");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [qrFacingMode, setQrFacingMode] = useState<"user" | "environment">(
    "environment"
  );
  const [open, setOpen] = useState(false);

  const webcamRef = useRef<Webcam>(null);
  const router = useRouter();

  // ✅ Fetch students
  useEffect(() => {
    
    fetch("/api/admin/students", {
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
    })
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch(() => toast.error("Failed to fetch students"));
  }, []);

  // ✅ Manual search
  const handleManualSearch = () => {
    const student = students.find((s) => s.email === manualEmail);
    if (student) {
      setSelectedStudent(student);
      toast.success(`Student found: ${student.name}`);
    } else {
      toast.error("No student found with that email");
    }
  };

  // ✅ QR Scan handler
  const handleScan = (data: string | null) => {
    if (data) {
      const student = students.find((s) => s.email === data);
      if (student) {
        setSelectedStudent(student);
        toast.success(`Student found: ${student.name}`);
        setScanning(false);
      } else {
        toast.error("No student found for scanned QR");
      }
    }
  };

  const handleError = (err: any) => {
    console.error(err);
    toast.error("Camera access error ❌");
  };

  // ✅ Capture photo
  const handleCapture = () => {
    const screenshot = webcamRef.current?.getScreenshot();
    if (screenshot) {
      setPhoto(screenshot);
      setShowCamera(false);
      toast.success("Photo captured 📸");
    }
  };

  // ✅ Submit complaint
  const submitComplaint = async () => {
    if (!selectedStudent) return toast.error("Select a student first");
    const finalReason = reason === "other" ? otherReason : reason;

    if (reason === "other" && !otherReason.trim()) {
      return toast.error("Please enter a reason");
    }

    try {
      const res = await fetch("/api/complaint/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          reason: finalReason,
          photo: photo || DEFAULT_PHOTO,
        }),
      });

      if (res.ok) {
        toast.success("Complaint submitted ✅");
        setPhoto("");
        const newComplaint = await res.json();
        setSelectedStudent((prev: any) => ({
          ...prev,
          complaintsAsStudent: [
            newComplaint,
            ...(prev.complaintsAsStudent || []),
          ],
        }));
      } else {
        toast.error("Error submitting complaint please contact principal ❌");
      }
    } catch {
      toast.error("Network error ❌");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4 sm:p-6 relative">
      {/* Hamburger Icon */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 right-4 z-50 bg-purple-600 p-2 rounded-lg text-white shadow-md sm:hidden"
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>
      {/* Right-side menu */}
      {/* Mobile (toggle menu) */}
      <div
        className={`fixed top-16 right-4 bg-purple-200 text-purple-900 shadow-lg flex flex-col py-4 px-4 gap-3 rounded-xl transform transition-transform duration-300 z-40
        sm:hidden
        ${open ? "translate-x-0" : "translate-x-56"}`}
        style={{ minWidth: "180px" }}
      >
        <button
          onClick={() => {
            router.push("/users");
            setOpen(false);
          }}
          className="flex items-center gap-2 px-3 py-2 rounded hover:bg-purple-300"
        >
          <Users size={20} /> Details
        </button>

        <button
          onClick={() => {
            router.push("/attendence");
            setOpen(false);
          }}
          className="flex items-center gap-2 px-3 py-2 rounded hover:bg-purple-300"
        >
          <CalendarCheck size={20} /> Attendance
        </button>
        <button
          onClick={() => {
            router.push("/timetabel");
            setOpen(false);
          }}
          className="flex items-center gap-2 px-3 py-2 rounded hover:bg-purple-300"
        >
          <CalendarCheck size={20} /> Timetable
        </button>
      </div>

      {/* Desktop nav (always visible) */}
      <div className="hidden sm:flex fixed top-4 right-6 bg-purple-200 text-purple-900 shadow-lg py-2 px-4 gap-4 rounded-xl z-40">
        <button
          onClick={() => router.push("/users")}
          className="flex items-center gap-2 px-3 py-2 rounded hover:bg-purple-300"
        >
          <Users size={20} /> Details
        </button>

        <button
          onClick={() => router.push("/attendence")}
          className="flex items-center gap-2 px-3 py-2 rounded hover:bg-purple-300"
        >
          <CalendarCheck size={20} /> Attendance
        </button>

        <button
          onClick={() => router.push("/timetabel")}
          className="flex items-center gap-2 px-3 py-2 rounded hover:bg-purple-300"
        >
          <CalendarCheck size={20} /> Timetable
        </button>
      </div>

      {/* Overlay with blur */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Page content */}
      <div
        className={`max-w-xl mx-auto space-y-6 text-black transition-all duration-300 ${
          open ? "filter blur-sm" : ""
        }`}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-purple-700 text-center">
          Admin Dashboard
        </h1>

        {/* Manual Search */}
        <div className="rounded-xl border p-4 bg-white shadow-sm">
          <h2 className="font-semibold text-purple-700 mb-2 text-sm sm:text-base">
            Search by Email
          </h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="Enter student email"
              value={manualEmail}
              onChange={(e) => setManualEmail(e.target.value)}
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleManualSearch}
              className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 text-sm"
            >
              Search
            </button>
          </div>
        </div>

        {/* ✅ QR Scanner with Toggle Button */}
        <div className="rounded-xl border p-4 bg-white shadow-sm">
          <h2 className="font-semibold text-purple-700 mb-2 text-sm sm:text-base">
            QR Scanner
          </h2>

          {/* Toggle Button */}
          <button
            onClick={() => setScanning((prev) => !prev)}
            className="flex items-center justify-center w-full px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 gap-2 text-sm mb-3"
          >
            {scanning ? <X size={20} /> : <QrCode size={20} />}
            {scanning ? "Close Scanner" : "Open Scanner"}
          </button>

          {scanning && (
            <div className="relative">
              <div className="w-full h-100 border rounded-lg overflow-hidden">
                <QrReader
                  delay={100}
                  onError={handleError}
                  onScan={handleScan}
                  style={{ width: "100%", height: "100%" }}
                  facingMode={qrFacingMode}
                />
              </div>
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={() =>
                    setQrFacingMode(
                      (prev) => (prev === "user" ? "environment" : "user")
                    )
                  }
                  className="p-2 bg-yellow-500 rounded-full text-white"
                >
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Selected Student + Complaint Form */}
        {selectedStudent && (
          <div className="rounded-xl border p-4 sm:p-6 bg-white shadow-lg space-y-6">
            <h2 className="font-semibold text-purple-700">Selected Student</h2>
            <div className="space-y-1">
              <p className="text-sm font-medium flex items-center gap-1">
                👤 {selectedStudent.name}
              </p>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                📧 {selectedStudent.email}
              </p>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                🏫 {selectedStudent.department}
              </p>
            </div>

            {/* Complaint Form */}
            <div className="space-y-6 border-t pt-4">
              {/* Camera Section */}
              <div className="text-center space-y-2">
                <p className="font-semibold">Capture Photo</p>
                <p className="text-xs text-gray-500">Used for verification</p>

                {photo ? (
                  <>
                    <img
                      src={photo}
                      alt="Captured"
                      className="w-28 h-28 sm:w-32 sm:h-32 mx-auto rounded-full border border-orange-200 object-cover"
                    />
                    <button
                      type="button"
                      className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-4 rounded text-sm"
                      onClick={() => {
                        setPhoto("");
                        setShowCamera(true);
                      }}
                    >
                      Retake Photo
                    </button>
                  </>
                ) : showCamera ? (
                  <div className="space-y-2">
                    <div className="relative overflow-hidden w-28 h-28 sm:w-32 sm:h-32 mx-auto border-4 border-[#f9843d]">
                      <Webcam
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="w-full h-full object-cover"
                        videoConstraints={{ facingMode }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFacingMode((prev) =>
                            prev === "user" ? "environment" : "user"
                          )
                        }
                        className="absolute top-1 right-1 bg-purple-600 p-1 rounded-full text-white"
                      >
                        <RefreshCw size={16} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleCapture}
                      className="bg-[#f9843d] hover:bg-[#e77428] text-white px-4 py-2 rounded shadow text-sm"
                    >
                      Capture Photo
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowCamera(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded shadow text-sm"
                  >
                    Open Camera
                  </button>
                )}
              </div>

              {/* Complaint Reason */}
              <div className="flex flex-col gap-3 border rounded-xl p-3 bg-gray-50 shadow-sm">
                <select
                  className="w-full border rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                >
                  <option value="Beard">Beard</option>
                  <option value="Shoes">Shoes</option>
                  <option value="Late">Late Arrival</option>
                  <option value="Dress-Code">Dress Code</option>
                  <option value="other">Other</option>
                </select>

                {reason === "other" && (
                  <input
                    type="text"
                    placeholder="Enter your reason"
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                )}

                <button
                  onClick={submitComplaint}
                  className="w-full px-2 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  Submit Complaint
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
