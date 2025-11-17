"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface PricingTableProps {
  user?: { id: string; email?: string } | null;
}

export function PricingTable({ user }: PricingTableProps) {
  const router = useRouter();

  const plans = [
    {
      name: "免费版",
      price: "¥0",
      period: "永久免费",
      features: [
        "基础功能访问",
        "每日 10 次提问",
        "社区支持",
      ],
      cta: "当前版本",
      variant: "outline" as const,
      disabled: true,
    },
    {
      name: "专业版",
      price: "¥29",
      period: "每月",
      features: [
        "无限次提问",
        "优先响应",
        "高级功能访问",
        "邮件支持",
        "优先更新",
      ],
      cta: "立即订阅",
      variant: "default" as const,
      highlighted: true,
    },
    {
      name: "企业版",
      price: "¥299",
      period: "每月",
      features: [
        "专业版所有功能",
        "专属客户经理",
        "API 访问",
        "定制化服务",
        "SLA 保障",
      ],
      cta: "联系销售",
      variant: "outline" as const,
    },
  ];

  return (
    <div className="w-full py-16 px-4 bg-zinc-50 dark:bg-black">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-black dark:text-zinc-50 mb-4">
            选择适合您的方案
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            灵活的定价方案，满足不同需求
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                disabled={plan.disabled}
                onClick={() => {
                  if (plan.disabled) return;
                  
                  // 如果用户未登录，跳转到登录页面
                  if (!user) {
                    router.push("/auth/login?next=/subscribe");
                    return;
                  }

                  // 根据计划跳转到支付页面
                  if (plan.name === "专业版") {
                    router.push("/subscribe?plan=pro");
                  } else if (plan.name === "企业版") {
                    router.push("/subscribe?plan=enterprise");
                  }
                }}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

