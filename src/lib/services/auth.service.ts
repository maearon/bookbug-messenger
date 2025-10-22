import { tokenService, userService } from "@/lib/services";
import Token from "@/models/token.model";
import { tokenTypes } from "@/config/tokens";
import ApiError from "@/lib/utils/ApiError";

/**
 * Login with username and password
 */
export async function loginUserWithEmailAndPassword(email: string, password: string) {
  const user = await userService.getUserByEmail(email);
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(401, "Incorrect email or password");
  }
  return user;
}

/**
 * Logout
 */
export async function logout(refreshToken: string) {
  const refreshTokenDoc = await Token.findOne({
    token: refreshToken,
    type: tokenTypes.REFRESH,
    blacklisted: false,
  });
  if (!refreshTokenDoc) {
    throw new ApiError(404, "Not found");
  }
  await refreshTokenDoc.deleteOne();
}

/**
 * Refresh auth tokens
 */
export async function refreshAuth(refreshToken: string) {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.user);
    if (!user) throw new Error("User not found");
    await refreshTokenDoc.deleteOne();
    return tokenService.generateAuthTokens(user);
  } catch (err) {
    console.log(err);
    throw new ApiError(401, "Please authenticate");
  }
}

/**
 * Reset password
 */
export async function resetPassword(resetPasswordToken: string, newPassword: string) {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);
    const user = await userService.getUserById(resetPasswordTokenDoc.user);
    if (!user) throw new Error("User not found");
    await userService.updateUserById(user.id, { password: newPassword });
    await Token.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
  } catch (err) {
    console.log(err);
    throw new ApiError(401, "Password reset failed");
  }
}

/**
 * Verify email
 */
export async function verifyEmail(verifyEmailToken: string) {
  try {
    const verifyEmailTokenDoc = await tokenService.verifyToken(verifyEmailToken, tokenTypes.VERIFY_EMAIL);
    const user = await userService.getUserById(verifyEmailTokenDoc.user);
    if (!user) throw new Error("User not found");
    await Token.deleteMany({ user: user.id, type: tokenTypes.VERIFY_EMAIL });
    await userService.updateUserById(user.id, { isEmailVerified: true });
  } catch (err) {
    console.log(err);
    throw new ApiError(401, "Email verification failed");
  }
}

const authService = {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  resetPassword,
  verifyEmail,
};

export default authService;
