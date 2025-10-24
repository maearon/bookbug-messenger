import httpStatus from "http-status";
import { connectToDatabase } from "@/lib/mongoose";
import { NextResponse } from "next/server";
import { authService } from "@/lib/services"; // đường dẫn tương ứng

export async function POST(req: Request) {
  await connectToDatabase();
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { message: "Missing token in query" },
        { status: httpStatus.BAD_REQUEST }
      );
    }

    await authService.verifyEmail(token);

    return NextResponse.json({ message: "The account has been activated. Please log in." }, { status: httpStatus.OK });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Verify email failed";

    return NextResponse.json(
      { message },
      { status: httpStatus.BAD_REQUEST }
    );
  }
}