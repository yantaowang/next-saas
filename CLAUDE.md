# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 Next.js 16 的 shadcn/ui 演示项目，集成了 Supabase 身份验证和订阅管理系统。项目使用 TypeScript、Tailwind CSS 4 和 React 19。

## 开发命令

### 基础命令
- `npm run dev` - 启动开发服务器 (http://localhost:3000)
- `npm run build` - 构建生产版本
- `npm run start` - 启动生产服务器
- `npm run lint` - 运行 ESLint 检查

### 开发环境设置
- 需要在 `.env.local` 中配置 Supabase 环境变量
- 必需的环境变量：`NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 项目架构

### 目录结构
- `app/` - Next.js App Router 页面和 API 路由
  - `auth/` - 身份验证相关页面
  - `subscribe/` - 订阅管理页面
  - `api/` - API 路由
- `components/` - React 组件
  - `ui/` - shadcn/ui 基础组件
  - `auth-button.tsx` - 登录/登出按钮组件
  - `pricing-table.tsx` - 价格表组件
  - `subscribe-form.tsx` - 订阅表单组件
- `lib/` - 工具函数和配置
  - `supabase/` - Supabase 客户端配置
  - `subscription.ts` - 订阅状态检查逻辑
  - `utils.ts` - 通用工具函数

### 核心技术栈

**前端框架：**
- Next.js 16 (App Router)
- React 19
- TypeScript 5

**UI 组件：**
- shadcn/ui (new-york 风格)
- Tailwind CSS 4
- Lucide React 图标
- next-themes 主题切换

**后端服务：**
- Supabase (身份验证 + 数据库)
- @supabase/ssr 服务器端集成

### 关键特性

**身份验证系统：**
- 使用 Supabase Auth 进行用户管理
- 支持登录/登出功能
- 中间件自动处理会话更新 (middleware.ts:4)

**订阅管理：**
- 基于 `subscriptions` 表的订阅状态检查
- 订阅状态影响页面显示内容 (app/page.tsx:16)
- 支持订阅过期时间检查 (lib/subscription.ts:28)

**主题系统：**
- 支持亮色/暗色模式切换
- 使用 next-themes 实现系统主题同步
- 全局主题提供者配置 (app/layout.tsx:29)

### 重要配置

**shadcn/ui 配置 (components.json)：**
- 样式：new-york
- 基础颜色：neutral
- 支持 CSS 变量
- 路径别名：@/components, @/lib/utils, @/components/ui

**中间件配置 (middleware.ts:18)：**
- 排除静态文件和图片优化路径
- 自动处理所有其他路由的会话更新

### 数据库依赖

项目依赖于 Supabase 数据库中的 `subscriptions` 表，包含字段：
- `user_id` - 用户ID
- `status` - 订阅状态 ('active', 'canceled', 'expired')
- `expires_at` - 过期时间 (可选)

### 开发注意事项

1. **Supabase 客户端使用：** 服务器端每次都应创建新的客户端实例，不要存储在全局变量中
2. **环境变量检查：** 所有 Supabase 操作都会检查必需的环境变量
3. **订阅状态：** 页面会根据用户订阅状态显示不同的内容和提示
4. **类型安全：** 项目使用严格的 TypeScript 配置，确保类型安全