"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { logout } from "@/app/auth/logout/actions";

export function AuthButton({
  user,
}: {
  user: { id: string; email?: string } | null;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          {user.email || "已登录"}
        </span>
        <form
          action={async () => {
            setIsLoading(true);
            await logout();
            router.refresh();
            router.push("/");
          }}
        >
          <Button type="submit" variant="outline" disabled={isLoading}>
            {isLoading ? "登出中..." : "退出登录"}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <Button
      onClick={() => {
        router.push("/auth/login");
      }}
    >
      登录
    </Button>
  );
}

