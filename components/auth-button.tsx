"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { logout } from "@/app/auth/logout/actions";

export function AuthButton({
  user,
}: {
  user: { id: string; email?: string } | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
      router.refresh();
      router.push("/");
    });
  };

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          {user.email || "已登录"}
        </span>
        <Button
          type="button"
          variant="outline"
          onClick={handleLogout}
          disabled={isPending}
        >
          {isPending ? "登出中..." : "退出登录"}
        </Button>
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

