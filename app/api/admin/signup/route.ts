import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Ensure array
    const users = Array.isArray(body) ? body : [body];
    if (!users.length) {
      return NextResponse.json({ message: "No users provided" }, { status: 400 });
    }

    // 🔑 Prepare users
    const preparedUsers = await Promise.all(
      users.map(async (u) => {
        const { email, password, role, name, department, gender, type } = u;

        if (!name || !email || !password || !role || !department || !gender || !type) {
          throw new Error(`Missing fields for user: ${email || "unknown"}`);
        }

        const hashed = await bcrypt.hash(password, 10);

        return {
          name,
          email,
          role: role.toUpperCase(),
          department,
          gender: gender.toUpperCase(),
          type: type.replace("-", "_").toUpperCase(),
          hashedPassword: hashed,
        };
      })
    );

    // Bulk insert (skip duplicates to avoid errors)
    const result = await prisma.user.createMany({
      data: preparedUsers,
      skipDuplicates: true, // ✅ avoids error if email already exists
    });

    return NextResponse.json(
      { message: "Users inserted successfully", count: result.count },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
