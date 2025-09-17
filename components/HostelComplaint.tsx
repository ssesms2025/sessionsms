"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Webcam from "react-webcam";
import axios from "axios";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

export default function HostelForm() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const webcamRef = useRef<Webcam>(null);
  const defaultPhoto = "https://i.pravatar.cc/150?img=3";

  const [formData, setFormData] = useState({
    reason: "",
    village: "",
    number: "",
    duration: "",
    photo: "",
  });

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-purple-700 font-semibold">Loading…</p>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-center text-purple-700 font-semibold">
          Please log in to submit a hostel request.
        </p>
      </div>
    );
  }

  const handleCapture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) setFormData((prev) => ({ ...prev, photo: imageSrc }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.reason || !formData.village || !formData.number || !formData.duration) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      await axios.post("/api/hostel/create", {
        ...formData,
        photo: formData.photo || defaultPhoto,
        userId: session.user.id,
        submit: false,
        returned: false,
      });

      toast.success("Hostel request submitted!");
      setFormData({ reason: "", village: "", number: "", duration: "", photo: "" });
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Error submitting request");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-purple-300 to-white p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl max-w-md w-full space-y-5"
      >
        <h2 className="text-2xl font-bold text-center text-purple-700 mb-4">Hostel Request</h2>

        <input
          type="text"
          placeholder="Reason"
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          className="border border-purple-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-300 px-4 py-2 rounded-xl w-full transition-all outline-none"
        />

        <input
          type="text"
          placeholder="Village"
          value={formData.village}
          onChange={(e) => setFormData({ ...formData, village: e.target.value })}
          className="border border-purple-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-300 px-4 py-2 rounded-xl w-full transition-all outline-none"
        />

        <input
          type="text"
          placeholder="Phone Number"
          value={formData.number}
          onChange={(e) => setFormData({ ...formData, number: e.target.value })}
          className="border border-purple-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-300 px-4 py-2 rounded-xl w-full transition-all outline-none"
        />

        <input
          type="text"
          placeholder="Duration"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
          className="border border-purple-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-300 px-4 py-2 rounded-xl w-full transition-all outline-none"
        />

        {/* Webcam / Photo */}
        <div className="flex flex-col items-center">
          {formData.photo ? (
            <img
              src={formData.photo}
              alt="Captured"
              className="w-32 h-32 rounded-full shadow-lg mb-3 border-4 border-purple-200"
            />
          ) : (
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-32 h-32 rounded-full shadow-lg mb-3 border-4 border-purple-200"
            />
          )}
          <button
            type="button"
            onClick={handleCapture}
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-full transition-all"
          >
            Capture Photo
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white py-3 rounded-2xl font-semibold transition-all"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
