// app/api/attendence/student/[id]/route.ts
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    // Extract the student ID from the URL
    const url = new URL(req.url);
    const segments = url.pathname.split("/");
    const id = segments[segments.length - 1]; // last segment is the dynamic [id]

    if (!id) {
      return NextResponse.json({ error: "Missing student ID" }, { status: 400 });
    }

    const attendance = await prisma.attendence.findMany({
      where: { attendenceId: id },
    });

    if (!attendance || attendance.length === 0) {
      return NextResponse.json({ error: "No attendance found" }, { status: 404 });
    }

    return NextResponse.json(attendance);
  } catch (err) {
    console.error("Error fetching attendance:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
