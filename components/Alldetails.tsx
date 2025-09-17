"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface HostelSubmission {
  id: number;
  submit: boolean;
  returned: boolean;
  number: string;
  photo: string;
  comeoutTime: string | null;
  comeinTime: string | null;
  approvedby?: string | null;

  hostel: {
    name: string;
    email: string;
  };
}

export default function HostelDetailsPage() {
  const [submissions, setSubmissions] = useState<HostelSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSubmit, setFilterSubmit] = useState<boolean | "all">("all");

  const fetchSubmissions = async () => {
  try {
    const res = await fetch("/api/hostel/create");
    const data = await res.json();

    // Ensure it's always an array
    if (Array.isArray(data)) {
      setSubmissions(data);
    } else if (data && Array.isArray(data.hostels)) {
      // If your API wraps it (e.g. { hostels: [...] })
      setSubmissions(data.hostels);
    } else {
      setSubmissions([]); // fallback
    }
  } catch (err) {
    toast.error("Failed to fetch hostel submissions.");
    setSubmissions([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const filtered = submissions.filter((s) =>
    filterSubmit === "all" ? true : s.submit === filterSubmit
  );

  if (loading) return <p className="text-center mt-8">Loading...</p>;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4 text-center text-orange-600">
        Hostel Submissions - View Only
      </h1>

      {/* Filter buttons */}
      <div className="mb-4 flex justify-center gap-4 flex-wrap">
        <button
          className={`px-4 py-2 rounded ${
            filterSubmit === "all" ? "bg-orange-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setFilterSubmit("all")}
        >
          All
        </button>
        <button
          className={`px-4 py-2 rounded ${
            filterSubmit === true ? "bg-orange-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setFilterSubmit(true)}
        >
          Submitted
        </button>
        <button
          className={`px-4 py-2 rounded ${
            filterSubmit === false ? "bg-orange-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setFilterSubmit(false)}
        >
          Not Submitted
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-600 mt-8">No submissions to display</p>
      ) : (
        <div className="overflow-x-auto bg-white border border-gray-300 rounded-lg shadow-md">
          <table className="min-w-full text-left text-sm text-gray-700">
            <thead className="bg-orange-100 text-orange-700 uppercase text-xs">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Photo</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Number</th>
                <th className="px-4 py-2">Submitted</th>
                <th className="px-4 py-2">Returned</th>
               <th className="px-4 py-2">ApprovedBy</th>

                <th className="px-4 py-2">Come Out Time</th>
                <th className="px-4 py-2">Come In Time</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-t hover:bg-orange-50">
                  <td className="px-4 py-2">{s.hostel.name}</td>
                  
                  {/* Photo */}
                  <td className="px-4 py-2">
                    <img
                      src={s.photo || "/default-profile.png"}
                      alt={s.hostel.name}
                      className="w-12 h-12 rounded-full object-cover border"
                    />
                  </td>

                  <td className="px-4 py-2">{s.hostel.email}</td>
                  <td className="px-4 py-2">{s.number}</td>

                  <td className="px-4 py-2">
                    {s.submit ? (
                      <span className="text-green-600 font-semibold">Yes</span>
                    ) : (
                      <span className="text-red-600 font-semibold">No</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {s.returned ? (
                      <span className="text-green-600 font-semibold">Yes</span>
                    ) : (
                      <span className="text-red-600 font-semibold">No</span>
                    )}
                  </td>
                                    <td className="px-4 py-2">{s.approvedby}</td>

                  <td className="px-4 py-2">
                    {s.comeoutTime ? new Date(s.comeoutTime).toLocaleString() : "-"}
                  </td>
                  <td className="px-4 py-2">
                    {s.comeinTime ? new Date(s.comeinTime).toLocaleString() : "-"}
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
