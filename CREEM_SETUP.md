# Creem 支付集成设置指南

## 1. 环境变量配置

在 `.env.local` 文件中添加以下配置：

```env
# Creem API 配置
CREEM_API_KEY=your_creem_api_key
CREEM_WEBHOOK_SECRET=your_webhook_secret

# Creem 产品 ID（可选，如果使用默认产品 ID 可以不设置）
CREEM_PRODUCT_ID_PRO=prod_1rfNFI8XteIrjbgEjn39ee
CREEM_PRODUCT_ID_ENTERPRISE=your_enterprise_product_id

# 站点 URL（用于构建回调 URL）
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 2. 获取 Creem API 密钥

1. 访问 [Creem Dashboard](https://www.creem.io/dashboard)
2. 登录您的账户
3. 进入 **Settings** → **API Keys**
4. 复制您的 API Key
5. 将 API Key 添加到环境变量 `CREEM_API_KEY`

## 3. 配置 Webhook

1. 在 Creem Dashboard 中，进入 **Settings** → **Webhooks**
2. 添加新的 Webhook URL：
   - **开发环境**: `http://localhost:3000/api/webhooks/creem`
   - **生产环境**: `https://your-domain.com/api/webhooks/creem`
3. 选择要监听的事件：
   - `checkout.completed` - 支付成功
   - `checkout.failed` - 支付失败
   - `subscription.canceled` - 订阅取消
4. 复制 Webhook Secret 并添加到环境变量 `CREEM_WEBHOOK_SECRET`

## 4. 产品配置

### 使用现有产品

当前代码已配置使用产品 ID: `prod_1rfNFI8XteIrjbgEjn39ee`

### 创建新产品

1. 在 Creem Dashboard 中，进入 **Products**
2. 点击 **Create Product**
3. 填写产品信息：
   - **Name**: 专业版 / 企业版
   - **Price**: 设置价格
   - **Billing**: 选择订阅周期（每月/每年）
4. 复制产品 ID 并更新环境变量

## 5. 测试支付流程

### 测试模式

Creem 提供测试模式，您可以使用测试卡号进行支付测试：

1. 在 Creem Dashboard 中启用 **Test Mode**
2. 使用测试卡号进行支付测试
3. 测试 Webhook 回调是否正常工作

### 支付流程

1. 用户点击"立即订阅"按钮
2. 跳转到订阅页面 (`/subscribe?plan=pro`)
3. 点击"前往支付"按钮
4. 创建 Creem 结账会话
5. 重定向到 Creem 支付页面
6. 用户完成支付
7. Creem 发送 Webhook 通知
8. 系统更新订阅状态
9. 用户重定向到成功页面

## 6. 生产环境部署

### Vercel 部署

1. 在 Vercel 项目设置中添加环境变量：
   - `CREEM_API_KEY`
   - `CREEM_WEBHOOK_SECRET`
   - `CREEM_PRODUCT_ID_PRO`（可选）
   - `CREEM_PRODUCT_ID_ENTERPRISE`（可选）
   - `NEXT_PUBLIC_SITE_URL`

2. 更新 Webhook URL 为生产环境地址

3. 禁用测试模式

### 安全检查清单

- [ ] API Key 已正确设置
- [ ] Webhook Secret 已正确设置
- [ ] Webhook URL 已更新为生产地址
- [ ] 测试模式已禁用
- [ ] 数据库表已创建（参考 SUBSCRIPTION_SETUP.md）

## 7. 故障排除

### Webhook 未收到

1. 检查 Webhook URL 是否正确
2. 确认 Webhook Secret 匹配
3. 查看 Creem Dashboard 中的 Webhook 日志
4. 检查服务器日志

### 支付后订阅未激活

1. 检查 Webhook 是否正常接收
2. 查看数据库中的订阅记录
3. 确认用户 ID 和计划信息正确
4. 检查 Webhook 处理逻辑

## 8. 参考文档

- [Creem API 文档](https://docs.creem.io)
- [Creem Checkout 流程](https://docs.creem.io/checkout-flow)
- [Creem Webhook 文档](https://docs.creem.io/webhooks)

