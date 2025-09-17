import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(req:Request) {
    try {
        const body = await req.json();
        const { id , monthh,percentage} = body;
        if(!id){
            return NextResponse.json(
                { error: "Attendance ID is required" },
                { status: 400 }
            )
        }
        const updated = await prisma.attendence.update({
            where:{id},
            data:{
                ...(monthh && {monthh}),
                ...(percentage && {percentage}),
            },
        });
        return NextResponse.json(
            { message: "Attendance updated successfully", updated },
            { status: 200 }
          );
        } catch (err) {
          console.error("❌ Error updating attendance:", err);
          return NextResponse.json(
            { error: "Failed to update attendance" },
            { status: 500 }
          );
        }
      }