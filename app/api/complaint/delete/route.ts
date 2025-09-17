import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { complaintId } = await req.json();

    console.log("🗑️ Complaint delete request received for ID:", complaintId);

    if (!complaintId) {
      console.error("❌ No complaintId provided");
      return NextResponse.json(
        { error: "complaintId is required" },
        { status: 400 }
      );
    }

    // Delete the complaint
    const deletedComplaint = await prisma.complaint.delete({
      where: { id: complaintId },
    });

    console.log("✅ Complaint deleted:", deletedComplaint);

    return NextResponse.json({ success: true, deletedComplaint });
  } catch (error) {
    console.error("❌ Error deleting complaint:", error);
    return NextResponse.json(
      { error: "Failed to delete complaint" },
      { status: 500 }
    );
  }
}
