import httpStatus from "http-status";
import { connectToDatabase } from "@/lib/mongoose";
import { NextResponse } from "next/server";
import { authService } from "@/lib/services";

export async function POST(req: Request) {
  await connectToDatabase();
  try {
    const { refreshToken } = await req.json();

    await authService.logout(refreshToken);

    return new NextResponse(null, { status: httpStatus.NO_CONTENT });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Logout failed";

    return NextResponse.json(
      { message },
      { status: httpStatus.BAD_REQUEST }
    );
  }
}
