import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from "axios"
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "@/lib/token"
import { Nullable } from "@/types/common"
import { useAuthStore } from "@/stores/useAuthStore";

// // Base URL config
// const BASE_URL = process.env.NODE_ENV === "development"
//   ? "http://localhost:5005/api"
//   // : "https://adidas-microservices.onrender.com/api"
//   // : "https://spring-boilerplate.onrender.com/api"
//   : "https://moji-phi.vercel.app/api"

// // CSRF & credentials setup
// axios.defaults.xsrfCookieName = "CSRF-TOKEN"
// axios.defaults.xsrfHeaderName = "X-CSRF-Token"
// axios.defaults.withCredentials = true

// const api = axios.create({
//   baseURL: BASE_URL,
//   headers: {
//     "Content-Type": "application/json",
//     Accept: "application/json",
//     "x-lang": "EN",
//   },
// })

// // 🔄 Redirect handler
// const dispatchRedirectToLogin = () => {
//   if (typeof window !== "undefined") {
//     window.dispatchEvent(new Event("customRedirectToLogin"))
//   }
// }

// // 🔐 Attach tokens and guest_cart_id
// api.interceptors.request.use(
//   (config: InternalAxiosRequestConfig) => {
//     if (typeof window !== "undefined" && config.headers) {
//       const token = getAccessToken()
//       if (token) {
//         config.headers["Authorization"] = `Bearer ${token}`
//       }

//       const guestCartId =
//         localStorage.getItem("guest_cart_id") ?? sessionStorage.getItem("guest_cart_id")
//       if (guestCartId) {
//         const url = new URL(config.url || "", BASE_URL)
//         if (!url.searchParams.has("guest_cart_id")) {
//           url.searchParams.set("guest_cart_id", guestCartId)
//           config.url = url.pathname + "?" + url.searchParams.toString()
//         }
//       }
//     }
//     return config
//   },
//   (error) => Promise.reject(error),
// )

// // 🔄 Token Refresh Logic
// interface FailedRequest {
//   resolve: (token: string) => void
//   reject: (err: unknown) => void
// }

// let failedQueue: FailedRequest[] = []

// let isRefreshing = false

// const processQueue = (error: unknown, token: Nullable<string> = null): void => {
//   failedQueue.forEach((prom) => {
//     if (error) {
//       prom.reject(error)
//     } else {
//       prom.resolve(token as string)
//     }
//   })
//   failedQueue = []
// }

// api.interceptors.response.use(
//   (response: AxiosResponse) => {
//     if (typeof response.data === "object" && response.data !== null) {
//       return {
//         ...response,
//         _status: response.status,
//       }
//     }
//     return response
//   },
//   async (error) => {
//     const originalRequest = error.config

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true

//       if (isRefreshing) {
//         return new Promise((resolve, reject) => {
//           failedQueue.push({
//             resolve: (token: string) => {
//               originalRequest.headers["Authorization"] = `Bearer ${token}`
//               resolve(api(originalRequest))
//             },
//             reject,
//           })
//         })
//       }

//       isRefreshing = true
//       const refreshToken = getRefreshToken()

//       if (!refreshToken) {
//         clearTokens()
//         dispatchRedirectToLogin()
//         return Promise.reject(error)
//       }

//       try {
//         const res = await axios.post(`${BASE_URL}/refresh`, {
//           refresh_token: refreshToken,
//         })

//         const newToken = res.data.token
//         const newRefresh = res.data.refresh_token
//         const rememberMe = !!localStorage.getItem("token")

//         setTokens(newToken, newRefresh, rememberMe)
//         api.defaults.headers["Authorization"] = `Bearer ${newToken}`
//         processQueue(null, newToken)

//         originalRequest.headers["Authorization"] = `Bearer ${newToken}`
//         return api(originalRequest)
//       } catch (err) {
//         processQueue(err, null)
//         clearTokens()
//         dispatchRedirectToLogin()
//         return Promise.reject(err)
//       } finally {
//         isRefreshing = false
//       }
//     }

//     return Promise.reject(error)
//   }
// )

// export default api

const BASE_URL = process.env.NODE_ENV === "development"
  ? "http://localhost:5005/api"
  // : "https://adidas-microservices.onrender.com/api"
  // : "https://spring-boilerplate.onrender.com/api"
  : "https://node-boilerplate-pww8.onrender.com/v1"

// CSRF & credentials setup
axios.defaults.xsrfCookieName = "CSRF-TOKEN"
axios.defaults.xsrfHeaderName = "X-CSRF-Token"
axios.defaults.withCredentials = true

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "x-lang": "EN",
  },
})

// gắn access token vào req header
api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// tự động gọi refresh api khi access token hết hạn
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // những api không cần check
    if (
      originalRequest.url.includes("/v1/auth/login") ||
      originalRequest.url.includes("/v1/auth/register") ||
      originalRequest.url.includes("/v1/auth/refresh-tokens")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retryCount = originalRequest._retryCount || 0;

    if (error.response?.status === 403 && originalRequest._retryCount < 4) {
      originalRequest._retryCount += 1;

      try {
        const res = await api.post("/v1/auth/refresh-tokens", { withCredentials: true });
        const newAccessToken = res.data.accessToken;

        useAuthStore.getState().setAccessToken(newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearState();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;