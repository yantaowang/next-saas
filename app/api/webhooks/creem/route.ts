import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { verifyCreemWebhook } from "@/lib/creem";

/**
 * Creem Webhook 处理程序
 * 处理支付成功、失败等事件
 */
export async function POST(request: Request) {
  try {
    const signature = request.headers.get("x-creem-signature");
    const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("CREEM_WEBHOOK_SECRET 未设置");
      return NextResponse.json(
        { error: "Webhook 配置错误" },
        { status: 500 }
      );
    }

    const body = await request.text();

    // 验证 webhook 签名
    if (signature && !verifyCreemWebhook(body, signature, webhookSecret)) {
      return NextResponse.json(
        { error: "无效的签名" },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);

    // 处理不同类型的事件
    switch (event.type) {
      case "checkout.completed":
        await handleCheckoutCompleted(event.data);
        break;
      case "checkout.failed":
        await handleCheckoutFailed(event.data);
        break;
      case "subscription.canceled":
        await handleSubscriptionCanceled(event.data);
        break;
      default:
        console.log("未处理的事件类型:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook 处理错误:", error);
    return NextResponse.json(
      { error: "Webhook 处理失败" },
      { status: 500 }
    );
  }
}

/**
 * 处理支付成功事件
 */
async function handleCheckoutCompleted(data: any) {
  const supabase = await createClient();

  const { metadata, customer_email } = data;
  const userId = metadata?.user_id;
  const plan = metadata?.plan;

  if (!userId || !plan) {
    console.error("缺少必要的元数据:", { userId, plan });
    return;
  }

  // 计算过期时间（30天）
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  // 检查是否已有订阅
  const { data: existingSubscription } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .single();

  if (existingSubscription) {
    // 更新现有订阅
    await supabase
      .from("subscriptions")
      .update({
        plan: plan,
        status: "active",
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingSubscription.id);
  } else {
    // 创建新订阅
    await supabase.from("subscriptions").insert({
      user_id: userId,
      plan: plan,
      status: "active",
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  console.log("订阅已激活:", { userId, plan });
}

/**
 * 处理支付失败事件
 */
async function handleCheckoutFailed(data: any) {
  console.log("支付失败:", data);
  // 可以在这里记录失败日志或发送通知
}

/**
 * 处理订阅取消事件
 */
async function handleSubscriptionCanceled(data: any) {
  const supabase = await createClient();

  const { metadata } = data;
  const userId = metadata?.user_id;

  if (!userId) {
    return;
  }

  // 更新订阅状态为已取消
  await supabase
    .from("subscriptions")
    .update({
      status: "canceled",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("status", "active");

  console.log("订阅已取消:", { userId });
}

