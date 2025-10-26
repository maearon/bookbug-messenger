// /app/api/v1/users/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import httpStatus from "http-status";
import { userService } from "@/lib/services";

export async function GET(req: NextRequest) {
  await connectToDatabase();
  try {
    const keyword = req.nextUrl.searchParams.get("q") || "";
    const users = await userService.searchUsersByKeyword(keyword);

    return NextResponse.json({ users }, { status: httpStatus.OK });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: httpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}
