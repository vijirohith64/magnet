@@ -2,6 +2,9 @@ import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Review from "@/lib/models/Review"

// -------------------------
// POST (submit a review)
// -------------------------
export async function POST(request: NextRequest) {
  try {
    await dbConnect()
@@ -55,32 +58,20 @@ export async function POST(request: NextRequest) {
  }
}

// -------------------------
// GET (fetch reviews)
// -------------------------
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!process.env.ADMIN_SECRET) {
      throw new Error("ADMIN_SECRET not configured")
    }
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 401 }
      )
    }

    await dbConnect()
    const reviews = await Review.find({}).sort({ submittedAt: -1 }).lean()

    // Simple public fetch (like your snippet)
    const reviews = await Review.find().sort({ submittedAt: -1 }).lean()

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        total: reviews.length,
        pending: reviews.filter((r) => r.status === "pending").length,
        reviewed: reviews.filter((r) => r.status === "reviewed").length,
        resolved: reviews.filter((r) => r.status === "resolved").length,
      },
      data: reviews,
      total: reviews.length,
    })
  } catch (error) {
    console.error("Error fetching reviews:", error)
@@ -90,4 +81,3 @@ export async function GET(request: NextRequest) {
    )
  }
}
