# 项目部署总结 & 经验沉淀

## 一、部署问题回顾

### 1.1 问题现象
- **网站**：https://imagebackground-remover.online
- **框架**：Next.js 15/16 + Cloudflare Pages
- **症状**：部署后访问报错 `Error: No such module "__next-on-pages-dist__/functions/api/async_hooks"`
- **根本原因**：Cloudflare Pages 构建环境默认使用 Node.js 18，而 Next.js 16 内部引用了 `async_hooks` 模块，Edge Runtime 不兼容

---

## 二、完整修复操作记录

### Day 1 — 基础配置

**① 添加 Cloudflare 域名**
- 将 `imagebackground-remover.online` 添加到 Cloudflare DNS
- 配置 `CNAME` 记录指向 Cloudflare Pages 分配的默认域名
- 获取 Zone ID、Account ID、API Token（Bearer token）

**② GitHub + Cloudflare Pages 集成**
- 授权 Cloudflare 访问 GitHub 仓库 `dvloveavi/image-background-remover`
- 设置 GitHub push 触发自动部署到 `main` 分支
- 等待域名状态从 `pending` → `active`

### Day 2 — 解决 async_hooks 运行时错误

**③ 创建 wrangler.toml**
- 在项目根目录新建 `wrangler.toml`
- 内容：
```toml
#:schema node_modules/wrangler/config-schema.json
name = "image-background-remover"
compatibility_date = "2024-04-03"
compatibility_flags = ["nodejs_compat"]
```

**④ 修改 next.config.ts（持续迭代，最终版）**
```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 强制 Webpack 忽略 async_hooks
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        async_hooks: false,
      };
    }
    return config;
  },
  experimental: {
    instrumentationHook: false,
  },
};

export default nextConfig;
```

**⑤ 精简 route.ts 为纯 Edge Runtime 代码**
```typescript
export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { image } = await req.json();
    const apiKey = process.env.REMOVE_BG_API_KEY;
    if (!image || !apiKey) {
      return new Response(JSON.stringify({ error: 'Missing Data' }), { status: 400 });
    }
    const base64Data = image.includes(',') ? image.split(',')[1] : image;
    const uint8Array = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    const blob = new Blob([uint8Array], { type: 'image/png' });
    const formData = new FormData();
    formData.append('image_file', blob, 'image.png');
    formData.append('size', 'auto');
    const res = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: { 'X-Api-Key': apiKey },
      body: formData,
    });
    if (!res.ok) return new Response(JSON.stringify({ error: 'API Error' }), { status: res.status });
    const arrayBuffer = await res.arrayBuffer();
    const base64Result = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    return new Response(JSON.stringify({ result: base64Result }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Edge Error' }), { status: 500 });
  }
}
```

**⑥ 安装适配器**
```bash
npm install @cloudflare/next-on-pages --legacy-peer-deps
```

**⑦ 添加 engines 字段到 package.json**
```json
{
  "engines": {
    "node": ">=20.9.0"
  }
}
```

### Cloudflare 控制台手工操作（用户完成）

**⑧ 强制指定 Node 版本**
- Settings → Environment variables → 添加 `NODE_VERSION = 20.9.0`

**⑨ 切换 Build system version**
- Settings → Build & deployments → Build system version → **Version 2**

---

## 三、需求文档（Deployment）

### 3.1 功能需求
- [x] 用户可上传图片（支持 JPG/PNG/WebP，最大 10MB）
- [x] 调用 remove.bg API 去除背景
- [x] 返回处理后的图片（Base64 格式）
- [x] 前端预览并支持下载

### 3.2 技术栈
- **前端框架**：Next.js 16.2.1
- **React**：19.2.4
- **样式**：Tailwind CSS v4
- **部署平台**：Cloudflare Pages
- **域名**：imagebackground-remover.online
- **API**：remove.bg

### 3.3 部署配置清单
| 配置项 | 值 |
|--------|-----|
| Node.js 版本 | >= 20.9.0（生产环境强制） |
| 构建命令 | `next build` |
| 构建系统版本 | **Version 2**（非 Version 3） |
| 兼容性标志 | `nodejs_compat` |
| API Route Runtime | Edge（`export const runtime = 'edge'`） |
| 必需环境变量 | `REMOVE_BG_API_KEY` |

---

## 四、经验总结 & 避坑指南

### 4.1 Cloudflare Pages + Next.js 必查清单

> **Node 版本是万恶之源。** Cloudflare Pages 默认用 Node 18，Next.js 16 内部依赖 async_hooks，Edge Runtime 不支持 → 必挂。

- [x] **NODE_VERSION 环境变量**强制设为 `20.9.0` 或 `20`
- [x] **Build system version** 选 **Version 2**（Version 3 对 Next.js 16 兼容性问题更多）
- [x] 部署前 `engines.node >= 20.9.0` 写入 package.json
- [x] `compatibility_flags = ["nodejs_compat"]` 写入 wrangler.toml

### 4.2 Edge Runtime 代码规范

Next.js API Route 在 Edge Runtime 下**绝对不能**引入任何 Node.js 模块：

| 禁止 | 替代方案 |
|------|---------|
| `import { Buffer } from 'buffer'` | `Uint8Array` + `atob/btoa` |
| `import from 'node:...' | 纯 Web API |
| `require('async_hooks')` | 不引用，webpack alias 设为 false |
| `import { NextRequest }` (可选) | 直接用原生 `Request` |
| `Buffer.from(...)` | `Uint8Array.from(...)` |

### 4.3 wrangler.toml 最小配置

```toml
#:schema node_modules/wrangler/config-schema.json
name = "your-project-name"
compatibility_date = "2024-04-03"
compatibility_flags = ["nodejs_compat"]
```

### 4.4 next.config.ts Edge 兼容配置

```typescript
const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        async_hooks: false,
      };
    }
    return config;
  },
  experimental: {
    instrumentationHook: false,
  },
};
```

### 4.5 部署后排查流程

```
1. 看日志（Cloudflare Dashboard → Deployments → 点击最新 → 查看 Build log）
2. 确认 Node 版本（Settings → Environment variables → NODE_VERSION）
3. 确认 Build system version 是 Version 2
4. 确认 wrangler.toml 存在且有 nodejs_compat
5. 本地 npm run build 确认无错再 push
6. 强制 clean build：随便改一个文件（加空格）再 commit push
```

---

## 五、相关配置文件路径

```
image-background-remover/
├── wrangler.toml                        ← 新建：Cloudflare 运行时配置
├── next.config.ts                      ← 修改：webpack alias + 实验功能关闭
├── app/api/remove-background/route.ts  ← 修改：纯 Edge Runtime 代码
├── package.json                        ← 修改：engines 字段 + pages:build 脚本
└── worker/index.ts                     ← 现有 Worker（未改动，备用）
```

---

*最后更新：2026-03-29*
