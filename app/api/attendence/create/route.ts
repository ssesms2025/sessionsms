import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { attendenceId, monthh, percentage } = body;

    if (!attendenceId || !monthh || !percentage) {
      return NextResponse.json(
        { error: "attendenceId, month and percentage are required" },
        { status: 400 }
      );
    }

    const attendence = await prisma.attendence.create({
      data: {
        attendenceId,
        monthh,
        percentage,
      },
    });

    return NextResponse.json(
      { message: "Attendance created successfully", attendence },
      { status: 201 }
    );
  } catch (err) {
    console.error("❌ Error creating attendance:", err);
    return NextResponse.json(
      { error: "Failed to create attendance" },
      { status: 500 }
    );
  }
}
