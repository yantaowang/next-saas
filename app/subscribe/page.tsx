import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SubscribeForm } from "@/components/subscribe-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function SubscribePage({
  searchParams,
}: {
  searchParams: { plan?: string; success?: string; canceled?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 检查支付结果
  if (searchParams.success === "true") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-2xl">订阅成功！</CardTitle>
            <CardDescription>
              恭喜！您已成功订阅专业版
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                ✓ 无限次提问<br/>
                ✓ 优先响应<br/>
                ✓ 高级功能访问<br/>
                ✓ 邮件支持
              </p>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center">
              您现在可以享受所有专业版功能
            </p>
            <div className="flex flex-col gap-2">
              <Link href="/">
                <Button className="w-full">
                  开始使用
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (searchParams.canceled === "true") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <XCircle className="h-12 w-12 text-amber-500" />
            </div>
            <CardTitle className="text-2xl">支付已取消</CardTitle>
            <CardDescription>
              您可以随时返回重新订阅
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              您可以随时返回首页重新订阅
            </p>
            <div className="flex flex-col gap-2">
              <Link href="/">
                <Button variant="outline" className="w-full">
                  返回首页
                </Button>
              </Link>
              <Link href="/subscribe">
                <Button className="w-full">
                  重新订阅
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 如果用户未登录，重定向到登录页面
  if (!user) {
    redirect("/auth/login?next=/subscribe");
  }

  const plan = searchParams.plan || "pro";

  const plans = {
    pro: {
      name: "专业版",
      price: 4.50,
      period: "每月",
      currency: "$",
      features: [
        "无限次提问",
        "优先响应",
        "高级功能访问",
        "邮件支持",
        "优先更新",
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
        </div>

        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 mb-6">
          <h2 className="text-xl font-semibold text-black dark:text-zinc-50 mb-4">
            订阅方案
          </h2>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-bold text-black dark:text-zinc-50">
              {selectedPlan.currency}{selectedPlan.price}
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

