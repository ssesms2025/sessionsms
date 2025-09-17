import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";



export async function DELETE(req:Request) {
    try {
        const body = await req.json();
        const {id} = await body;
        if (!id) {
            return NextResponse.json(
              { error: "Attendance ID is required" },
              { status: 400 }
            );
          }
        await prisma.attendence.delete({
            where:{id},
        });
        return NextResponse.json(
            { message: "Attendance deleted successfully" },
            { status: 200 }
          );
        } catch (err) {
          console.error("❌ Error deleting attendance:", err);
          return NextResponse.json(
            { error: "Failed to delete attendance" },
            { status: 500 }
          );
        }
      }