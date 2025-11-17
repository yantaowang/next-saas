/**
 * Creem 支付集成工具函数
 * 参考文档: https://docs.creem.io
 */

const CREEM_API_URL = process.env.CREEM_API_BASE_URL || "https://test-api.creem.io";

// 产品 ID 配置
export const CREEM_PRODUCTS = {
  monthly: process.env.CREEM_PRODUCT_ID || "prod_1rfNFI8XteIrjbgEjn39ee",
};

export interface CreemCheckoutResponse {
  url?: string;
  checkout_url?: string;
  id: string;
  checkout_id?: string;
  amount?: number;
  currency?: string;
  subscription_id?: string;
  payment_id?: string;
  payment_method?: string;
  created_at?: string;
}

export interface CreemWebhookEvent {
  id: string;
  type: string;
  data: any;
  created_at?: string;
}

/**
 * 创建 Creem 结账会话
 */
export async function createCreemCheckout(
  productId: string,
  customerEmail: string,
  successUrl: string,
  cancelUrl: string,
  metadata?: Record<string, string>
): Promise<CreemCheckoutResponse> {
  const apiKey = process.env.CREEM_API_KEY;

  if (!apiKey) {
    throw new Error("CREEM_API_KEY 环境变量未设置");
  }

  const requestData = {
    product_id: productId,
    customer_email: customerEmail,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: metadata || {},
  };

  console.log('创建 Creem checkout:', { CREEM_API_URL, requestData });

  const response = await fetch(`${CREEM_API_URL}/checkout/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Creem API 错误:', { status: response.status, errorText });
    throw new Error(`创建结账会话失败: ${errorText}`);
  }

  const result = await response.json();
  console.log('Creem checkout 创建成功:', result);

  return {
    url: result.url || result.checkout_url,
    checkout_url: result.checkout_url || result.url,
    id: result.id,
    checkout_id: result.checkout_id || result.id,
    amount: result.amount,
    currency: result.currency,
    subscription_id: result.subscription_id,
    payment_id: result.payment_id,
    payment_method: result.payment_method,
    created_at: result.created_at,
  };
}

/**
 * 验证 Creem Webhook 签名
 */
export function verifyCreemWebhook(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');

    // Creem 可能使用不同的签名格式
    return signature === expectedSignature ||
           signature === `sha256=${expectedSignature}` ||
           signature.startsWith(`sha256=`) && signature.split('=')[1] === expectedSignature;
  } catch (error) {
    console.error('Webhook 签名验证错误:', error);
    return false;
  }
}

