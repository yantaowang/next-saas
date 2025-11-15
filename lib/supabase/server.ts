import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * 创建服务器端 Supabase 客户端
 * 重要：不要在全局变量中存储此客户端，每次使用时都创建新实例
 */
export async function createClient() {
  const cookieStore = await cookies();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error(
      "Missing Supabase env vars. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
    );
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // `setAll` 方法在 Server Component 中被调用时可能会失败
            // 如果使用中间件刷新用户会话，可以忽略此错误
          }
        },
      },
    }
  );
}

