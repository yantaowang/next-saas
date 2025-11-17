# 订阅功能数据库设置

## 创建 subscriptions 表

在 Supabase Dashboard 中执行以下 SQL 来创建订阅表：

```sql
-- 创建 subscriptions 表
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('pro', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions(user_id, status);

-- 启用 Row Level Security (RLS)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看和更新自己的订阅
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
  ON subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 创建更新 updated_at 的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## 使用步骤

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 进入 **SQL Editor**
4. 复制上面的 SQL 代码并执行
5. 验证表已创建：进入 **Table Editor**，应该能看到 `subscriptions` 表

## 表结构说明

- `id`: 订阅记录的唯一标识符
- `user_id`: 用户ID，关联到 auth.users 表
- `plan`: 订阅计划类型（'pro' 或 'enterprise'）
- `status`: 订阅状态（'active', 'canceled', 'expired'）
- `expires_at`: 订阅过期时间
- `created_at`: 创建时间
- `updated_at`: 更新时间

## 测试订阅功能

1. 确保用户已登录
2. 在首页点击价格表中的"立即订阅"按钮
3. 选择支付方式并确认支付
4. 支付成功后会自动跳转到成功页面
5. 订阅状态会在首页显示

## 注意事项

- 当前实现是模拟支付，实际项目中需要集成真实的支付网关（如 Stripe、支付宝、微信支付等）
- 支付成功后需要处理支付回调来确认订单
- 建议添加支付记录表来追踪所有支付交易

