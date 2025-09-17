import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: "ADMIN" | "STUDENT" | "WARDEN"|"WATCHMAN"|"SUPER";
    gender: "MALE" | "FEMALE";
    type: "HOSTELER" | "DAY_SCHOLAR";
    department: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: "ADMIN" | "STUDENT" | "WARDEN"|"WATCHMAN"|"SUPER";
      gender: "MALE" | "FEMALE";
      type: "HOSTELER" | "DAY_SCHOLAR";
      department: string;
    };
  }

  interface JWT {
    id: string;
    role: "ADMIN" | "STUDENT" | "WARDEN"|"WATCHMAN"|"SUPER";
    gender: "MALE" | "FEMALE";
    type: "HOSTELER" | "DAY_SCHOLAR";
    department: string;
  }
}
