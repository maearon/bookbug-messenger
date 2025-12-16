"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PromoScreen from "./PromoScreen";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { accessToken, user, loading, refresh, fetchMe } = useAuthStore();
  const [starting, setStarting] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      let token = accessToken;
      // có thể xảy ra khi refresh trang
      if (!accessToken) {
        token = await refresh();
      }

      if (token && !user) {
        await fetchMe();
      }

      setStarting(false);
    };

    init();
  }, []);

  useEffect(() => {
    if (!starting && !loading && !accessToken) {
      router.push("/signin");
    }
  }, [starting, loading, accessToken]);

  if (starting || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        {/* Đang tải trang... */}
        <PromoScreen />
      </div>
    );
  }

  return <>{children}</>;
}
