"use client";

import HostelDetailsPage from "@/components/Alldetails";
import RequireRoleGender from "@/components/RequireRole";

 // your existing code

export default function DetailsProtected() {
  return (
    <RequireRoleGender allowedRoles={["ADMIN",'WARDEN']}>
              <HostelDetailsPage/>

    </RequireRoleGender>
  );
}