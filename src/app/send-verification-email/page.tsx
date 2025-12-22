"use client";

import { useAuthStore } from "@/stores/useAuthStore";
// import type { Metadata } from "next";
import { redirect, useRouter } from "next/navigation";
import { ResendVerificationButton } from "./resend-verification-button";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
// export const metadata: Metadata = {
//   title: "Verify Email",
// };

export default function SendVerificationEmailPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  // if (!user) redirect("/signin");

  return (
    <main className="flex flex-1 items-center justify-center px-4 text-center">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Back</h1>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Verify your email</h1>
          <p className="text-muted-foreground">
            A verification email was sent to your inbox.
          </p>
        </div>
        <ResendVerificationButton emailProp={user?.email || ""} />
      </div>
    </main>
  );
}