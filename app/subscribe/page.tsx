import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SubscribeForm } from "@/components/subscribe-form";

export default async function SubscribePage({
  searchParams,
}: {
  searchParams: { plan?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 如果用户未登录，重定向到登录页面
  if (!user) {
    redirect("/auth/login?next=/subscribe");
  }

  const plan = searchParams.plan || "pro";

  const plans = {
    pro: {
      name: "专业版",
      price: 29,
      period: "每月",
      features: [
        "无限次提问",
        "优先响应",
        "高级功能访问",
        "邮件支持",
        "优先更新",
      ],
    },
    enterprise: {
      name: "企业版",
      price: 299,
      period: "每月",
      features: [
        "专业版所有功能",
        "专属客户经理",
        "API 访问",
        "定制化服务",
        "SLA 保障",
      ],
    },
  };

  const selectedPlan = plans[plan as keyof typeof plans] || plans.pro;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-black px-4 py-16">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-black dark:text-zinc-50 mb-2">
            完成订阅
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            点击下方按钮跳转到 Creem 安全支付页面完成支付
          </p>
          {searchParams.canceled === "true" && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                支付已取消，您可以重新尝试
              </p>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 mb-6">
          <h2 className="text-xl font-semibold text-black dark:text-zinc-50 mb-4">
            订阅方案
          </h2>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-bold text-black dark:text-zinc-50">
              ¥{selectedPlan.price}
            </span>
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              /{selectedPlan.period}
            </span>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
            {selectedPlan.name}
          </p>
          <ul className="space-y-2">
            {selectedPlan.features.map((feature, index) => (
              <li
                key={index}
                className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300"
              >
                <svg
                  className="w-5 h-5 text-green-500 shrink-0"
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
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <SubscribeForm plan={plan} user={user} />
      </div>
    </div>
  );
}

