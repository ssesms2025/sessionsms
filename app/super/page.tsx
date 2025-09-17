"use client";

import RequireRoleGender from "@/components/RequireRole";
import AdminHostelPage from "@/components/Super";


export default function SuperProtected() {
  return (
    <RequireRoleGender allowedRoles={["SUPER"]}>
      <AdminHostelPage />
    </RequireRoleGender>
    
  );
}