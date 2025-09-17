"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/user/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-black text-lg">Loading your dashboard…</p>
      </div>
    );
  }

  if (!session?.user) return null;

  const { id, name, email, role, gender, type, department } = session.user as {
    id: string;
    name?: string | null;
    email?: string | null;
    role: "ADMIN" | "STUDENT" | "WARDEN" | "WATCHMAN" | "SUPER";
    gender: "MALE" | "FEMALE";
    type: "HOSTELER" | "DAY_SCHOLAR";
    department: string;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* header */}
      <div className="flex items-center justify-between max-w-4xl mx-auto mb-6">
        <h1 className="text-2xl font-bold text-black">Dashboard</h1>
        <button
          onClick={() => signOut({ callbackUrl: "/user/signin" })}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
        >
          Logout
        </button>
      </div>

      {/* profile card */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <div className="flex flex-col items-center text-center">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
            {name ? name.charAt(0).toUpperCase() : "U"}
          </div>
          <h2 className="mt-4 text-xl font-semibold text-black">{name || "Unknown User"}</h2>
          <p className="text-sm text-black/70">{email}</p>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg bg-gray-50">
            <p className="text-sm text-black/60">User ID</p>
            <p className="text-lg font-medium text-black">{id}</p>
          </div>
          <div className="p-4 border rounded-lg bg-gray-50">
            <p className="text-sm text-black/60">Role</p>
            <p className="text-lg font-medium text-black">{role}</p>
          </div>
          <div className="p-4 border rounded-lg bg-gray-50">
            <p className="text-sm text-black/60">Gender</p>
            <p className="text-lg font-medium text-black">{gender}</p>
          </div>
          <div className="p-4 border rounded-lg bg-gray-50">
            <p className="text-sm text-black/60">Type</p>
            <p className="text-lg font-medium text-black">{type}</p>
          </div>
          <div className="p-4 border rounded-lg bg-gray-50 md:col-span-2">
            <p className="text-sm text-black/60">Department</p>
            <p className="text-lg font-medium text-black">{department}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
