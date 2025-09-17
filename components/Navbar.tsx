"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { User } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogoClick = () => {
    router.push("/user/signin");
  };

  const handleLogout = () => {
    signOut({ redirect: false });
    setShowMenu(false);
    router.push("/user/signin");
  };

  return (
    <nav className="w-full bg-white shadow-md px-4 py-3 flex justify-between items-center">
      {/* Logo */}
      <h1
        className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-purple-300 text-transparent bg-clip-text cursor-pointer"
        onClick={handleLogoClick}
      >
        SSE
      </h1>

      {/* Avatar & Menu */}
      {session?.user ? (
        <div className="relative">
          <button
            className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-600 text-white"
            onClick={() => setShowMenu(!showMenu)}
          >
            {session.user.name?.charAt(0).toUpperCase() || <User className="h-5 w-5" />}
          </button>

          {/* Dropdown menu */}
          {showMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg py-2 z-50">
              <p className="px-4 py-2 text-gray-700 text-sm border-b border-gray-100">
                {session.user.name}
              </p>
              <button
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700 text-sm"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          className="text-purple-600 font-medium"
          onClick={handleLogoClick}
        >
          Sign In
        </button>
      )}
    </nav>
  );
}
