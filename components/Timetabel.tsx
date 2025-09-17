"use client";

import { useState } from "react";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const timings = [
  "08:45 - 09:35","09:35 - 10:25","10:35 - 11:25",
  "11:25 - 12:15","12:15 - 01:00","01:00 - 01:50",
  "01:50 - 02:40","02:50 - 03:40","03:40 - 04:30",
];

const departments = ["CSE", "ECE", "EEE", "CIVIL", "MECH"];
const years = [1, 2, 3, 4];
const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

export default function TimetablePage() {
  const [form, setForm] = useState({ department: "", year: "", semsister: "" });
  const [timetable, setTimetable] = useState<string[][]>(
    days.map(() => timings.map(() => ""))
  );
  const [message, setMessage] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const handleInput = (dayIdx: number, timeIdx: number, value: string) => {
    setTimetable(prev => {
      const copy = [...prev];
      copy[dayIdx][timeIdx] = value;
      return copy;
    });
  };

  const fetchTimetable = async () => {
    if (!form.department || !form.year || !form.semsister) {
      setMessage("Select department, year, and semester");
      setTimetable(days.map(() => timings.map(() => "")));
      return;
    }

    try {
      const res = await fetch(
        `/api/timetabel?department=${form.department}&year=${form.year}&semsister=${form.semsister}`
      );
      const data = await res.json();

      if (data?.period) {
        setTimetable(JSON.parse(data.period));
        setMessage("Timetable loaded successfully");
      } else {
        setTimetable(days.map(() => timings.map(() => "")));
        setMessage("No timetable found, you can create one");
      }
    } catch {
      setMessage("Error fetching timetable");
    }
  };

  const handleSave = async (type: "create" | "update") => {
    if (!form.department || !form.year || !form.semsister) {
      setMessage("Select department, year, and semester");
      return;
    }

    try {
      const res = await fetch(`/api/timetabel/${type}`, {
        method: type === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department: form.department,
          year: form.year,
          semsister: form.semsister,
          period: JSON.stringify(timetable),
        }),
      });
      const data = await res.json();
      setMessage(data.message || data.error);
    } catch {
      setMessage(`Error ${type === "create" ? "creating" : "updating"} timetable`);
    }
  };

  return (
    <div className="bg-gradient-to-b from-purple-100 via-white to-purple-100 p-4">
      <div className="max-w-4xl mx-auto space-y-4">

        <h1 className="text-2xl md:text-3xl font-extrabold text-center text-purple-700 drop-shadow">
          📅 Manage Class Timetable
        </h1>

        {/* Compact Filter Button */}
        <div className="flex justify-center">
          <button
            onClick={() => setShowFilters(prev => !prev)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded shadow"
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        {/* Filter Menu */}
        {showFilters && (
          <div className="bg-white shadow-lg rounded-xl p-4 flex flex-col sm:flex-row gap-2 justify-center items-center">
            <select
              className="border border-purple-300 rounded-lg px-3 py-2 text-sm w-full sm:w-auto focus:ring-2 focus:ring-purple-400"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            >
              <option value="">Department</option>
              {departments.map(dep => <option key={dep} value={dep}>{dep}</option>)}
            </select>

            <select
              className="border border-purple-300 rounded-lg px-3 py-2 text-sm w-full sm:w-auto focus:ring-2 focus:ring-purple-400"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
            >
              <option value="">Year</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>

            <select
              className="border border-purple-300 rounded-lg px-3 py-2 text-sm w-full sm:w-auto focus:ring-2 focus:ring-purple-400"
              value={form.semsister}
              onChange={(e) => setForm({ ...form, semsister: e.target.value })}
            >
              <option value="">Semester</option>
              {semesters.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <button
              onClick={fetchTimetable}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded shadow w-full sm:w-auto"
            >
              Load
            </button>
          </div>
        )}

        {/* Timetable Grid */}
        <div className="overflow-x-auto bg-white shadow-lg rounded-xl p-2">
          <table className="w-full border border-purple-200 text-center min-w-[800px]">
            <thead>
              <tr className="bg-purple-600 text-white">
                <th className="p-2 border border-purple-300">Day / Time</th>
                {timings.map((t, i) => (
                  <th key={i} className="p-2 border border-purple-300">{t}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((day, dIdx) => (
                <tr key={dIdx} className={dIdx % 2 === 0 ? "bg-purple-50" : "bg-white"}>
                  <td className="p-2 font-bold text-purple-700 border border-purple-200">{day}</td>
                  {timings.map((_, tIdx) => (
                    <td key={tIdx} className="p-1 border border-purple-200">
                      <input
                        type="text"
                        className="w-full p-1 border rounded text-sm"
                        value={timetable[dIdx][tIdx]}
                        onChange={(e) => handleInput(dIdx, tIdx, e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => handleSave("create")}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow w-full sm:w-auto"
          >
            Create
          </button>
          <button
            onClick={() => handleSave("update")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow w-full sm:w-auto"
          >
            Update
          </button>
        </div>

        {message && (
          <p className="text-center text-purple-700 font-medium mt-2">{message}</p>
        )}
      </div>
    </div>
  );
}
