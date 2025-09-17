"use client";
import { ReactNode, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface RequireRoleGenderProps {
  children: ReactNode;
  allowedRoles: ("ADMIN" | "STUDENT" | "WARDEN" | "WATCHMAN" | "SUPER")[];
  allowedGenders?: ("MALE" | "FEMALE")[];
  allowedTypes?: ("HOSTELER" | "DAY_SCHOLAR")[];
}

export default function RequireRoleGender({
  children,
  allowedRoles,
  allowedGenders,
  allowedTypes,
}: RequireRoleGenderProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (
      !loading &&
      (!user ||
        !allowedRoles.includes(user.role) ||
        (allowedGenders && user.gender && !allowedGenders.includes(user.gender)) ||
        (allowedTypes && user.type && !allowedTypes.includes(user.type)))
    ) {
      router.push("/unauthorized");
    }
  }, [user, loading, router, allowedRoles, allowedGenders, allowedTypes]);

  if (loading || !user) return <p>Loading...</p>;

  return <>{children}</>;
}
