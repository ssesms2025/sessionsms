import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, role, name, department, gender, type } = body;

    // Validate all fields
    if (!name || !email || !password || !role || !department || !gender || !type) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: "User already exists" }, { status: 409 });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // 🔑 Normalize enum fields
    const prismaRole = role.toUpperCase();     // "student" → "STUDENT"
    const prismaGender = gender.toUpperCase(); // "male" → "MALE"
    const prismaType = type.replace("-", "_").toUpperCase();
    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role: prismaRole,         // must match enum Role
        department,
        gender: prismaGender,     // must match enum Gender
        type:prismaType,
        hashedPassword: hashed,
      },
    });

    return NextResponse.json({ message: "User created successfully", user }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
