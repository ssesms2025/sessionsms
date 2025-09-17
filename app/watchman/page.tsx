"use client";

import RequireRoleGender from "@/components/RequireRole";
import WatchmanPage from "@/components/Watchman";

 // your existing code

export default function WatchmanProtected() {
  return (
    <RequireRoleGender allowedRoles={["WATCHMAN"]} allowedGenders={["MALE"]}>
       <WatchmanPage/>
    </RequireRoleGender>
       
  );
}