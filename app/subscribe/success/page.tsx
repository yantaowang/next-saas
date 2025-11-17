import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SuccessRedirect } from "@/components/success-redirect";

export default async function SubscribeSuccessPage({
  searchParams,
}: {
  searchParams: { plan?: string; checkout_id?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const plan = searchParams.plan || "pro";
  const checkoutId = searchParams.checkout_id;
  const planName = plan === "enterprise" ? "企业版" : "专业版";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-black px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
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
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-black dark:text-zinc-50 mb-2">
            订阅成功！
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            您已成功订阅 {planName}
          </p>
        </div>

        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 mb-6">
          <div className="space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">订阅方案</span>
              <span className="font-medium text-black dark:text-zinc-50">
                {planName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">账户邮箱</span>
              <span className="font-medium text-black dark:text-zinc-50">
                {user.email || "未设置"}
              </span>
            </div>
            {checkoutId && (
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">订单号</span>
                <span className="font-medium text-black dark:text-zinc-50 text-sm">
                  {checkoutId}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <Link href="/">
            <Button className="w-full" size="lg">
              返回首页
            </Button>
          </Link>
          <Link href="https://nextjs.org/docs">
            <Button variant="outline" className="w-full" size="lg">
              查看文档
            </Button>
          </Link>
        </div>
      </div>
      <SuccessRedirect />
    </div>
  );
}

