import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { department, year, semsister, period } = body;

    // Check existing timetable
    const existing = await prisma.timetabel.findUnique({
      where: {
        department_year_semsister: {
          department,
          year,
          semsister,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Timetable already exists for this Dept/Year/Semester" },
        { status: 400 }
      );
    }

    const timetable = await prisma.timetabel.create({
      data: { department, year, semsister, period },
    });

    return NextResponse.json({ message: "Created successfully", timetable });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
