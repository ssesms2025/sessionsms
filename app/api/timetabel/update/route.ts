import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { department, year, semsister, period } = body;

    const updated = await prisma.timetabel.update({
      where: {
        department_year_semsister: {
          department,
          year,
          semsister,
        },
      },
      data: { period },
    });

    return NextResponse.json({ message: "Updated successfully", updated });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Timetable not found or error updating" }, { status: 500 });
  }
}
