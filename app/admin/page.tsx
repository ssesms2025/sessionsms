"use client";

import AdminPage from "@/components/AdminPage";
import RequireRoleGender from "@/components/RequireRole";

 // your existing code

export default function AdminProtected() {
  return (
    <RequireRoleGender allowedRoles={["ADMIN","SUPER"]}allowedGenders={["FEMALE",'MALE']}>
            <AdminPage />

    </RequireRoleGender>
  );
}