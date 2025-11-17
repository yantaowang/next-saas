/**
 * Creem 支付集成工具函数
 * 参考文档: https://docs.creem.io
 */

const CREEM_API_URL = "https://api.creem.io/v1";

// 产品 ID 映射
export const CREEM_PRODUCTS = {
  pro: process.env.CREEM_PRODUCT_ID_PRO || "prod_1rfNFI8XteIrjbgEjn39ee",
  enterprise: process.env.CREEM_PRODUCT_ID_ENTERPRISE || "",
};

export interface CreemCheckoutResponse {
  checkout_url: string;
  checkout_id: string;
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

  const response = await fetch(`${CREEM_API_URL}/checkouts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      product_id: productId,
      customer_email: customerEmail,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: metadata || {},
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "创建结账会话失败" }));
    throw new Error(error.message || "创建结账会话失败");
  }

  return response.json();
}

/**
 * 验证 Creem Webhook 签名
 */
export function verifyCreemWebhook(
  payload: string,
  signature: string,
  secret: string
): boolean {
  // Creem webhook 签名验证逻辑
  // 具体实现取决于 Creem 的签名算法
  // 这里需要根据 Creem 文档实现
  return true; // 临时返回 true，实际需要实现签名验证
}

