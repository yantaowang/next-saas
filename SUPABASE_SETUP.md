# Supabase OAuth 认证配置指南

## 1. 环境变量配置

在 `.env.local` 文件中添加以下配置：

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

这些值可以在 [Supabase Dashboard](https://app.supabase.com) → 项目设置 → API 中找到。

## 2. 配置 GitHub OAuth

### 步骤 1: 在 GitHub 创建 OAuth App

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 点击 "New OAuth App"
3. 填写以下信息：
   - **Application name**: 你的应用名称
   - **Homepage URL**: `http://localhost:3000` (开发环境) 或你的生产环境 URL
   - **Authorization callback URL**: 
     - 开发环境: `http://localhost:3000/auth/callback`
     - 生产环境: `https://your-domain.com/auth/callback`
4. 点击 "Register application"
5. 复制 **Client ID** 和 **Client Secret**

### 步骤 2: 在 Supabase 配置 GitHub Provider

1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 进入 **Authentication** → **Providers**
4. 找到 **GitHub** 并启用它
5. 填入以下信息：
   - **Client ID**: 从 GitHub 复制的 Client ID
   - **Client Secret**: 从 GitHub 复制的 Client Secret
6. 保存配置

### 步骤 3: 配置重定向 URL

在 Supabase Dashboard 中：
1. 进入 **Authentication** → **URL Configuration**
2. 在 **Redirect URLs** 中添加：
   - `http://localhost:3000/auth/callback` (开发环境)
   - `https://your-domain.com/auth/callback` (生产环境)

## 3. 配置 Google OAuth

### 步骤 1: 在 Google Cloud Console 创建 OAuth 2.0 客户端

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 **Google+ API**：
   - 进入 **APIs & Services** → **Library**
   - 搜索 "Google+ API" 并启用
4. 创建 OAuth 2.0 凭据：
   - 进入 **APIs & Services** → **Credentials**
   - 点击 **Create Credentials** → **OAuth client ID**
   - 如果提示配置 OAuth 同意屏幕，先完成配置：
     - 选择 **External**（除非你有 Google Workspace）
     - 填写应用名称、用户支持邮箱等必填信息
     - 添加测试用户（开发阶段）
   - 应用类型选择 **Web application**
   - 名称：你的应用名称
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (开发环境)
     - `https://your-domain.com` (生产环境)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/auth/callback` (开发环境)
     - `https://your-domain.com/auth/callback` (生产环境)
5. 点击 **Create**
6. 复制 **Client ID** 和 **Client Secret**

### 步骤 2: 在 Supabase 配置 Google Provider

1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 进入 **Authentication** → **Providers**
4. 找到 **Google** 并启用它
5. 填入以下信息：
   - **Client ID**: 从 Google Cloud Console 复制的 Client ID
   - **Client Secret**: 从 Google Cloud Console 复制的 Client Secret
6. 保存配置

### 步骤 3: 配置重定向 URL（如果尚未配置）

在 Supabase Dashboard 中：
1. 进入 **Authentication** → **URL Configuration**
2. 确保 **Redirect URLs** 中包含：
   - `http://localhost:3000/auth/callback` (开发环境)
   - `https://your-domain.com/auth/callback` (生产环境)

## 4. 使用说明

### 登录流程

1. 用户访问 `/auth/login` 页面
2. 选择登录方式（GitHub 或 Google）
3. 点击对应的登录按钮
4. 重定向到相应的授权页面（GitHub 或 Google）
5. 用户授权后，重定向回 `/auth/callback`
6. 应用交换授权码获取会话
7. 用户被重定向到首页或指定页面

### 在代码中使用

**服务器组件中获取用户：**
```typescript
import { createClient } from "@/lib/supabase/server";

const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
```

**客户端组件中使用：**
```typescript
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
// 注意：客户端认证操作应该通过 API 路由进行
```

## 5. 重要提示

- 所有认证操作都在服务器端进行，符合 Supabase SSR 最佳实践
- 中间件会自动刷新用户会话
- 不要在全局变量中存储 Supabase 客户端实例
- 每次使用时都创建新的客户端实例
- 支持 GitHub 和 Google 两种登录方式，用户可以选择任意一种

