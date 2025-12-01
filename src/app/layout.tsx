import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"
import { SocketProvider } from "@/lib/socket/socket-context"
import { AuthProvider } from "@/lib/auth/auth-context"
import { ReduxProvider } from "@/providers/redux-provider"
import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"

export const metadata: Metadata = {
  title: "Moji - Modern Chat App",
  description: "Connect with friends through Moji chat",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}
      >
        {/* ThemeProvider phải nằm ngoài Suspense */}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ReduxProvider>
            <SocketProvider>
              <AuthProvider>
                <Suspense fallback={<div>Loading...</div>}>
                  {children}
                </Suspense>
                <Toaster richColors />
              </AuthProvider>
            </SocketProvider>
          </ReduxProvider>
        </ThemeProvider>

        <Analytics />
      </body>
    </html>
  )
}
