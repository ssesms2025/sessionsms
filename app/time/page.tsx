"use client";

import { useState } from "react";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const timings = [
  "08:45 - 09:35", "09:35 - 10:25", "10:35 - 11:25",
  "11:25 - 12:15", "12:15 - 01:00", "01:00 - 01:50",
  "01:50 - 02:40", "02:50 - 03:40", "03:40 - 04:30",
];

const departments = ["CSE", "ECE", "EEE", "CIVIL", "MECH"];
const years = [1, 2, 3, 4];
const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

export default function ViewTimetablePage() {
  const [filters, setFilters] = useState({ department: "", year: "", semsister: "" });
  const [timetable, setTimetable] = useState<string[][] | null>(null);
  const [message, setMessage] = useState("");

  const handleFetch = async () => {
    if (!filters.department || !filters.year || !filters.semsister) {
      setMessage("Please select department, year, and semester");
      setTimetable(null);
      return;
    }

    setMessage("");
    try {
      const res = await fetch(
        `/api/timetabel?department=${filters.department}&year=${filters.year}&semsister=${filters.semsister}`
      );
      const data = await res.json();

      if (data.error) {
        setMessage(data.error);
        setTimetable(null);
        return;
      }

      if (data.period) {
        setTimetable(JSON.parse(data.period));
        setMessage("");
      } else {
        setTimetable(null);
        setMessage("No timetable found");
      }
    } catch {
      setMessage("Error fetching timetable");
      setTimetable(null);
    }
  };

  return (
    <div className="bg-gradient-to-b from-purple-100 via-white to-purple-100 py-10">
      <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 space-y-6">
        <h1 className="text-lg font-bold text-center text-purple-700">
          📅 Class Timetable
        </h1>

        
<div className="flex flex-wrap justify-center items-center gap-2 mt-2">
  <select
    className="border border-purple-300 rounded-lg px-2 py-1 text-sm flex-1 min-w-[80px] focus:ring-2 focus:ring-purple-400"
    value={filters.department}
    onChange={(e) => setFilters({ ...filters, department: e.target.value })}
  >
    <option value="">Dept</option>
    {departments.map((dep) => (
      <option key={dep} value={dep}>{dep}</option>
    ))}
  </select>

  <select
    className="border border-purple-300 rounded-lg px-2 py-1 text-sm flex-1 min-w-[70px] focus:ring-2 focus:ring-purple-400"
    value={filters.year}
    onChange={(e) => setFilters({ ...filters, year: e.target.value })}
  >
    <option value="">Year</option>
    {years.map((y) => (
      <option key={y} value={y}>{y}</option>
    ))}
  </select>

  <select
    className="border border-purple-300 rounded-lg px-2 py-1 text-sm flex-1 min-w-[70px] focus:ring-2 focus:ring-purple-400"
    value={filters.semsister}
    onChange={(e) => setFilters({ ...filters, semsister: e.target.value })}
  >
    <option value="">Sem</option>
    {semesters.map((s) => (
      <option key={s} value={s}>{s}</option>
    ))}
  </select>

  <button
    onClick={handleFetch}
    className="bg-purple-600 hover:bg-purple-700 transition text-white text-xs font-medium px-3 py-1 rounded shadow-md"
  >
    Show
  </button>
</div>



        {/* Timetable */}
        {timetable && (
          <div className="overflow-x-auto mt-4">
            <table className="w-full border border-purple-200 rounded-lg text-sm">
              <thead>
                <tr className="bg-purple-600 text-white">
                  <th className="p-2 border border-purple-300">Day / Time</th>
                  {timings.map((t, i) => (
                    <th key={i} className="p-2 border border-purple-300 whitespace-nowrap">{t}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map((day, dIdx) => (
                  <tr key={dIdx} className={dIdx % 2 === 0 ? "bg-purple-50" : "bg-white"}>
                    <td className="p-2 font-bold text-purple-700 border border-purple-200">{day}</td>
                    {timings.map((_, tIdx) => (
                      <td key={tIdx} className="p-2 border border-purple-200 text-gray-700">
                        {timetable[dIdx][tIdx] || "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {message && <p className="text-center text-red-500 font-medium">{message}</p>}
      </div>
    </div>
  );
}
