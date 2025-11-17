import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { verifyCreemWebhook } from "@/lib/creem";

/**
 * Creem Webhook 处理程序
 * 处理支付成功、失败等事件
 */
export async function POST(request: Request) {
  try {
    const signature = request.headers.get("x-creem-signature") ||
                     request.headers.get("creem-signature");
    const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("CREEM_WEBHOOK_SECRET 未设置");
      return NextResponse.json(
        { error: "Webhook 配置错误" },
        { status: 500 }
      );
    }

    const body = await request.text();
    console.log("收到 Creem webhook，签名:", signature);

    // 验证 webhook 签名（如果提供了签名）
    if (signature && !verifyCreemWebhook(body, signature, webhookSecret)) {
      console.error("Webhook 签名验证失败");
      return NextResponse.json(
        { error: "无效的签名" },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);
    console.log("Webhook 事件:", { type: event.type, id: event.id });

    // 处理不同类型的事件
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.completed":
      case "payment.succeeded":
        await handleCheckoutCompleted(event.data);
        break;
      case "checkout.session.expired":
      case "checkout.failed":
      case "payment.failed":
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
 * 计算下个月的同一天
 */
function calculateNextMonthDate(): string {
  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(now.getMonth() + 1);

  // 如果是月末，确保下个月也是月末
  if (now.getDate() > 28) {
    const lastDayOfNextMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate();
    nextMonth.setDate(Math.min(now.getDate(), lastDayOfNextMonth));
  }

  return nextMonth.toISOString();
}

/**
 * 处理支付成功事件
 */
async function handleCheckoutCompleted(data: any) {
  const supabase = await createClient();

  console.log("处理支付成功事件:", data.id);

  const { metadata, customer_email, id, subscription_id, payment_id, amount, currency } = data;
  const userId = metadata?.user_id;
  const userEmail = metadata?.user_email || customer_email;

  if (!userId) {
    console.error("缺少必要的用户ID元数据");
    return;
  }

  try {
    // 更新支付记录
    const { error: paymentError } = await supabase
      .from('payments')
      .update({
        status: 'succeeded',
        creem_payment_id: payment_id,
        updated_at: new Date().toISOString()
      })
      .eq('creem_checkout_session_id', id);

    if (paymentError) {
      console.error('更新支付记录失败:', paymentError);
    }

    // 创建或更新订阅记录
    const subscriptionData = {
      user_id: userId,
      creem_subscription_id: subscription_id,
      product_id: metadata?.product_id || process.env.CREEM_PRODUCT_ID,
      status: 'active',
      price_amount: amount || 4.50,
      price_currency: currency || 'USD',
      billing_cycle: 'monthly',
      current_period_start: data.created_at ? new Date(data.created_at).toISOString() : new Date().toISOString(),
      current_period_end: calculateNextMonthDate(),
      cancel_at_period_end: false,
      metadata: {
        creem_session_id: id,
        user_email: userEmail,
        payment_method: data.payment_method
      }
    };

    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .upsert(subscriptionData, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      });

    if (subscriptionError) {
      console.error('创建/更新订阅记录失败:', subscriptionError);
    } else {
      console.log('订阅创建/更新成功:', { userId, userEmail });
    }

  } catch (error) {
    console.error('处理支付成功事件失败:', error);
  }
}

/**
 * 处理支付失败事件
 */
async function handleCheckoutFailed(data: any) {
  try {
    console.log("处理支付失败事件:", data.id);

    const supabase = await createClient();

    // 更新支付记录
    const { error: paymentError } = await supabase
      .from('payments')
      .update({
        status: 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('creem_checkout_session_id', data.id);

    if (paymentError) {
      console.error('更新支付记录失败:', paymentError);
    }

  } catch (error) {
    console.error('处理支付失败事件失败:', error);
  }
}

/**
 * 处理订阅取消事件
 */
async function handleSubscriptionCanceled(data: any) {
  try {
    console.log("处理订阅取消事件:", data.id);

    const supabase = await createClient();

    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
        cancel_at_period_end: true,
        updated_at: new Date().toISOString()
      })
      .eq('creem_subscription_id', data.id);

    if (subscriptionError) {
      console.error('更新订阅状态失败:', subscriptionError);
    }

  } catch (error) {
    console.error('处理订阅取消事件失败:', error);
  }
}

