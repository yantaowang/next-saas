// import { createClient } from "@/lib/supabase/server";
// import { NextResponse } from "next/server";

// export async function GET(request: Request) {
//   const requestUrl = new URL(request.url);
//   const code = requestUrl.searchParams.get("code");
//   const next = requestUrl.searchParams.get("next") ?? "/";

//   console.log("requestUrl", requestUrl);

//   if (code) {
//     const supabase = await createClient();
//     await supabase.auth.exchangeCodeForSession(code);
//   }

//   // 重定向到指定页面或首页
//   return NextResponse.redirect(new URL(next, requestUrl.origin));
// }

