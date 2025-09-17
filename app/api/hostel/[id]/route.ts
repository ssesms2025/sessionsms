import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
// GET all hostel submissions for a student
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split("/"); 
    const id = parts[parts.length - 1]; 

    const hostels = await prisma.hostel.findMany({
      where: { hostelId: id }, 
    });

    return NextResponse.json(hostels);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch hostel submissions" },
      { status: 500 }
    );
  }
}

// PUT to update 'submit' (admin action)
export async function PUT(req: NextRequest) {
  try {
    // ✅ get ID from URL
    const url = new URL(req.url);
    const idStr = url.pathname.split("/").pop();
    if (!idStr) {
      return NextResponse.json({ message: "ID not found" }, { status: 400 });
    }
    const id = parseInt(idStr, 10);

    // ✅ get session user
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // ✅ update with submit + approvedby
    const updated = await prisma.hostel.update({
      where: { id },
      data: {
        submit: body.submit ?? false,
        approvedby: session.user.name || "Unknown",
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("PUT error:", err);
    return NextResponse.json(
      { message: "PUT error", error: err.message },
      { status: 500 }
    );
  }
}

// PATCH to update comeoutTime, comeinTime, returned
export async function PATCH(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const idStr = url.pathname.split("/").pop();
    if (!idStr) return NextResponse.json({ message: "ID not found" }, { status: 400 });

    const id = parseInt(idStr); // Hostel ID is Int
    const body = await req.json();
    const { comeoutTime, comeinTime, returned } = body;

    const updated = await prisma.hostel.update({
      where: { id },
      data: {
        ...(comeoutTime && { comeoutTime: new Date(comeoutTime) }),
        ...(comeinTime && { comeinTime: new Date(comeinTime) }),
        ...(returned !== undefined && { returned }),
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ message: "PATCH error", error: err.message }, { status: 500 });
  }
}
