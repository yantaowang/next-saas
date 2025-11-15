# Vercel 部署问题排查指南

## Google 登录按钮不显示的问题

如果部署到 Vercel 后只看到 GitHub 登录按钮，没有 Google 登录按钮，请按以下步骤排查：

### 1. 清除 Vercel 构建缓存并重新部署

1. 进入 Vercel Dashboard
2. 选择你的项目
3. 进入 **Settings** → **General**
4. 滚动到底部，找到 **Clear Build Cache** 或 **Redeploy**
5. 点击 **Redeploy** 并选择 **Use existing Build Cache** 为 **No**
6. 等待重新部署完成

### 2. 检查代码是否已提交

确保最新的代码（包含 Google 登录按钮）已经推送到 Git 仓库：

```bash
git status
git add .
git commit -m "Add Google login button"
git push
```

### 3. 清除浏览器缓存

1. 按 `Ctrl + Shift + Delete` (Windows) 或 `Cmd + Shift + Delete` (Mac)
2. 选择清除缓存和 Cookie
3. 或者使用无痕模式访问网站

### 4. 检查 Vercel 部署日志

1. 进入 Vercel Dashboard → 你的项目 → **Deployments**
2. 点击最新的部署
3. 查看 **Build Logs** 是否有错误
4. 查看 **Function Logs** 是否有运行时错误

### 5. 验证环境变量

确保在 Vercel 中设置了以下环境变量：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` = `https://your-app.vercel.app`

### 6. 检查 Supabase 配置

1. 进入 Supabase Dashboard
2. 确认 Google Provider 已启用
3. 确认 Redirect URLs 包含你的 Vercel URL

### 7. 本地测试

在本地运行项目，确认 Google 登录按钮正常显示：

```bash
npm run dev
```

访问 `http://localhost:3000/auth/login`，应该能看到两个登录按钮。

### 8. 强制重新构建

如果以上方法都不行，可以尝试：

1. 在项目根目录创建一个空文件 `.vercelignore`（如果不存在）
2. 或者修改任意文件（比如添加一个注释）
3. 提交并推送代码
4. 这会触发 Vercel 重新构建

### 9. 检查页面源代码

在浏览器中：
1. 右键点击登录页面
2. 选择 **查看页面源代码**
3. 搜索 "Google" 或 "使用 Google 登录"
4. 如果代码中存在但页面不显示，可能是 CSS 或 JavaScript 问题

### 10. 联系支持

如果以上方法都无法解决问题，可以：
- 检查 Vercel 的构建日志是否有错误
- 检查浏览器控制台是否有 JavaScript 错误
- 联系 Vercel 支持

## 常见原因总结

1. **构建缓存问题** - 最常见，清除缓存重新部署即可
2. **代码未推送** - 确保最新代码已推送到 Git
3. **浏览器缓存** - 清除缓存或使用无痕模式
4. **环境变量未设置** - 确保所有必需的环境变量都已设置
5. **构建错误** - 检查 Vercel 构建日志

