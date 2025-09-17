"use client";

import RequireRoleGender from "@/components/RequireRole";
import TimetablePage from "@/components/Timetabel";

// your existing code

export default function TimeTabelProtected() {
  return (
    <RequireRoleGender allowedRoles={["ADMIN"]}>
      <TimetablePage />
    </RequireRoleGender>
    
  );
}