"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function SuccessRedirect() {
  const router = useRouter();

  useEffect(() => {
    // 3秒后自动刷新首页以更新订阅状态
    const timer = setTimeout(() => {
      router.refresh();
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return null;
}

