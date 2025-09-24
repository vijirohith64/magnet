import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"

export async function GET() {
  try {
    await dbConnect()
    return NextResponse.json({
      message: "Connected to MongoDB successfully!",
      status: "success",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("MongoDB connection error:", error)
    return NextResponse.json(
      {
        message: "Failed to connect to MongoDB",
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
