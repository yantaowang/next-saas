"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface PricingTableProps {
  user?: { id: string; email?: string } | null;
  isSubscribed?: boolean;
}

export function PricingTable({ user, isSubscribed }: PricingTableProps) {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const plans = [
    {
      name: "免费版",
      price: "$0",
      period: "永久免费",
      features: [
        "基础功能访问",
        "每日 10 次提问",
        "社区支持",
      ],
      cta: isSubscribed ? "管理订阅" : "当前版本",
      variant: "outline" as const,
      disabled: true,
    },
    {
      name: "专业版",
      price: "$4.50",
      period: "每月",
      features: [
        "无限次提问",
        "优先响应",
        "高级功能访问",
        "邮件支持",
        "优先更新",
      ],
      cta: isSubscribed ? "已订阅" : "立即订阅",
      variant: "default" as const,
      highlighted: true,
      disabled: isSubscribed,
    },
  ];

  const handleSubscribe = async (planName: string) => {
    if (!user) {
      // 如果用户未登录，跳转到登录页面
      router.push("/auth/login?next=/");
      return;
    }

    if (planName !== "专业版") return;

    setLoadingPlan(planName);

    try {
      // 创建 Creem 支付会话
      const response = await fetch("/api/creem/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          successUrl: `${window.location.origin}/subscribe?success=true`,
          cancelUrl: `${window.location.origin}/subscribe?canceled=true`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("创建支付会话失败:", data.error);
        alert("创建支付会话失败，请稍后重试");
        return;
      }

      // 跳转到 Creem 支付页面
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        alert("支付链接无效，请联系客服");
      }

    } catch (error) {
      console.error("支付处理错误:", error);
      alert("支付处理失败，请稍后重试");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="w-full py-16 px-4 bg-zinc-50 dark:bg-black">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-black dark:text-zinc-50 mb-4">
            选择适合您的方案
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            解锁无限提问能力，提升工作效率
          </p>
        </div>

        {!isSubscribed && user && (
          <div className="mb-8 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <p className="text-amber-800 dark:text-amber-200 text-center">
              💡 升级到专业版，解锁无限次提问功能
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-lg border p-6 bg-white dark:bg-zinc-950 transition-all ${
                plan.highlighted
                  ? "border-primary shadow-lg scale-105 dark:border-primary/50"
                  : "border-zinc-200 dark:border-zinc-800 hover:shadow-md"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    推荐
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-black dark:text-zinc-50 mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-black dark:text-zinc-50">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      /{plan.period}
                    </span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <li
                    key={featureIndex}
                    className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                  >
                    <svg
                      className="w-5 h-5 text-green-500 mt-0.5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.variant}
                className="w-full"
                disabled={plan.disabled || loadingPlan === plan.name}
                onClick={() => handleSubscribe(plan.name)}
              >
                {loadingPlan === plan.name ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    处理中...
                  </>
                ) : (
                  plan.cta
                )}
              </Button>

              {plan.highlighted && !user && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center mt-2">
                  需要登录后订阅
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
          <p>支持安全支付 • 随时取消 • 30天退款保证</p>
        </div>
      </div>
    </div>
  );
}

