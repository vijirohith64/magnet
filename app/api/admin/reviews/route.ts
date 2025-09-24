import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Review from "@/lib/models/Review"

export async function PATCH(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get("authorization")
    const validAdminKey = process.env.ADMIN_SECRET || "Dsu020311"

    if (!authHeader || authHeader !== `Bearer ${validAdminKey}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { reviewId, status } = await request.json()

    if (!reviewId || !status) {
      return NextResponse.json({ error: "Review ID and status are required" }, { status: 400 })
    }

    await dbConnect()

    const result = await Review.findByIdAndUpdate(
      reviewId,
      {
        status,
        updatedAt: new Date(),
      },
      { new: true },
    )

    if (!result) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating review:", error)
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 })
  }
}
