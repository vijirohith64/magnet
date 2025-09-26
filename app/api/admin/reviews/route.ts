import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Review from "@/lib/models/Review"

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

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        total: reviews.length,
        pending: reviews.filter((r) => r.status === "pending").length,
        reviewed: reviews.filter((r) => r.status === "reviewed").length,
        resolved: reviews.filter((r) => r.status === "resolved").length,
      },
    })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 }
    )
  }
}

