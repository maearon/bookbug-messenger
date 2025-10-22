import { NextResponse } from "next/server";
import httpStatus from "http-status";
import ApiError from "@/utils/ApiError.js";
import { roleRights } from "@/config/roles.js";
import tokenService from "@/lib/services/token.service";
import { tokenTypes } from "@/config/tokens.js";

/**
 * Middleware xác thực JWT và quyền truy cập
 * @param {Request} req
 * @param {string[]} requiredRights - Các quyền yêu cầu
 * @returns {object} payload - thông tin user đã xác thực
 */
export function verifyAuth(req, requiredRights = []) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate");
  }

  const token = authHeader.split(" ")[1];
  let payload;

  try {
    payload = tokenService.verifyToken(token, tokenTypes.ACCESS);
  } catch (error) {
    console.log("Auth middleware error:", error);
    throw new ApiError(httpStatus.UNAUTHORIZED, "Token invalid or expired");
  }

  // Kiểm tra quyền
  if (requiredRights.length) {
    const userRights = roleRights.get(payload.role) || [];
    const hasRequiredRights = requiredRights.every((r) => userRights.includes(r));

    // Nếu user không có quyền, kiểm tra xem có phải chính mình không (ví dụ userId)
    const userId = req.nextUrl?.searchParams?.get("userId");
    if (!hasRequiredRights && userId !== payload.sub) {
      throw new ApiError(httpStatus.FORBIDDEN, "Forbidden");
    }
  }

  return payload;
}

/**
 * Wrapper dùng trong route để áp dụng middleware xác thực
 * @param {Function} handler - Route handler gốc
 * @param {string[]} rights - Danh sách quyền yêu cầu
 */
export function withAuth(handler, rights = []) {
  return async (req) => {
    try {
      const user = verifyAuth(req, rights);
      req.user = user; // lưu user vào req để handler có thể dùng
      return await handler(req, user);
    } catch (err) {
      return NextResponse.json(
        { message: err.message || "Authentication failed" },
        { status: err.statusCode || 401 }
      );
    }
  };
}
