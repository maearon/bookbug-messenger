"use client"

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import javaService from "@/api/services/javaService";
import { CheckCircle, Loader2, AlertTriangle } from "lucide-react"; // hoặc Radix icon nếu thích

const VerifyEmailPage = () => {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const t = searchParams.get("token");
    setToken(t);
    setReady(true);
  }, [searchParams]);

  useEffect(() => {
    if (ready && !token) {
      // router.replace("/login");
      alert(`❌ Failed to get token from url. Please check your url in email reset token=${token}.`);
    }
  }, [ready, token, router]);

  useEffect(() => {
    if (!ready) return;

    if (!token) {
      alert("❌ Invalid activation link");
      setStatus("error");
      // router.push("/");
      return;
    }

    const activate = async () => {
      try {
        const res = await javaService.activateAccount(token);
        if (res?._status === 200) {
          alert("✅ Verify email successfully.");
          setStatus("success");
          setTimeout(() => {
            router.push("/login");
          }, 3000);
        } else if (res?._status === 400) {
          alert("❌ Verify email failed.");
        } else if (res?.message) {
          alert(`✅ ${res.message}`);
          setStatus("success");
          // setTimeout(() => {
          //   router.push("/login");
          // }, 3000);
        } else {
          alert("⚠️ Something went wrong.");
        }
      } catch (error) {
        console.error("Activation Error:", error);
        alert("❌ Account activation failed. Please try again.");
        setStatus("error");
        // router.push("/");
      } finally {
        // alert("❌ Password reset failed.");
        // alert("⚠️ Something went wrong.");
      }
    };

    activate();
  }, [ready, token, router]);

  if (!ready) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6">
        <Loader2 className="text-purple-600 size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="max-w-md text-center bg-background p-8 rounded-2xl shadow-xl space-y-4 border">
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto h-12 w-12 text-gray-600 dark:text-white animate-spin" />
            <h2 className="text-xl font-semibold text-gray-700">Activating your account...</h2>
            <p className="text-base text-gray-500">Please wait while we process your activation.</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="text-xl font-semibold text-green-600">Account Activated</h2>
            <p className="text-base text-gray-500">Redirecting to login page...</p>
          </>
        )}

        {status === "error" && (
          <>
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="text-xl font-semibold text-red-600">Activation Failed</h2>
            <p className="text-base text-gray-500">We couldn’t activate your account. Please try again later.</p>
          </>
        )}
      </div>
    </div>
  );
}

export default VerifyEmailPage;

