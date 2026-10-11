# 1971.xin

罗祥的个人网站：工具库 + 文章。用 Astro 生成，纯静态，托管在 Cloudflare Pages。

## 结构

```
src/
├── pages/            # 路由：首页 / 工具库 / 文章 / 文章详情 / 关于 / 404
├── layouts/          # 全局布局（顶栏、页脚、meta、深浅色主题）
├── styles/           # 全局样式（设计 token 在这里）
└── content/
    ├── tools/        # 工具条目：一个 md 文件 = 一个工具
    └── articles/     # 文章：一个 md 文件 = 一篇文章
public/               # 原样复制到产物：图标、og 图、robots.txt、_headers
```

## 日常操作

**发文章**：在 `src/content/articles/` 里加一个 `.md` 文件（含 frontmatter），
提交推送，约 2 分钟自动上线。

**收录工具**：同理，文件放 `src/content/tools/`，`featured: true` 上首页。

## 本地命令

```bash
npm install    # 安装依赖
npm run dev    # 本地预览（热更新）
npm run build  # 构建到 dist/
```

## 部署

GitHub Actions 自动跑：push 到 `main` → `npm ci` → `astro build` →
`wrangler pages deploy dist` 到 Cloudflare Pages 项目 `1971-xin`。

样式与脚本文件名带内容哈希（`/_astro/*.css`），配合 `_headers` 里的
immutable 缓存策略，发布后浏览器必定拿到新版本。
