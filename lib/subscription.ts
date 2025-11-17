import { createClient } from "@/lib/supabase/server";

/**
 * 检查用户是否有活跃的订阅
 * @param userId 用户ID
 * @returns 如果有活跃订阅返回 true，否则返回 false
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const supabase = await createClient();

  // 查询用户的订阅记录
  // 假设订阅表名为 'subscriptions'，包含以下字段：
  // - user_id: 用户ID
  // - status: 订阅状态 ('active', 'canceled', 'expired' 等)
  // - expires_at: 过期时间（可选，如果订阅有期限）
  const { data, error } = await supabase
    .from("subscriptions")
    .select("id, status, expires_at")
    .eq("user_id", userId)
    .eq("status", "active")
    .single();

  if (error || !data) {
    return false;
  }

  // 如果订阅有过期时间，检查是否已过期
  if (data.expires_at) {
    const expiresAt = new Date(data.expires_at);
    const now = new Date();
    return expiresAt > now;
  }

  // 如果没有过期时间字段，只要状态是 active 就返回 true
  return true;
}
