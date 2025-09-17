"use client";

import RequireRoleGender from "@/components/RequireRole";
import AdminUsersPage from "@/components/Users";

// your existing code

export default function StudentProtected() {
  return (
    <RequireRoleGender allowedRoles={["ADMIN","SUPER"]}>
      <AdminUsersPage/>
    </RequireRoleGender>
      
  );
}