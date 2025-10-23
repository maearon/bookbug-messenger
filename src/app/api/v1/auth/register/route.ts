import httpStatus from "http-status";
import { NextResponse } from "next/server";
import { userService, tokenService } from "@/lib/services";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const user = await userService.createUser(data);
    const tokens = await tokenService.generateAuthTokens(user);
    return NextResponse.json({ user, tokens }, { status: httpStatus.CREATED });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Signup failed";

    return NextResponse.json(
      { message },
      { status: httpStatus.BAD_REQUEST }
    );
  }
}
