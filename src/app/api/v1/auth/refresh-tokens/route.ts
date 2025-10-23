import { connectToDatabase } from "@/lib/mongoose";
import { NextResponse } from "next/server";
import { authService } from "@/lib/services"; // đường dẫn tương ứng

export async function POST(req: Request) {
  await connectToDatabase();
  try {
    const { refreshToken }: { refreshToken: string } = await req.json();
    const tokens = await authService.refreshAuth(refreshToken);
    return NextResponse.json(tokens, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Refresh Token failed";

    return NextResponse.json(
      { message },
      { status: 400 }
    );
  }
}