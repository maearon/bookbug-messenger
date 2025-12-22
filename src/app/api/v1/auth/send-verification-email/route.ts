export const runtime = "nodejs";
import { withAuth } from "@/middlewares/auth.js";
import httpStatus from "http-status";
import { connectToDatabase } from "@/lib/mongoose";
import { NextResponse } from "next/server";
import { tokenService, emailService, authService, userService } from "@/lib/services";
import type { NextRequest } from "next/server";

async function sendVerificationEmail(req: NextRequest, 
  // user?: { id: string; email: string; name: string }
  // { params }: { params: { resend_activation_email: { email: string } } }
) {
  await connectToDatabase();

  try {
    const body = await req.json();

    const email = body?.resend_activation_email?.email;

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: httpStatus.BAD_REQUEST }
      );
    }

    console.log("Sending verification email to:", email);
    // console.log("Sending verification email to:", params);
    const userFind = await userService.getUserByEmail(email);
    const verifyEmailToken = await tokenService.generateVerifyEmailToken(userFind);

    await emailService.sendVerificationEmail(email, verifyEmailToken);

    return new NextResponse(null, { status: httpStatus.NO_CONTENT });
  } catch (error) {
    console.error("Error sending verification email:", error);

    const message =
      error instanceof Error ? error.message : "Send Verification Email failed";

    return NextResponse.json(
      { message },
      { status: httpStatus.BAD_REQUEST }
    );
  }
}

export const POST = sendVerificationEmail;
// withAuth(sendVerificationEmail, 
//   // []
// );
