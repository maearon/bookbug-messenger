import { withAuth } from "@/middlewares/auth.js";
import httpStatus from "http-status";
import { connectToDatabase } from "@/lib/mongoose";
import { NextResponse } from "next/server";
import ApiError from "@/utils/ApiError.js";
import { userService } from "@/lib/services";
import type { NextRequest } from "next/server";

async function getUser(req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    await connectToDatabase();

    const { userId } = params;
    if (!userId) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Missing userId parameter");
    }

    const user = await userService.getUserById(userId);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    return NextResponse.json(user, { status: httpStatus.OK });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Get User failed";

    return NextResponse.json(
      { message },
      { status: httpStatus.BAD_REQUEST }
    );
  }
}

export const GET = withAuth(getUser, ["getUsers"]);

export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } }
) {
  await connectToDatabase();
  try {
    const { name }: { name: string } = await req.json();

    const user = await userService.updateUserById(params.userId, { name });

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Login failed";

    return NextResponse.json(
      { message },
      { status: 400 }
    );
  }
}