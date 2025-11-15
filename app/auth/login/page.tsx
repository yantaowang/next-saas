import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { headers } from "next/headers";

async function handleLogin(formData: FormData) {
  "use server";

  const next = formData.get("next") as string | null;
  const headersList = await headers();
  const origin = headersList.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next ?? "/")}`,
    },
  });

  if (error) {
    redirect(`/auth/login?error=${encodeURIComponent(error.message)}${next ? `&next=${encodeURIComponent(next)}` : ""}`);
  }

  if (data?.url) {
    redirect(data.url);
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; next?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 如果已登录，重定向到首页或指定页面
  if (user) {
    redirect(searchParams.next ?? "/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 rounded-lg border bg-card p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold">登录</h1>
          <p className="mt-2 text-muted-foreground">
            使用 GitHub 账号登录
          </p>
        </div>

        {searchParams.error && (
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            {searchParams.error}
          </div>
        )}

        <form action={handleLogin}>
          {searchParams.next && (
            <input type="hidden" name="next" value={searchParams.next} />
          )}
          <Button type="submit" className="w-full" size="lg">
            使用 GitHub 登录
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          <Link href="/" className="hover:underline">
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}

