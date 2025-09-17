"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

interface HostelSubmission {
  id: number;
  submit: boolean;
  returned: boolean;
  comeoutTime: string | null;
  comeinTime: string | null;
  photo: string;
  hostel: {
    name: string;
    email: string;
  };
}

export default function WatchmanPage() {
  const [submissions, setSubmissions] = useState<HostelSubmission[]>([]);

  const fetchSubmissions = async () => {
    try {
      const response = await axios.get("/api/hostel/create"); 
      // Only submissions where submit === true and returned === false
      const filtered = response.data.filter(
        (s: HostelSubmission) => s.submit && !s.returned
      );
      setSubmissions(filtered);
    } catch (error) {
      toast.error("Failed to fetch hostel submissions.");
    }
  };
  
  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleOut = async (id: number) => {
    try {
      await axios.patch(`/api/hostel/${id}`, { comeoutTime: new Date() });
      toast.success("Come Out Time marked");
      fetchSubmissions();
    } catch {
      toast.error("Failed to mark Come Out Time");
    }
  };
  const handleReturn = async (id: number) => {
    try {
      await axios.patch(`/api/hostel/${id}`, { 
        comeinTime: new Date(), 
        returned: true 
      });
      toast.success("Student Returned");
      setSubmissions(prev => prev.filter(s => s.id !== id)); // removed immediately
    } catch {
      toast.error("Failed to mark return");
    }
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-orange-100 py-6 px-4">
      <h1 className="text-2xl font-bold text-center mb-6 text-[#9a3310]">
        Watchman Panel - Submitted Only
      </h1>

      <div className="space-y-4 max-w-md mx-auto">
        {submissions.length === 0 && (
          <p className="text-center text-gray-600">No submitted students to display</p>
        )}

        {submissions.map((s) => (
          <div
            key={s.id}
            className="bg-white shadow-md rounded-2xl p-4 flex items-center gap-4"
          >
            <img
              src={s.photo || "/default-profile.png"}
              alt={s.hostel.name}
              className="w-20 h-20 rounded-full object-cover border border-gray-300"
            />

            <div className="flex flex-col flex-1">
              <div className="mb-2">
                <p className="text-lg font-semibold text-[#872e0e]">{s.hostel.name}</p>
                <p className="text-gray-600 text-sm">{s.hostel.email}</p>
              </div>

              <div className="flex gap-3 flex-wrap">
                {s.comeoutTime ? (
                  <button
                    onClick={() => handleReturn(s.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded text-sm"
                  >
                    Return
                  </button>
                ) : (
                  <button
                    onClick={() => handleOut(s.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded text-sm"
                  >
                    Out
                  </button>
                )}

                <span
                  className={`px-4 py-1 rounded text-sm font-semibold ${
                    s.returned ? "bg-green-200 text-green-700" : "bg-red-200 text-red-700"
                  }`}
                >
                  {s.returned ? "Returned" : "Pending Return"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
