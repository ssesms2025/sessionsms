"use client";

import HostelForm from "@/components/HostelComplaint";
import RequireRoleGender from "@/components/RequireRole";

 // your existing code

export default function HostelProtected() {
  return (
    <RequireRoleGender allowedRoles={["STUDENT"]} allowedTypes={["HOSTELER"]}>
      <HostelForm />
    </RequireRoleGender>
      
  );
}