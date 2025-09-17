// app/api/student/me/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const student = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        complaintsAsStudent: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            photo: true,
            reason: true,
            createdAt: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (err) {
    console.error("❌ Error fetching student:", err);
    return NextResponse.json({ error: "Failed to fetch student" }, { status: 500 });
  }
}
