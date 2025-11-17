"use client";

import { Button } from "@/components/ui/button";
import { useState, useTransition } from "react";

interface SubscribeFormProps {
  plan: string;
  user: { id: string; email?: string };
}

export function SubscribeForm({ plan, user }: SubscribeFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    setError(null);
    
    startTransition(async () => {
      try {
        const response = await fetch("/api/subscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            plan,
            userId: user.id,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "创建支付会话失败");
        }

        // 重定向到 Creem 结账页面
        if (data.checkout_url) {
          window.location.href = data.checkout_url;
        } else {
          throw new Error("未收到结账 URL");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "创建支付会话失败，请重试");
      }
    });
  };

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
      <h2 className="text-xl font-semibold text-black dark:text-zinc-50 mb-4">
        安全支付
      </h2>

      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              安全支付保障
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              我们将通过 Creem 安全支付平台处理您的支付，支持多种支付方式，包括信用卡、支付宝、微信支付等。
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <Button
        onClick={handleSubscribe}
        disabled={isPending}
        className="w-full"
        size="lg"
      >
        {isPending ? "正在创建支付会话..." : "前往支付"}
      </Button>

      <p className="mt-4 text-xs text-center text-zinc-500 dark:text-zinc-400">
        点击"前往支付"将跳转到 Creem 安全支付页面完成支付
      </p>
    </div>
  );
}

