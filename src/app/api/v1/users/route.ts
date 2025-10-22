import { withAuth } from "@/middlewares/auth.js";
import httpStatus from "http-status";
import { connectToDatabase } from "@/lib/mongoose";
import { NextResponse } from "next/server";
import pick from "@/utils/pick.js";
import { userService } from "@/lib/services";
import type { NextRequest } from "next/server"

async function getUsers(req: NextRequest) {
  await connectToDatabase();
  try {
    const searchParams = req.nextUrl.searchParams;

    const filter = pick(Object.fromEntries(searchParams), ["name", "role"]);

    const options = pick(Object.fromEntries(searchParams), [
      "sortBy",
      "limit",
      "page",
    ]);
    
    const result = await userService.queryUsers(filter, options);

    return new NextResponse(result, { status: httpStatus.OK });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Get Users failed";

    return NextResponse.json(
      { message },
      { status: httpStatus.BAD_REQUEST }
    );
  }
}

export const GET = withAuth(getUsers, ["getUsers"]);