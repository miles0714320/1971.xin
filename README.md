# 1971.xin

我的个人网站。纯静态，Cloudflare Pages 托管。

## 技术栈

HTML / CSS / 原生 JavaScript，无构建步骤、无框架、无依赖。

## 部署方式（重要）

本站的 Cloudflare Pages 项目是 **Direct Upload（直接上传）类型**，不是 Git 集成类型。

**Direct Upload 项目无法在 Cloudflare 后台切换为 Git 集成**（官方限制），所以本站
**不是**"推送即自动构建"。真正的自动部署由本仓库的 GitHub Actions 完成：

```
本地改文件 → git push 到 main → GitHub Actions 调 wrangler pages deploy
           → 上传到 Cloudflare Pages 项目 1971 → 1971.xin 上线
```

工作流文件：`.github/workflows/deploy.yml`

### 首次配置（只需做一次）

仓库 `Settings → Secrets and variables → Actions` 新增 secret：

| 名称 | 值 |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Token，权限**仅**勾选 `Account → Cloudflare Pages → Edit` |

> ⚠️ 不要使用 Global API Key，那是整个账号的权限。
> 配好之后 `git push` 即自动上线，无需本地再跑部署脚本。

### 分支规则

- 推送到 `main` → 直接上线 1971.xin
- 推送到其他分支 → 只生成预览网址，不影响线上
- 也可以在 Actions 页面点 `workflow_dispatch` 手动发布

## 文件说明

| 文件 | 作用 |
|---|---|
| `index.html` | 页面全部内容与文字 |
| `style.css` | 颜色、字号、间距、深浅色适配 |
| `script.js` | 复制邮箱按钮 |
| `404.html` | 网址打错时显示的页面 |
| `robots.txt` | 搜索引擎抓取声明 |
| `sitemap.xml` | 站点地图 |
| `_headers` | 缓存策略与安全响应头 |
| `_redirects` | 错误路径转 404 的规则 |

> ⚠️ `_headers` 与 `_redirects` **必须随部署一起上传才生效**。它们已在
> `.wranglerignore` 之外，不会被排除。

## 本地预览

```bash
npx serve .
```

或直接双击 `index.html`（部分浏览器对本地文件有限制，建议用上面的方式）。
