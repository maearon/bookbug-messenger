"use client"

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "../ui/label";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import Link from "next/link";
import Image from "next/image";

const signInSchema = z.object({
  username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export function SigninForm({ className, ...props }: React.ComponentProps<"div">) {
  const t = useTranslations("auth");
  const { signIn } = useAuthStore();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormValues) => {
    try {
      const { username, password } = data;

      await signIn(username, password);

      // ✅ CHỈ redirect khi login thành công
      router.push("/");
    } catch (err: any) {
      /**
       * Backend thường trả:
       * { message: "Sai tên đăng nhập hoặc mật khẩu" }
       * hoặc store throw new Error(message)
       */
      setError("root", {
        type: "server",
        message: err?.message || "Đăng nhập thất bại",
      });
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border-border">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">

              {/* header */}
              <div className="flex flex-col items-center text-center gap-2">
                <Link href="/" className="mx-auto block w-fit text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-500">
                    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  </div>
                </Link>

                <h1 className="text-2xl font-bold">Chào mừng quay lại</h1>
                <p className="text-muted-foreground">
                  Đăng nhập vào tài khoản Moji của bạn
                </p>
              </div>

              {/* 🔴 ERROR API (GLOBAL) */}
              {errors.root && (
                <p className="text-sm text-red-500 text-center">
                  {errors.root.message}
                </p>
              )}

              {/* username */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="username">Tên đăng nhập</Label>
                <Input
                  id="username"
                  placeholder="moji"
                  {...register("username")}
                />
                {errors.username && (
                  <p className="text-destructive text-sm">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* password */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className="pr-20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2 text-muted-foreground text-xs"
                  >
                    {showPassword ? (
                      <>
                        <EyeOff className="inline-block w-4 h-4 mr-1" />{" "}
                        {t?.hide || "HIDE"}
                      </>
                    ) : (
                      <>
                        <Eye className="inline-block w-4 h-4 mr-1" />{" "}
                        {t?.show || "SHOW"}
                      </>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-destructive text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={isSubmitting}>
                Đăng nhập
              </Button>

              <div className="text-center text-sm">
                Chưa có tài khoản?{" "}
                <Link href="/signup" className="underline">
                  Đăng ký
                </Link>
              </div>
            </div>
          </form>

          <div className="bg-muted relative hidden md:block">
            <Image
              src="/modern-login-illustration-with-people-and-mobile-app.jpg"
              alt="Image"
              className="object-cover"
              fill
              priority
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
