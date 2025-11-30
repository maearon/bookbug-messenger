import api from "@/api/client";

export const authService = {
  signUp: async (
    username: string,
    password: string,
    email: string,
    firstName: string,
    lastName: string
  ) => {
    const res = await api.post(
      "/v1/auth/register",
      { fullName: firstName + lastName, email, password }
    );

    return res.data;
  },

  signIn: async (email: string, password: string) => {
    const res = await api.post(
      "/v1/auth/login",
      { email, password }
    );
    return {
      user: res.data.user,
      accessToken: res.data.tokens.access.token,
      refreshToken: res.data.tokens.refresh.token,
    };
  },

  signOut: async (refreshToken: string) => {
    return api.post(
      "/v1/auth/logout",
      { refreshToken }
    );
  },

  fetchMe: async () => {
    const res = await api.get("/v1/auth/me");
    return res.data.user;
  },

  refresh: async (refreshToken: string) => {
    const res = await api.post(
      "/v1/auth/refresh-tokens",
      { refreshToken }
    );
    return res.data.accessToken;
  },
};