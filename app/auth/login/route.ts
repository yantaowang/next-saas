import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const supabase = await createClient();

  // 获取 GitHub OAuth 提供者
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${requestUrl.origin}/auth/callback?next=${encodeURIComponent(
        requestUrl.searchParams.get("next") ?? "/"
      )}`,
    },
  });

  if (error) {
    return NextResponse.redirect(
      new URL(`/auth/login?error=${error.message}`, requestUrl.origin)
    );
  }

  if (data?.url) {
    return NextResponse.redirect(data.url);
  }

  return NextResponse.redirect(new URL("/auth/login", requestUrl.origin));
}

