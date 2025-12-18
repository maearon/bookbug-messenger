import api from "@/lib/axios";
import { Friend } from "@/types/user";

export const friendService = {
  async searchByUsername(username: string) {
    const res = await api.get(`/users/search?username=${username}`);
    return res.data.user;
  },

  async sendFriendRequest(to: string, message?: string) {
    const res = await api.post("/friends/requests", { to, message });
    return res.data.message;
  },

  async getAllFriendRequest() {
    try {
      const res = await api.get("/friends/requests");
      const { sent, received } = res.data;
      return { sent, received };
    } catch (error) {
      console.error("Lỗi khi gửi getAllFriendRequest", error);
    }
  },

  async acceptRequest(requestId: string) {
    try {
      const res = await api.post(`/friends/requests/${requestId}/accept`);
      return res.data.requestAcceptedBy;
    } catch (error) {
      console.error("Lỗi khi gửi acceptRequest", error);
    }
  },

  async declineRequest(requestId: string) {
    try {
      await api.post(`/friends/requests/${requestId}/decline`);
    } catch (error) {
      console.error("Lỗi khi gửi declineRequest", error);
    }
  },

  async getFriendList() {
    const res = await api.get("/friends");
    return res.data.friends;
  },

  /**
   * GET /friends/dialog
   * - Nếu không truyền q → trả về toàn bộ friend list
   * - Nếu truyền q → backend sẽ filter theo q
   */
  getFriendsDialog: async (q?: string): Promise<{ friends: Friend[] }> => {
    const res = await api.get("/friends/dialog", {
      params: q ? { q } : {},
    });

    return res.data;
  },

  /**
   * GET /friends/suggestions
   * - Nếu không truyền q → trả về toàn bộ friends suggestions list
   * - Nếu truyền q → backend sẽ filter theo q
   */
  getFriendsSuggestionsDialog: async (q?: string): Promise<{ friends: Friend[] }> => {
    const res = await api.get("/friends/suggestions", {
      params: q ? { q } : {},
    });

    return res.data;
  },

  getFriendRequests: async () => {
    const res = await api.get("/friends/requests/dialog");
    return res.data;
  },

  responseFriendRequest: async (id: string, action: string) => {
    const res = await api.post(`/friends/requests/${id}/${action}/dialog`);
    return res.data;
  },
};
