import httpStatus from 'http-status';
import { User } from '@/models/index';
import ApiError from '@/utils/ApiError';
import { removeVietnameseTones } from "@/utils/textUtils";

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email has already been taken');
  }
  return User.create(userBody);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * ✅ Check if a user exists with a specific email
 * (Giữ kiểu trả về tương thích với Drizzle: mảng có thể rỗng hoặc chứa 1 object)
 * @param {string} email
 * @returns {Promise<Array<User>>}
 */
const checkUserExistsWithEmail = async (email) => {
  const user = await User.findOne({ email }).lean();
  return user ? [user] : [];
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};

/**
 * Search users by keyword (case-insensitive, partial match)
 * @param {string} keyword
 * @returns {Promise<Array<User>>}
 */

const searchUsersByKeyword = async (keyword) => {
  if (!keyword || typeof keyword !== "string") return [];

  const normalized = removeVietnameseTones(keyword).toLowerCase();
  const regex = new RegExp(normalized, "i");

  // Lấy tất cả user, normalize rồi lọc (cách 1: với DB ít)
  // Hoặc dùng MongoDB $or (cách 2: hiệu quả hơn nếu DB lớn)
  return User.aggregate([
    {
      $addFields: {
        normalizedName: {
          $function: {
            body: function (name) {
              if (!name) return "";
              return name
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase();
            },
            args: ["$name"],
            lang: "js"
          }
        },
        normalizedEmail: {
          $toLower: "$email"
        }
      }
    },
    {
      $match: {
        $or: [
          { normalizedName: { $regex: regex } },
          { normalizedEmail: { $regex: regex } }
        ]
      }
    }
  ]);
};

const userService = { 
  createUser, 
  queryUsers, 
  getUserById, 
  getUserByEmail, 
  checkUserExistsWithEmail,
  updateUserById, 
  deleteUserById,
  searchUsersByKeyword,
};

export default userService;
