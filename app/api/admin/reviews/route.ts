import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Review from "@/lib/models/Review"

// -------------------------
// POST (submit a review)
// -------------------------
export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    const body = await request.json()
    const { name, email, gender, department, complaint } = body

    if (!name || !email || !gender || !department || !complaint) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      )
    }

    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown"

    const review = new Review({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      gender: gender.trim(),
      department: department.trim(),
      complaint: complaint.trim(),
      ipAddress,
      userAgent: request.headers.get("user-agent") || "unknown",
    })

    const result = await review.save()

    return NextResponse.json(
      {
        success: true,
        message: "Review submitted successfully",
        data: { id: result._id },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error submitting review:", error)
    return NextResponse.json(
      { success: false, error: "Failed to submit review" },
      { status: 500 }
    )
  }
}

// -------------------------
// GET (fetch reviews)
// -------------------------
export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    // Simple public fetch (like your snippet)
    const reviews = await Review.find().sort({ submittedAt: -1 }).lean()

    return NextResponse.json({
      success: true,
      data: reviews,
      total: reviews.length,
    })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 }
    )
  }
}
