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

    const body = await req.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { message: "Missing password in body" },
        { status: httpStatus.BAD_REQUEST }
      );
    }

    await authService.resetPassword(token, password);

    return NextResponse.json({ message: "Password reset successfully" }, { status: httpStatus.OK });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Login failed";

    return NextResponse.json(
      { message },
      { status: httpStatus.BAD_REQUEST }
    );
  }
}