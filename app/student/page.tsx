"use client";

import RequireRoleGender from "@/components/RequireRole";
import StudentPage from "@/components/StudentPage";


export default function StudentProtected() {
  return (
    <RequireRoleGender allowedRoles={["STUDENT"]} allowedGenders={["FEMALE","MALE"]}>
            <StudentPage />
    </RequireRoleGender>
  );
}