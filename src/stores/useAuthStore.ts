import { create } from "zustand"
import { toast } from "sonner"
import { authService } from "@/api/services/authService"
import type { AuthState } from "@/types/store"
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "@/lib/token"

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: getAccessToken(), // ⚡ lấy ngay từ local/session
  refreshToken: getRefreshToken(),
  user: null,
  loading: false,

  setAccessToken: (accessToken) => {
    setTokens(accessToken, get().refreshToken ?? "", true)
    set({ accessToken })
  },

  setRefreshToken: (refreshToken) => {
    setTokens(get().accessToken ?? "", refreshToken, true)
    set({ refreshToken })
  },

  clearState: () => {
    clearTokens()
    set({ accessToken: null, refreshToken: null, user: null, loading: false })
  },

  /** -----------------------------------------------------------
   * SIGN UP
   * ----------------------------------------------------------- */
  signUp: async (username, password, email, firstName, lastName) => {
    try {
      set({ loading: true })
      await authService.signUp(username, password, email, firstName, lastName)
      toast.success("Đăng ký thành công! Bạn sẽ được chuyển sang trang đăng nhập.")
    } catch (error) {
      console.error(error)
      toast.error("Đăng ký không thành công")
    } finally {
      set({ loading: false })
    }
  },

  /** -----------------------------------------------------------
   * SIGN IN
   * ----------------------------------------------------------- */
  signIn: async (email, password) => {
    try {
      set({ loading: true })

      const { user, accessToken, refreshToken } = await authService.signIn(email, password)

      // 🔥 lưu token vào storage (local hoặc session)
      setTokens(accessToken, refreshToken, true)

      set({ user, accessToken, refreshToken })

      toast.success("Chào mừng bạn quay lại với Moji 🎉")
    } catch (error) {
      console.error(error)
      toast.error("Đăng nhập không thành công!")
    } finally {
      set({ loading: false })
    }
  },

  /** -----------------------------------------------------------
   * SIGN OUT
   * ----------------------------------------------------------- */
  signOut: async () => {
    try {
      const refreshToken = get().refreshToken
      
      if (refreshToken) {
        await authService.signOut(refreshToken)
      }
      toast.success("Logout thành công!", { duration: 4000 })

      // Đợi UI kịp render toast rồi mới xóa state
      setTimeout(() => {
        get().clearState()
      }, 4000)
    } catch (error) {
      console.error(error)
      toast.error("Lỗi xảy ra khi logout. Hãy thử lại!")
    }
  },

  /** -----------------------------------------------------------
   * FETCH ME — LẤY USER TỪ API (NHƯNG KHÔNG GỌI NẾU KO CÓ TOKEN)
   * ----------------------------------------------------------- */
  fetchMe: async () => {
    try {
      const token = getAccessToken()
      if (!token) return

      set({ loading: true })
      const user = await authService.fetchMe()

      set({ user })
    } catch (error) {
      console.error(error)
      get().clearState()
      toast.error("Phiên đăng nhập hết hạn. Hãy đăng nhập lại!")
    } finally {
      set({ loading: false })
    }
  },

  /** -----------------------------------------------------------
   * REFRESH TOKEN
   * ----------------------------------------------------------- */
  refresh: async () => {
    try {
      const refreshToken = getRefreshToken()
      if (!refreshToken) throw new Error("Missing refresh token")

      set({ loading: true })

      const newAccessToken = await authService.refresh(refreshToken)

      // 🔥 lưu lại access token mới
      setTokens(newAccessToken, refreshToken, true)
      set({ accessToken: newAccessToken })

      if (!get().user) {
        await get().fetchMe()
      }
    } catch (error) {
      console.error(error)
      toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!")
      get().clearState()
    } finally {
      set({ loading: false })
    }
  },
}))
