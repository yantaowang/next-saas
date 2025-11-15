import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * 在中间件中更新 Supabase 会话
 * 重要：必须在每个请求中创建新的客户端实例
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // 跳过静态资源
  const pathname = request.nextUrl.pathname;
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    /\.(svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$/.test(pathname)
  ) {
    return supabaseResponse;
  }

  // 如果环境变量未设置，跳过中间件检查
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 重要：必须在创建客户端后立即调用 getClaims()
  // 不要在 createServerClient 和 getClaims() 之间运行其他代码
  // 这可以防止用户被随机登出
  const { data } = await supabase.auth.getClaims();

  // 如果用户未登录且不在认证相关页面，可以在这里添加重定向逻辑
  // 例如：保护某些路由需要登录
  // const user = data?.claims;

  return supabaseResponse;
}

