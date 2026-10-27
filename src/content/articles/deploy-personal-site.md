---
title: 零基础建站实录：从注册域名到网站上线部署
description: 以 1971.xin 为实例，手把手讲清个人网站怎么注册域名、改解析、上传文件、绑定域名并自动部署——每一步都写清点哪里、填什么、会看到什么。
pubDate: 2026-10-27
tags: [建站, 部署, Cloudflare, 教程]
featured: false
---

> 全文以 **1971.xin** 为实例，每一步都写清「点哪里、填什么、会看到什么」。
> 看不懂原理没关系，照着点就能上线。这套流程是本人实战跑通过的，不是纸上谈兵。

---

## 全景：你要在两个网站之间来回

建个人网站，本质是在两个平台之间协作：

```
┌─────────────────────┐          ┌─────────────────────┐
│   阿里云（或腾讯云）  │          │     Cloudflare      │
│   ① 买域名           │          │  ② 接管域名（改 NS） │
│   ④ 改 NS 地址       │  ──────▶ │  ③ 上传网站文件     │
│                     │          │  ⑤ 绑定域名+发证书  │
└─────────────────────┘          └─────────────────────┘
         ↑                                  ↓
    域名在这里买                    网站和解析都在这里管
```

| 步骤 | 在哪做 | 花多久 | 花多少钱 |
|---|---|---|---|
| ① 注册域名 | 阿里云 / 腾讯云 / Cloudflare | 10 分钟 | ¥35–99/年 |
| ② 改 NS，把域名交给 CF | 两个网站 | 10 分钟 + 等 1–2 小时 | ¥0 |
| ③ 上传网站文件 | Cloudflare | 10 分钟 | ¥0 |
| ④ 绑定域名（解析） | Cloudflare | 5 分钟 + 等 5 分钟 | ¥0 |
| ⑤ 验证能用 | 浏览器 | 3 分钟 | ¥0 |

---

## 第 1 步 · 注册域名

### 1.1 打开哪个网址

| 平台 | 网址 | 适合 |
|---|---|---|
| 阿里云万网 | `wanwang.aliyun.com` | 中文、支付宝、能备案 |
| 腾讯云 | `dnspod.cloud.tencent.com` | 中文、活动多 |
| Cloudflare | `dash.cloudflare.com` → Domain Registration | 成本价、续费不涨 |

下面以**阿里云**为例（界面是中文，对新手最友好）。

### 1.2 搜索并挑选

1. 打开 `wanwang.aliyun.com`，用支付宝/淘宝账号登录
2. 页面正中有一个大搜索框，输入你想要的名字，例如 `luoxiang`
3. 点「查域名」，会列出 `luoxiang.com`、`.cn`、`.net`、`.xin` 等各后缀
4. 每行会显示：
   - **绿色「注册」按钮** = 可以买
   - **灰色「已注册」** = 被占了，换个名字
   - **价格**：注意看小字，通常会写「首年 ¥XX，续费 ¥XX」

**挑名字的三个建议**：
- 用**真名拼音**或**常用 ID**，别用需要解释的缩写
- 越短越好，别加数字和连字符（容易打错）
- 先想好 2–3 个备选，`.com` 好名字基本被抢光了

> 以 1971.xin 为例：前缀 `1971` 是出生年份，后缀 `.xin` 取「信」的意思。
> 这个组合便宜（¥35–60/年），但缺点也明显——**很多人不认识 `.xin` 后缀**。

### 1.3 结算页每个选项什么意思

点「注册」后进入结算页，你会看到这些：

| 选项 | 什么意思 | 建议 |
|---|---|---|
| **注册年限** | 一次买几年 | 建议 **2–3 年**，省得忘记续费 |
| **域名持有者信息** | 谁拥有这个域名 | 必须填**和身份证一致**的真实信息 |
| **信息模板** | 阿里云保存的实名信息 | 第一次要新建，之后可复用 |
| **隐私保护** | 隐藏你的姓名电话 | **务必勾选**（多数平台免费） |
| **云解析 DNS** | 解析服务 | 选**免费版**就够 |
| **SSL 证书** | HTTPS 证书 | **不用买**，Cloudflare 免费送 |

**⚠️ 只买域名。** 页面上会推销「网站建设」「企业邮箱」「SSL 证书」「域名锁」，个人站全都不需要——**SSL 我们后面免费拿，邮箱也不是必须**。

### 1.4 实名认证（必须做，否则域名不能用）

1. 支付后会提示上传身份证照片（正反面）
2. 提交后等审核，通常**几分钟到几小时**
3. 审核通过前，域名状态是「**实名认证审核中**」——这时候**不能解析**

**这一步卡住最常见的两个原因**：
- 持有者姓名和身份证不完全一致（多一个字、少一个字都不行）
- 身份证照片模糊/反光

### 1.5 成功后你会看到什么

登录阿里云 → 控制台 → **域名** → **域名列表**，你会看到一行：

```
域名          状态        到期时间      操作
1971.xin     正常        2027-10-20   解析 | 管理 | 续费
```

| 列 | 意思 |
|---|---|
| **状态** | 「正常」才对；「审核中」要等；「即将过期」要续费 |
| **到期时间** | **设个日历提醒，提前 30 天** |
| **解析** | 点这里进 DNS 记录页面（第 2、4 步会用到） |
| **管理** | 改持有者信息、改 DNS 服务器地址（第 2 步要用） |

**记下三个东西**（后面要用）：
- 域名本身：`你的名字.com`
- 注册商：阿里云
- 控制台入口：`dash.aliyun.com` → 域名

---

## 第 2 步 · 把域名交给 Cloudflare 管（改 NS）

### 2.1 为什么必须做这一步

**一句话**：不改 NS，你的域名就归阿里云管；改了之后，**所有解析、证书、加速都在 Cloudflare 一个后台完成**，而且 HTTPS 证书自动续期、永久免费。

跳过这步行不行？可以——那你得自己在阿里云一条条加 DNS 记录，而且**裸域（不带 www 的 `你的名字.com`）绑定 Pages 必须有 Cloudflare 托管**。所以这一步是绕不开的。

### 2.2 在 Cloudflare 添加站点（5 步）

1. 打开 `dash.cloudflare.com`，注册/登录（邮箱 + 密码，免费，不需要信用卡）
2. 登录后点右上角 **Add a site**（或首页的「添加站点」）
3. 输入你的域名，**只输 `你的名字.com`，不要带 `www`、不要带 `https://`**
4. 选套餐 → 选 **Free（免费）**，一路点 Continue
5. Cloudflare 会自动扫描你现有的 DNS 记录（有时扫不到，没关系）

### 2.3 复制这两个 NS 地址（关键）

扫描完成后，页面会显示类似这样的两行：

```
cora.ns.cloudflare.com
mack.ns.cloudflare.com
```

**这就是 NS（Name Server，名称服务器）地址。** 每个账号分到的两个不一样，**必须复制你自己看到的**。

> **1971.xin 现在用的正是这两个**：`cora.ns.cloudflare.com` / `mack.ns.cloudflare.com`
> 你可以用命令验证任何域名的 NS：
> ```bash
> nslookup -type=NS 你的名字.com 1.1.1.1
> ```

### 2.4 回阿里云改 NS（最容易出错的一步）

1. 回到阿里云 → **控制台** → **域名** → 找到你的域名 → 点 **管理**
2. 左侧菜单找 **DNS 修改**（有的版本叫 **DNS 服务器** 或 **修改 DNS**）
3. 看到默认是两个阿里云的地址（如 `dns1.hichina.com` / `dns2.hichina.com`）
4. **把这两个删掉/替换**成 Cloudflare 给你的两个
5. 保存

**⚠️ 三个注意**：
- 是**替换**，不是新增（只能有两个）
- 结尾不要加句号，不要加 `http://`，就是纯地址
- 如果域名开了 **DNSSEC**，必须先在阿里云**关掉**再改 NS，否则域名会直接不可访问

### 2.5 回 Cloudflare 点「我改好了」

1. 回到 Cloudflare 那个页面，点 **I updated my nameservers** / **Check nameservers now**
2. 状态会显示 **Pending**（等待中）
3. **等 1–2 小时**（最长可能 24 小时，取决于注册商同步速度）
4. 状态变成 **Active**，页面提示 **「Your domain is now protected by Cloudflare」** = 成功

### 2.6 怎么确认真的生效

```bash
# 在任意电脑的命令行里跑（Windows 按 Win+R 输入 cmd）
nslookup -type=NS 你的名字.com 1.1.1.1
```

看到 `cora.ns.cloudflare.com` 这类地址 = 生效了。
还显示 `dns1.hichina.com` = 还没同步，再等。

---

## 第 3 步 · 解析到底在做什么

### 3.1 用电话簿理解

DNS 解析 = **一本全网通用的电话簿**。

```
你在浏览器输入 1971.xin
        ↓  查电话簿
DNS 说：这个域名对应的服务器在 xxx
        ↓
浏览器去那台服务器取网页
```

「解析」就是**往这本电话簿里写一条记录**，告诉全世界「这个域名该去哪找」。

### 3.2 五种记录类型（你只用得上一种）

| 类型 | 作用 | 你什么时候用 |
|---|---|---|
| **A** | 指向一个 IP 地址（如 `1.2.3.4`） | 自己买服务器时 |
| **CNAME** | 指向另一个域名（如 `xxx.pages.dev`） | **接 Cloudflare Pages 就用这个** ✅ |
| **TXT** | 存一段文字，常用于验证所有权 | 平台让你「验证域名」时 |
| **MX** | 邮件服务器地址 | 配企业邮箱时 |
| **AAAA** | 指向 IPv6 地址 | 很少用 |

**结论**：用 Cloudflare Pages 建站，你**只需要理解 CNAME**。

### 3.3 字段逐个解释（这条最重要）

不管在阿里云还是 Cloudflare，加记录都是填这几个框：

| 字段 | 叫什么（阿里云） | 叫什么（Cloudflare） | 什么意思 | 你填什么 |
|---|---|---|---|---|
| 记录类型 | 记录类型 | **Type** | 这条记录是哪种 | 选 `CNAME` |
| 主机记录 | 主机记录 | **Name** | 哪个子域名 | `@` 或 `www`（见下） |
| 记录值 | 记录值 | **Content** | 指向哪 | `你的项目.pages.dev` |
| TTL | TTL时间 | **TTL** | 缓存多久 | 默认 `Auto` / `10 分钟` |
| 代理状态 | — | **Proxy status** | 是否走 CF 加速 | **Proxied（橙色云）** |

#### 最容易错的一栏：「主机记录」

| 你想让哪个地址能打开 | 主机记录填 | 完整域名 |
|---|---|---|
| `你的名字.com`（裸域） | **`@`** | 你的名字.com |
| `www.你的名字.com` | **`www`** | www.你的名字.com |
| `blog.你的名字.com` | **`blog`** | blog.你的名字.com |

**⚠️ 最常见错误**：在「主机记录」里填了完整的 `www.你的名字.com`，结果变成 `www.你的名字.com.你的名字.com`，永远打不开。**只填前缀，不要填完整域名。**

### 3.4 顺便认识两个图标（Cloudflare 特有）

DNS 记录列表右边有一朵云：

| 图标 | 名字 | 含义 |
|---|---|---|
| 🟠 **橙色云** | Proxied | 流量走 Cloudflare 加速，有缓存和防护，**隐藏真实服务器** |
| ⚪ **灰色云** | DNS only | 只返回地址，不过 CF 网络 |

**规则**：
- 你的网站记录（CNAME）→ **橙色云**
- 邮箱相关记录（MX）→ **必须灰色云**，否则邮件会坏
- 平台验证用的 TXT → 不涉及云

---

## 第 4 步 · 上传网站文件

### 4.1 先进对页面

Cloudflare 左侧菜单 → **Workers & Pages**（这是唯一需要用的入口）。

进去后看到你的项目列表。如果是全新的，点 **Create** 开始。

### 4.2 方式 A：拖拽上传（最简单，5 分钟）

1. **Create** → 选 **Pages** → 选 **Upload assets**
2. 项目名填 `my-site`（小写字母 + 连字符，不能有中文和空格）
3. 页面出现一个虚线框，写着「拖放你的文件」
4. **把整个网站文件夹拖进去**（不是拖单个文件！）
5. 点 **Deploy site** → 等 10 秒 → 出现 `my-site-abc.pages.dev` 的地址

**⚠️ 最致命的错误**：只拖了 `index.html`。Cloudflare Pages 是**整份替换**，只有 index.html 的话，线上 CSS、图片、脚本**全部消失**，网站会变成黑白裸文字。

**正确做法**：把**整个文件夹里的所有文件**一起拖进去。

### 4.3 方式 B：连接 GitHub（推荐，配一次管很久）

**先决条件**：代码已经推到 GitHub 仓库。

1. **Create** → **Pages** → **Connect to Git**
2. 授权 GitHub（第一次会让你登录并授权）
3. 选仓库 → 选分支（`main`）
4. **构建设置**（三种情况）：

| 你的站 | Framework preset | Build command | Build output directory |
|---|---|---|---|
| 纯 HTML | **None** | （留空） | `/` 或填你的文件夹名 |
| Astro | **Astro** | `npm run build` | `dist` |
| Hugo | Hugo | `hugo` | `public` |

5. 点 **Save and Deploy**
6. 等 1–3 分钟，看到 **Success** = 部署完成

**配好之后**：以后每次 `git push`，它自动重新构建部署，**约 2 分钟上线**。

---

## 第 5 步 · 绑定域名（这一步就是「解析」）

### 5.1 进入绑定页面

**Workers & Pages** → 点你的项目 → 顶部标签 **Custom domains** → **Set up a domain**

### 5.2 输入域名

```
输入框：你的名字.com
```

点 **Continue**。

### 5.3 接下来会出现两种情况

#### 情况 A：域名在 Cloudflare 托管（第 2 步做过）

```
✓ Cloudflare 已自动创建 DNS 记录
✓ 点 "Activate domain"
✓ 1–5 分钟生效
✓ HTTPS 证书自动签发
```

你**什么都不用填**，点一下按钮就行。这是最省事的路径。

#### 情况 B：域名还在阿里云（没做第 2 步）

Cloudflare 会告诉你需要手动加一条记录，内容类似：

| 字段 | 你要填的值 |
|---|---|
| 记录类型 | `CNAME` |
| 主机记录 | `www`（或 `@`） |
| 记录值 | `你的项目名.pages.dev` |
| TTL | 600（10 分钟） |

然后：
1. 去阿里云 → 域名 → **解析** → **添加记录**
2. 按上表填
3. 回 Cloudflare 点 **Verify** / **激活**

**⚠️ 但裸域（`你的名字.com` 不带 www）在情况 B 下大概率绑不上**，因为根域名不能设 CNAME。所以**建议还是走第 2 步，把 NS 改过来**。

### 5.4 1971.xin 的两条记录长这样

| 类型 | 名称 | 内容 | 代理 | 对应地址 |
|---|---|---|---|---|
| CNAME | `@` | `1971-xin.pages.dev` | 🟠 Proxied | https://1971.xin |
| CNAME | `www` | `1971-xin.pages.dev` | 🟠 Proxied | https://www.1971.xin |

**两条都要加**，否则只有其中一个地址能打开。（它们是同一个项目，内容完全一样，不是两份网站。）

### 5.5 怎么确认成功（三看）

| 看什么 | 在哪看 | 成功的样子 |
|---|---|---|
| **① 状态** | Custom domains 列表 | `Active`（不是 Pending / Failed） |
| **② 锁图标** | 浏览器地址栏左边 | 🔒 有锁 = HTTPS 正常 |
| **③ 能打开** | 浏览器访问 | 显示你的网站，不是报错 |

**证书什么时候好？** Cloudflare 自动签，通常 **1–15 分钟**。1971.xin 用的是 Google Trust Services 的证书，**3 个月自动续期一次**，永远不用管。

---

## 第 6 步 · 后台界面逐个认

> 这一章解决「我登录进去一脸懵」的问题。建议对照着看一遍。

### 6.1 左侧菜单（Cloudflare 后台）

| 菜单项 | 中文意思 | 你什么时候用 |
|---|---|---|
| **Workers & Pages** | 网站和函数 | **⭐ 主要就在这** |
| Web Analytics | 访问统计 | 看有多少人访问 |
| **DNS**（点进你的域名后） | 解析记录 | 加/改域名指向 |
| SSL/TLS | 证书设置 | 一般不用动 |
| Caching | 缓存 | 一般不用动 |
| Rules | 规则 | 不用动 |
| R2 / D1 / KV | 存储与数据库 | 做工作台才用 |
| Zero Trust | 企业安全 | 个人用不到 |

**找不到「DNS」？** 它是**点进具体域名之后**才出现的，不是一级菜单。路径是：账号首页 → 点你的域名 → 左侧才有 DNS。

### 6.2 项目页的五个标签

点进 **Workers & Pages → 你的项目**，顶部有五个标签：

| 标签 | 里面是什么 | 什么时候用 |
|---|---|---|
| **Deployments** | 每一次发布的记录（时间、状态、可回滚） | **出问题回滚、看历史** |
| **Custom domains** | 绑了哪些域名 | 绑域名、换域名 |
| **Metrics** | 访问量、错误率、带宽 | 每月看一眼 |
| **Functions** | 后端运行日志 | 有后端时看报错 |
| **Settings** | 环境变量、绑定、构建配置 | 改配置 |

**Deployments 里每一行长这样**：

```
时间              状态       来源          操作
2026-10-25 20:42  ✓ Success  GitHub: main  ⋯
2026-10-25 20:26  ✓ Success  GitHub: main  ⋯
2026-10-24 10:11  ✗ Failure  GitHub: main  ⋯
```

- 点任意一行 → 看这次发布的详情和日志
- 点右边 `⋯` → **Rollback**（回滚到这一版）
- **红叉 = 失败**，点进去看日志找原因

### 6.3 DNS 记录页怎么读

点你的域名 → 左侧 **DNS** → **Records**，每条记录一行：

```
Type   Name    Content                Proxy status   TTL
CNAME  @       1971-xin.pages.dev     Proxied        Auto
CNAME  www     1971-xin.pages.dev     Proxied        Auto
TXT    @       v=spf1 ...             DNS only       Auto
```

| 列 | 读法 |
|---|---|
| **Type** | 记录类型（CNAME / A / TXT / MX） |
| **Name** | 主机名（`@` = 根域名，`www` = 子域名） |
| **Content** | 指向哪里 |
| **Proxy status** | 橙色云 = 走 CF，灰色云 = 不走 |
| **TTL** | 缓存时间，`Auto` 就行 |

**右上角 Add record** = 加新记录；每行右边 **Edit** = 改；**Delete** = 删。

### 6.4 你会看到的状态词

| 英文 | 中文 | 意思 |
|---|---|---|
| **Active** | 已激活 | 正常，可以用 |
| **Pending** | 等待中 | 还在生效，等 |
| **Failed** | 失败 | 记录填错了，去检查 |
| **Proxied** | 已代理 | 橙色云，走 CF |
| **DNS only** | 仅 DNS | 灰色云，直接连源站 |
| **Success / Failure** | 成功/失败 | 部署结果 |

---

## 第 7 步 · 在哪里加内容

### 7.1 先判断你的站属于哪种

| 类型 | 特征 | 内容在哪 |
|---|---|---|
| **纯 HTML 站** | 只有 `index.html` + `style.css` | **改 index.html 本身** |
| **静态生成站**（Astro/Hugo） | 有 `src/` 或 `content/` 文件夹 | **改里面的 md 文件** |
| **GitHub 网页编辑** | 不想装任何软件 | **在 GitHub 网页上直接改** |

### 7.2 【1971.xin 实例】内容在哪

```
1971-site/
├── src/
│   ├── content/
│   │   ├── articles/     ← ⭐ 文章在这里，一个 md 一篇
│   │   │   ├── ai-diary.md
│   │   │   ├── facefusion-8gb.md
│   │   │   └── migrate-to-astro.md
│   │   └── tools/        ← ⭐ 工具在这里，一个 md 一个
│   │       ├── workbuddy.md
│   │       └── ...
│   ├── pages/            ← 页面骨架（改版式才动）
│   ├── layouts/          ← 顶栏页脚（改导航才动）
│   └── styles/           ← 配色样式（改外观才动）
├── public/               ← 图标、分享图、robots
└── functions/            ← 后端（一般不动）
```

**日常只需要做一件事**：往 `src/content/articles/` 里加一个 `.md` 文件。

一个文章文件的完整内容长这样：

```markdown
---
title: 我用 AI 管日记
description: 一句话说清这篇讲什么
pubDate: 2026-10-26
tags: [AI, 生活]
featured: false
---

正文从这里开始，正常写字就行。

## 小标题

- 列表项一
- 列表项二

**加粗**，`代码`，[链接](https://example.com)
```

`---` 之间的部分是「元信息」（标题、日期等），下面是正文。**不用记语法，让 AI 写就行。**

### 7.3 零安装方案：在 GitHub 网页上直接改（最推荐给新手）

不想装任何软件？GitHub 网页就能改：

1. 打开 `github.com/你的用户名/你的仓库`
2. 点进要改的文件（比如 `src/content/articles/` 里的一篇）
3. 右上角 **铅笔图标**（Edit this file）
4. 直接改内容
5. 滚到底，点 **Commit changes**
6. 等一下，自动部署 → 约 2 分钟上线

**这条路径不需要装 Git、不需要命令行、手机上也能改。**

---

## 第 8 步 · 怎么部署（本站的自动流水线）

### 8.1 三种方式的区别

| 方式 | 操作 | 多久 | 适合 |
|---|---|---|---|
| **拖拽上传** | 手动把文件夹拖到网页 | 30 秒 | 只上线一次 |
| **GitHub 自动**（推荐） | push 一次，之后自动 | 配一次 | 持续更新 |
| **命令行** | 终端跑命令 | 30 秒 | 有技术背景 |

### 8.2 push 自动部署（配一次，永久生效）

**第一次配置**（约 10 分钟）：

1. **建 GitHub 仓库**：`github.com` → New repository → 名字 → Public → Create
2. **推代码**（在网站文件夹里，需要装 Git）：
   ```bash
   git init
   git add -A
   git commit -m "first commit"
   git branch -M main
   git remote add origin https://github.com/你的用户名/你的仓库.git
   git push -u origin main
   ```
3. **拿 Cloudflare Token**：CF 右上头像 → My Profile → **API Tokens** → Create Token
   → 权限只勾 **Account → Cloudflare Pages → Edit** → 复制（只显示一次）
4. **存进 GitHub**：仓库 → Settings → **Secrets and variables → Actions** → New repository secret
   → Name: `CLOUDFLARE_API_TOKEN`，Value: 粘贴 token
5. **加部署脚本** `.github/workflows/deploy.yml`（内容见下）
6. **push 一次**，去仓库 **Actions** 标签看绿勾

**部署脚本**（1971.xin 实际在用的，可直接抄）：

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - run: test -f dist/index.html || exit 1
      - uses: cloudflare/wrangler-action@v4
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: pages deploy dist --project-name=你的项目名
```

**以后改内容**：
```bash
git add -A && git commit -m "更新" && git push
```
约 2 分钟自动上线。

### 8.3 部署后在哪看结果

| 看什么 | 在哪 | 成功标志 |
|---|---|---|
| 构建状态 | GitHub 仓库 → **Actions** 标签 | 绿勾 ✓ |
| 发布记录 | Cloudflare → 项目 → **Deployments** | Success |
| 线上内容 | 浏览器打开域名 | 看到新内容 |

**别忘了按 `Ctrl+Shift+R` 硬刷新**，否则可能看到浏览器缓存的旧版。

---

## 第 9 步 · 1971.xin 完整配置对照表

这是本站的全部真实配置，以后对照着看：

| 项目 | 值 | 在哪看 |
|---|---|---|
| 域名 | `1971.xin` | 浏览器 |
| 注册商 | 阿里云（万网） | 阿里云控制台 → 域名 |
| NS 服务器 | `cora.ns.cloudflare.com`<br>`mack.ns.cloudflare.com` | 阿里云 → 域名 → 管理 → DNS 修改 |
| DNS 托管 | Cloudflare（Free 套餐） | CF 后台 → 你的域名 → DNS |
| 解析记录 | `@` → `1971-xin.pages.dev`（橙色云）<br>`www` → `1971-xin.pages.dev`（橙色云） | CF → DNS → Records |
| Pages 项目名 | `1971-xin` | CF → Workers & Pages |
| 项目类型 | **Direct Upload**（手动上传型） | CF → 项目 → Settings |
| 生产分支 | `main` | CF → 项目 → Settings → Builds |
| HTTPS 证书 | Google Trust Services，3 个月自动续 | 浏览器点小锁 → 证书 |
| 代码仓库 | `github.com/miles0714320/1971.xin` | GitHub |
| 部署方式 | GitHub Actions → `wrangler pages deploy dist` | 仓库 `.github/workflows/deploy.yml` |
| 构建产物 | `dist/` 文件夹 | 本地 |
| 月成本 | 约 ¥3–8（只有域名摊销） | — |

**两个容易混淆的点**：

1. **项目名是 `1971-xin`，不是 `1971`**。这个账号下还有另一个项目 `knowledge-vault-site`（绑定 `wiki.1971.xin`），是另一个站。
2. **`1971.xin` 和 `www.1971.xin` 是同一个项目**。不是两份网站，是同一个项目绑了两个域名。

---

## 附录 A · 解析字段速查

同一个概念，两家叫法不同：

| 概念 | 阿里云 | Cloudflare |
|---|---|---|
| 记录类型 | 记录类型 | Type |
| 子域名前缀 | 主机记录 | Name |
| 指向目标 | 记录值 | Content |
| 缓存时间 | TTL时间 | TTL |
| 是否加速 | （无） | Proxy status |

**填值速查**：

| 你想实现 | 类型 | 主机记录 / Name | 记录值 / Content |
|---|---|---|---|
| 网站主域名 | CNAME | `@` | `项目.pages.dev` |
| www 子域名 | CNAME | `www` | `项目.pages.dev` |
| 博客子域名 | CNAME | `blog` | 目标地址 |
| 自建服务器 | A | `@` | `1.2.3.4`（IP） |
| 验证所有权 | TXT | 平台给的值 | 平台给的值 |
| 企业邮箱 | MX | `@` | 邮件服务器地址 |

---

## 附录 B · 界面中英文对照

| 英文 | 中文 |
|---|---|
| Dashboard | 控制台 / 后台 |
| Workers & Pages | 网站与函数 |
| Add a site | 添加站点 |
| Nameservers (NS) | 名称服务器 |
| DNS Records | 解析记录 |
| Custom domains | 自定义域名 |
| Set up a domain | 设置域名 |
| Activate domain | 激活域名 |
| Deployments | 部署记录 |
| Rollback | 回滚 |
| Proxied / DNS only | 已代理 / 仅 DNS |
| Environment variables | 环境变量 |
| Secrets | 密钥 |
| Build command | 构建命令 |
| Build output directory | 输出目录 |

---

## 附录 C · 十个最常见的错

| # | 错误 | 后果 | 怎么避 |
|---|---|---|---|
| 1 | 只拖了 index.html | 网站变黑白裸文字 | **必须整个文件夹一起传** |
| 2 | 主机记录填了完整域名 | `a.com.a.com` 打不开 | 只填前缀，根域名用 `@` |
| 3 | 只绑了 www，没绑裸域 | 输 `你的名字.com` 打不开 | **两个都加** |
| 4 | 改 NS 前没关 DNSSEC | 域名直接不可访问 | 先去注册商关 DNSSEC |
| 5 | 域名没实名就解析 | 解析不生效 | 等实名审核通过 |
| 6 | 邮箱记录设成橙色云 | 收不到邮件 | MX 相关记录必须灰色云 |
| 7 | 域名过期没续 | 被别人抢注 | 开自动续费 + 日历提醒 |
| 8 | 项目名填错 | `project not found` | 去 CF 项目列表核对 |
| 9 | 改了代码没 push | 线上没变化 | 确认 push 成功 + 看 Actions |
| 10 | 看到旧内容就以为失败 | 反复瞎折腾 | **先 `Ctrl+Shift+R` 硬刷新** |

---

## 附录 D · 上线检查清单（可打印）

### 域名阶段
- [ ] 域名注册成功，状态「正常」
- [ ] 实名认证通过
- [ ] 开了自动续费，日历加了提醒
- [ ] 记录了到期日

### 解析阶段
- [ ] NS 已改为 Cloudflare 的两个地址
- [ ] CF 里域名状态是 **Active**
- [ ] `nslookup -type=NS 你的域名` 显示 cloudflare

### 部署阶段
- [ ] 网站文件**成套**上传（不是单个）
- [ ] `项目.pages.dev` 能正常打开
- [ ] 部署记录显示 Success

### 绑定阶段
- [ ] 裸域（`你的名字.com`）绑上了
- [ ] www（`www.你的名字.com`）也绑上了
- [ ] 两个都显示 **Active**
- [ ] 地址栏有 🔒 小锁
- [ ] 手机上打开排版正常

### 上线后
- [ ] 导航每一项都能点开
- [ ] 错误网址显示 404 页面
- [ ] 分享到微信有标题和配图
- [ ] `/README.md`、`/.git/` 返回 404（源码没泄露）

---

> **卡住了怎么办**
> 九成的卡点集中在三处：**实名没过、NS 没生效、DNS 记录填错**。
> 按这个顺序查一遍，一般都能解决。
> 还不行就截图发 AI——把「你看到的界面」发过去，比描述十句话都准。
