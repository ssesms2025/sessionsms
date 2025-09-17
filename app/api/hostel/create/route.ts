import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
      const body = await req.json();
      const { reason, village, number, photo, duration, submit, returned, userId } = body;
  
      if (
        !reason ||
        !village ||
        !number ||
        !photo ||
        !duration ||
        submit === undefined ||
        returned === undefined ||
        !userId
      ) {
        return NextResponse.json({ error: "Fill all the required forms" }, { status: 400 });
      }
  
      const hostel = await prisma.hostel.create({
        data: {
          reason,
          village,
          number,
          photo,
          duration,
          submit,
          returned,
          hostel: { connect: { id: userId } },
        },
      });
  
      console.log("New hostel record created:", hostel);
  
      return NextResponse.json(hostel, { status: 200 });
    } catch (error) {
      console.error("Error creating hostel record:", error);
      return NextResponse.json({ error: "Failed to create hostel complaint" }, { status: 500 });
    }
  }
  


export async function GET() {
  try {
    const hostels= await prisma.hostel.findMany({
      include: {
        hostel: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    console.log(" Students fetched:", hostels.length);
    return NextResponse.json(hostels);
  } catch (error) {
    console.error(" Error fetching students:", error);
    return NextResponse.json({ message: "Failed to fetch" }, { status: 500 });
  }    
}