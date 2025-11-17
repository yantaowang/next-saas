import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { createCreemCheckout, CREEM_PRODUCTS } from "@/lib/creem";
import { headers } from "next/headers";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "未登录" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { plan, userId } = body;

    // 验证用户ID匹配
    if (userId !== user.id) {
      return NextResponse.json(
        { error: "用户ID不匹配" },
        { status: 403 }
      );
    }

    // 获取产品 ID
    const productId = CREEM_PRODUCTS[plan as keyof typeof CREEM_PRODUCTS];
    if (!productId) {
      return NextResponse.json(
        { error: "无效的订阅计划" },
        { status: 400 }
      );
    }

    // 获取当前请求的 origin
    const headersList = await headers();
    const host = headersList.get("host");
    const protocol = 
      process.env.NODE_ENV === "development" 
        ? "http" 
        : (headersList.get("x-forwarded-proto") || "https");
    const origin = 
      process.env.NEXT_PUBLIC_SITE_URL || 
      (host ? `${protocol}://${host}` : null) ||
      (process.env.NODE_ENV === "development" 
        ? "http://localhost:3000" 
        : "");

    // 构建成功和取消 URL
    const successUrl = `${origin}/subscribe/success?plan=${plan}&checkout_id={CHECKOUT_ID}`;
    const cancelUrl = `${origin}/subscribe?plan=${plan}&canceled=true`;

    // 创建 Creem 结账会话
    const checkout = await createCreemCheckout(
      productId,
      user.email || "",
      successUrl,
      cancelUrl,
      {
        user_id: user.id,
        plan: plan,
      }
    );

    return NextResponse.json({
      success: true,
      checkout_url: checkout.checkout_url,
      checkout_id: checkout.checkout_id,
    });
  } catch (error) {
    console.error("创建结账会话错误:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "服务器错误" },
      { status: 500 }
    );
  }
}

