import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { adminKey } = await request.json()

    const validAdminKey = process.env.ADMIN_SECRET || "Dsu020311"

    if (adminKey === validAdminKey) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Invalid admin key" }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
