import { NextResponse } from "next/server";
import httpStatus from "http-status";
import ApiError from "@/utils/ApiError.js";
import { roleRights } from "@/config/roles.js";
import tokenService from "@/lib/services/token.service.js";
import { tokenTypes } from "@/config/tokens.js";
import { User } from "@/models";

/**
 * Middleware xác thực JWT và quyền truy cập
 * @param {Request} req
 * @param {string[]} requiredRights - Các quyền yêu cầu
 * @returns {object} user - thông tin user đã xác thực
 */
export const verifyAuth = async (req, requiredRights = []) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new ApiError(401, "Please authenticate");
  }

  const token = authHeader.split(" ")[1];

  let payload;
  try {
    // ✅ verify token, KHÔNG truyền expiresIn nữa
    payload = await tokenService.verifyJwtPayload(token, tokenTypes.ACCESS);
  } catch (error) {
    console.error("Auth middleware error:", error);
    throw new ApiError(401, "Token invalid or expired");
  }

  // ✅ Lấy user từ MongoDB
  const user = await User.findById(payload.sub);
  if (!user) {
    throw new ApiError(401, "User not found");
  }

  // ✅ Kiểm tra quyền
  if (requiredRights.length) {
    const userRights = roleRights.get(user.role) || [];
    const hasRights = requiredRights.every((r) => userRights.includes(r));

    if (!hasRights) {
      throw new ApiError(403, "Forbidden");
    }
  }

  return user;
};

/**
 * Wrapper dùng trong route để áp dụng middleware xác thực
 * @param {Function} handler - Route handler gốc
 * @param {string[]} rights - Danh sách quyền yêu cầu
 */
export function withAuth(handler, rights = []) {
  return async (req) => {
    try {
      const user = await verifyAuth(req, rights); // ✅ thiếu await ở bản cũ
      req.user = user;
      return await handler(req, user);
    } catch (err) {
      console.error("Auth failed:", err);
      return NextResponse.json(
        { message: err.message || "Authentication failed" },
        { status: err.statusCode || httpStatus.UNAUTHORIZED }
      );
    }
  };
}
