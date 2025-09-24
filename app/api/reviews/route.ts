import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Review from "@/lib/models/Review"

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const { name, email, gender, department, complaint } = body

    if (!name || !email || !gender || !department || !complaint) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    const review = new Review({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      gender: gender.trim(),
      department: department.trim(),
      complaint: complaint.trim(),
      ipAddress: request.ip || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    })

    const result = await review.save()

    return NextResponse.json(
      {
        success: true,
        message: "Review submitted successfully",
        id: result._id,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error submitting review:", error)
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const validAdminKey = process.env.ADMIN_SECRET || "Dsu020311"

    if (!authHeader || authHeader !== `Bearer ${validAdminKey}`) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
    }

    await dbConnect()
    const reviews = await Review.find({}).sort({ submittedAt: -1 }).lean()

    return NextResponse.json({
      reviews,
      total: reviews.length,
      pending: reviews.filter((r) => r.status === "pending").length,
      reviewed: reviews.filter((r) => r.status === "reviewed").length,
      resolved: reviews.filter((r) => r.status === "resolved").length,
    })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}
