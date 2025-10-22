import { connectToDatabase } from "@/lib/mongoose";
import { NextResponse } from "next/server";
import { authService, tokenService } from "@/lib/services"; // đường dẫn tương ứng

export async function POST(req: Request) {
  await connectToDatabase();
  try {
    const { email, password }: { email: string; password: string } = await req.json();

    const user = await authService.loginUserWithEmailAndPassword(email, password);
    const tokens = await tokenService.generateAuthTokens(user);

    return NextResponse.json({ user, tokens }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Login failed";

    return NextResponse.json(
      { message },
      { status: 400 }
    );
  }
}
