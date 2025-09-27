import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Review from "@/lib/models/Review";

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const { id } = params;

    const deletedReview = await Review.findByIdAndDelete(id);

    if (!deletedReview) {
      return NextResponse.json({ success: false, message: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

