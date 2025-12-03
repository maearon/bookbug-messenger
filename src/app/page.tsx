"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MessageCircle, Users, Zap, Shield } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth/auth-context"
import ChatWidget from "@/components/chat/ChatWidget"

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // useEffect(() => {
  //   if (!isLoading && user) {
  //     router.push(`/e2ee/t/${user?.id ?? "YnhAyaqjpK7Z7SCs0FWO1M2CuhSBhD1h"}`)
  //   }
  // }, [user, isLoading, router])

  // if (isLoading) {
  //   return (
  //     <div className="flex h-screen items-center justify-center">
  //       <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
  //     </div>
  //   )
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500 to-fuchsia-500 shadow-2xl">
            <MessageCircle className="h-12 w-12 text-white" />
          </div>
          <h1 className="mb-4 text-balance text-5xl font-bold tracking-tight text-gray-900 md:text-6xl lg:text-7xl">
            Chào mừng đến với{" "}
            <span className="bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">Moji</span>
          </h1>
          <p className="mb-8 max-w-2xl text-pretty text-lg text-gray-600 md:text-xl">
            Kết nối với bạn bè, chia sẻ khoảnh khắc và trò chuyện theo thời gian thực. Trải nghiệm nhắn tin hiện đại với
            phong cách riêng.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-8 text-lg font-semibold text-white hover:from-purple-700 hover:to-fuchsia-700"
            >
              <Link href="/register">Bắt đầu ngay</Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="h-12 rounded-xl border-2 border-purple-600 bg-transparent px-8 text-lg font-semibold text-purple-600 transition-colors duration-200 hover:bg-purple-100"
            >
              <Link href="/login">Đăng nhập</Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center rounded-2xl bg-white p-8 text-center shadow-lg">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-500">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">Nhắn tin thời gian thực</h3>
            <p className="text-gray-600">
              Gửi và nhận tin nhắn ngay lập tức với hệ thống chat thời gian thực siêu nhanh.
            </p>
          </div>
          <div className="flex flex-col items-center rounded-2xl bg-white p-8 text-center shadow-lg">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-500">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">Quản lý bạn bè</h3>
            <p className="text-gray-600">
              Kết nối với bạn bè, quản lý lời mời và xem ai đang trực tuyến theo thời gian thực.
            </p>
          </div>
          <div className="flex flex-col items-center rounded-2xl bg-white p-8 text-center shadow-lg">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-500">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">An toàn & Bảo mật</h3>
            <p className="text-gray-600">
              Cuộc trò chuyện của bạn được bảo vệ bằng mã hóa và bảo mật tiêu chuẩn ngành.
            </p>
          </div>
        </div>
      </div>

      <ChatWidget />
    </div>
  )
}
