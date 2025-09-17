"use client";

import RequireRoleGender from "@/components/RequireRole";
import WardenHostelPage from "@/components/Warden";

 // your existing code

export default function DetailsProtected() {
  return (
        <RequireRoleGender allowedRoles={["WARDEN"]} allowedTypes={["HOSTELER"]}>
           <WardenHostelPage/>
        </RequireRoleGender>
       
  );
}