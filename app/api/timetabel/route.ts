import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const department = searchParams.get("department");
    const year = searchParams.get("year");
    const semsister = searchParams.get("semsister");

    if (!department || !year || !semsister) {
      return NextResponse.json(
        { error: "Missing department, year, or semester" },
        { status: 400 }
      );
    }

    const timetable = await prisma.timetabel.findUnique({
      where: {
        department_year_semsister: {
          department,
          year,
          semsister,
        },
      },
    });

    if (!timetable) {
      return NextResponse.json(
        { error: "No timetable found for selected filters" },
        { status: 404 }
      );
    }

    return NextResponse.json(timetable);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
