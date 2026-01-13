# GitHub Actions 构建配置指南

## 步骤 1: 创建 Expo Personal Access Token

1. 访问 Expo 网站: https://expo.dev/accounts/smileok2006/settings/access-tokens
2. 点击 "Create Token" 按钮
3. 输入 Token 名称（例如：`github-actions-build`）
4. 复制生成的 token（只会显示一次，请妥善保存）

## 步骤 2: 在 GitHub 仓库中配置 Secret

1. 访问您的 GitHub 仓库设置页面
2. 进入 Settings → Secrets and variables → Actions
3. 点击 "New repository secret"
4. 配置如下：
   - Name: `EXPO_TOKEN`
   - Secret: 粘贴步骤1中复制的 token
5. 点击 "Add secret" 保存

## 步骤 3: 触发构建

1. 访问 GitHub 仓库的 Actions 页面
2. 选择 "Build Android APK" workflow
3. 点击 "Run workflow" 按钮
4. 选择构建配置（默认选择 `huawei`）
5. 点击 "Run workflow" 开始构建

## 步骤 4: 下载 APK

1. 构建完成后，访问 https://expo.dev/accounts/smileok2006/projects/happy/builds
2. 找到最新的构建记录
3. 点击下载 APK 文件

---

**注意事项：**
- 构建过程大约需要 10-15 分钟
- 构建在 GitHub 的云环境中进行，不受本地网络限制
- Token 只需要配置一次，后续可以重复使用
