"use client";

import AttendancePage from "@/components/Attendence";
import RequireRoleGender from "@/components/RequireRole";

// your existing code

export default function AttendenceProtected() {
  return (
    <RequireRoleGender allowedRoles={["ADMIN"]}>
      <AttendancePage />
    </RequireRoleGender>
        
  );
}