"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
          action="/auth/logout"
          method="post"
          onSubmit={async (e) => {
            e.preventDefault();
            setIsLoading(true);
            const formData = new FormData(e.currentTarget);
            await fetch("/auth/logout", {
              method: "POST",
              body: formData,
            });
            router.refresh();
            setIsLoading(false);
          }}
        >
          <Button type="submit" variant="outline" disabled={isLoading}>
            {isLoading ? "登出中..." : "登出"}
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

