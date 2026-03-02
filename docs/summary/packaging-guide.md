# 打包问题解决方案

> 创建时间: 2026-03-03
> 适用版本: v0.5.7+

---

## 一、Android 打包图标问题

### 问题描述

打包 Android APK 后，应用图标未使用项目自定义图标，而是显示默认的 Tauri 图标。

### 原因分析

Tauri 2.x 在运行 `tauri android init` 后会生成 `gen/android` 目录，但不会自动同步 `icons/android` 中的自定义图标。需要手动复制图标文件到生成目录。

### 解决方案

#### 方法一：使用自动化脚本（推荐）

```bash
# 1. 初始化 Android 项目（首次）
pnpm tauri android init

# 2. 复制图标文件
pnpm android:copy-icons        # Linux/macOS
pnpm android:copy-icons:win    # Windows

# 3. 构建 Android APK
pnpm tauri:android:build
```

#### 方法二：手动复制

```bash
# 复制图标到 gen 目录
cp -r src-tauri/icons/android/* src-tauri/gen/android/app/src/main/res/
```

### 图标文件结构

```
src-tauri/icons/android/
├── mipmap-mdpi/
│   └── ic_launcher.png      # 48x48
├── mipmap-hdpi/
│   └── ic_launcher.png      # 72x72
├── mipmap-xhdpi/
│   └── ic_launcher.png      # 96x96
├── mipmap-xxhdpi/
│   └── ic_launcher.png      # 144x144
├── mipmap-xxxhdpi/
│   └── ic_launcher.png      # 192x192
├── mipmap-anydpi-v26/
│   ├── ic_launcher.xml      # 自适应图标配置
│   └── ic_launcher_round.xml
└── values/
    └── colors.xml           # 图标背景色
```

### 相关命令

| 命令                          | 说明                       |
| ----------------------------- | -------------------------- |
| `pnpm tauri:android:init`     | 初始化 Android 项目        |
| `pnpm tauri:android:build`    | 构建 Android APK/AAB       |
| `pnpm android:copy-icons`     | 复制图标文件 (Linux/macOS) |
| `pnpm android:copy-icons:win` | 复制图标文件 (Windows)     |

---

## 二、macOS 安装报错"文件已损坏"

### 问题描述

在 macOS 上安装应用后，打开时提示：

> "PlanTodos.app" 已损坏，无法打开。你应该将它移到废纸篓。

### 原因分析

- macOS Gatekeeper 安全机制阻止未签名/未公证的应用
- 自 macOS 10.14.5 起，应用必须经过**签名 (Signing)** 和**公证 (Notarization)** 才能直接运行
- 当前项目未配置 Apple Developer 签名，导致系统认为应用不可信

### 解决方案

#### 方法一：用户端临时解决（无需重新打包）

终端执行以下命令移除隔离属性：

```bash
# 移除单个应用的隔离属性
sudo xattr -r -d com.apple.quarantine /Applications/PlanTodos.app

# 或移除整个目录
sudo xattr -cr /Applications/PlanTodos.app
```

#### 方法二：开发者端永久解决（需要 Apple Developer 账号）

##### 1. 配置签名信息

编辑 `src-tauri/tauri.conf.json`：

```json
{
  "bundle": {
    "macOS": {
      "signingIdentity": "Developer ID Application: Your Name (TEAM_ID)",
      "entitlements": null,
      "hardenedRuntime": true,
      "providerShortName": "TEAM_ID"
    }
  }
}
```

##### 2. 准备签名证书

1. 在 Apple Developer 网站创建证书：
   - 类型：Developer ID Application
   - 用途：签名分发到 Mac App Store 外的应用

2. 下载并安装证书到钥匙串

3. 验证证书：
   ```bash
   security find-identity -v -p codesigning
   ```

##### 3. 构建并公证

```bash
# 1. 构建应用
pnpm tauri:build

# 2. 公证 (需要 App-specific password)
xcrun notarytool submit \
  src-tauri/target/release/bundle/dmg/PlanTodos_0.5.7_aarch64.dmg \
  --apple-id "your@email.com" \
  --team-id "YOUR_TEAM_ID" \
  --password "@keychain:AC_PASSWORD" \
  --wait

# 3. Staple (将公证票据附加到应用)
xcrun stapler staple \
  src-tauri/target/release/bundle/dmg/PlanTodos_0.5.7_aarch64.dmg
```

##### 4. 创建 App-specific Password

1. 访问 [Apple ID 账户页面](https://appleid.apple.com/)
2. 登录 → 安全 → App 专用密码 → 生成
3. 将密码添加到钥匙串：
   ```bash
   xcrun notarytool store-credentials "AC_PASSWORD" \
     --apple-id "your@email.com" \
     --team-id "YOUR_TEAM_ID" \
     --password "xxxx-xxxx-xxxx-xxxx"
   ```

### 签名配置说明

| 字段                | 说明                                                           |
| ------------------- | -------------------------------------------------------------- |
| `signingIdentity`   | 签名证书名称，格式：`Developer ID Application: Name (TEAM_ID)` |
| `entitlements`      | 权限配置文件路径，`null` 表示使用默认                          |
| `hardenedRuntime`   | 启用强化运行时，公证必需                                       |
| `providerShortName` | Team ID，用于公证                                              |

### 参考链接

- [Apple Code Signing Guide](https://developer.apple.com/library/archive/documentation/Security/Conceptual/CodeSigningGuide/)
- [Apple Notarization Guide](https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution)
- [Tauri macOS Signing](https://v2.tauri.app/reference/config/#macconfig)

---

## 三、其他平台注意事项

### Windows

- 无需额外签名即可正常运行
- 如需签名，需要购买代码签名证书

### Linux

- 无需签名，直接打包即可
- 支持 AppImage、deb、rpm 等格式

---

## 四、常见问题 FAQ

### Q1: Android 图标复制后仍然显示默认图标？

尝试清理构建缓存：

```bash
cd src-tauri
cargo clean
cd ..
rm -rf src-tauri/gen/android/app/build
pnpm tauri:android:build
```

### Q2: macOS 签名失败 "no identity found"？

确保证书已正确安装：

```bash
# 查看可用签名身份
security find-identity -v -p codesigning

# 如果为空，从 Apple Developer 下载证书并双击安装
```

### Q3: 公证失败 "The signature of the binary is invalid"？

确保使用 hardened runtime：

```json
{
  "bundle": {
    "macOS": {
      "hardenedRuntime": true
    }
  }
}
```

### Q4: 如何生成 Android 图标？

使用图像编辑工具或在线工具生成不同尺寸的图标：

- 推荐工具：[Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/)
- 或使用 `pnpm tauri icon` 从源图像自动生成
