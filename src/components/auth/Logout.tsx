"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { toast } from "sonner";
import Link from "next/link";
import { Loader2, LogOutIcon } from "lucide-react";
import { LoadingDots } from "../products/enhanced-product-form";
import { Button } from "../ui/button";
import { useAuthStore } from "@/stores/useAuthStore";

export const LogOut = () => {
  const { signOut } = useAuthStore();
  const t = useTranslations("auth");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const signout = async (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await authClient.revokeSessions();
    if (error) {
      toast.error(error.message || "Failed to log out everywhere");
      return;
    }
    await authClient.signOut({
      fetchOptions: {
        onSuccess: async () => {
          router.push("/");
          router.refresh();
          localStorage.clear();
          sessionStorage.clear();
          document.cookie.split(";").forEach((cookie) => {
            const name = cookie.split("=")[0].trim();
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          });
          await signOut();
          setTimeout(() => {
            window.location.href = "/";
          }, 50);
        },
        onError: (err) => {
          console.error("Logout failed", err);
        },
      },
    });
    setLoading(false);
  };

  const SignoutIcon = () => (
    <svg
        className="fill-gray-500 group-hover:fill-gray-700 dark:group-hover:fill-gray-300"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M15.1007 19.247C14.6865 19.247 14.3507 18.9112 14.3507 18.497L14.3507 14.245H12.8507V18.497C12.8507 19.7396 13.8581 20.747 15.1007 20.747H18.5007C19.7434 20.747 20.7507 19.7396 20.7507 18.497L20.7507 5.49609C20.7507 4.25345 19.7433 3.24609 18.5007 3.24609H15.1007C13.8581 3.24609 12.8507 4.25345 12.8507 5.49609V9.74501L14.3507 9.74501V5.49609C14.3507 5.08188 14.6865 4.74609 15.1007 4.74609L18.5007 4.74609C18.9149 4.74609 19.2507 5.08188 19.2507 5.49609L19.2507 18.497C19.2507 18.9112 18.9149 19.247 18.5007 19.247H15.1007ZM3.25073 11.9984C3.25073 12.2144 3.34204 12.4091 3.48817 12.546L8.09483 17.1556C8.38763 17.4485 8.86251 17.4487 9.15549 17.1559C9.44848 16.8631 9.44863 16.3882 9.15583 16.0952L5.81116 12.7484L16.0007 12.7484C16.4149 12.7484 16.7507 12.4127 16.7507 11.9984C16.7507 11.5842 16.4149 11.2484 16.0007 11.2484L5.81528 11.2484L9.15585 7.90554C9.44864 7.61255 9.44847 7.13767 9.15547 6.84488C8.86248 6.55209 8.3876 6.55226 8.09481 6.84525L3.52309 11.4202C3.35673 11.5577 3.25073 11.7657 3.25073 11.9984Z"
          fill=""
        />
      </svg>
  );

  return (
    <>
    {/* <Link
      href="/"
      onClick={signout}
      className={`flex items-center gap-3 px-3 py-2 mt-3 font-medium rounded-lg group text-theme-sm ${
        loading
          ? "text-gray-400 cursor-not-allowed"
          : "text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
      }`}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t?.signOut || "Sign out"}<LoadingDots />
        </>
      ) : (
        <>
          <SignoutIcon />
          {t?.signOut || "Sign out"}
        </>
      )}
    </Link> */}
    <Button variant="completeGhost" onClick={signout}>
      <LogOutIcon className="text-destructive" />
      Log out
    </Button>
    </>
  );
};
