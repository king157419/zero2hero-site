# zero2hero 学习笔记 · 静态网站

用 [Quartz 5](https://quartz.jzhao.xyz) 把 `D:\Claude_Notes` 里的 Obsidian 笔记发布成静态网页。

## 它是怎么工作的

- **笔记源**：`D:\Claude_Notes`（你的 Obsidian 仓库，**这里从不被修改**）
- **本项目**：只放 Quartz 框架 + 配置 + 脚本
- **`sync.mjs`**：构建前把笔记里的 `.md` 复制进 `content/`（自动排除 `.docx`、`CLAUDE.md` 等），并生成中文首页

你照常在 Obsidian 写笔记，发布时跑一条命令，两边互不污染。

## 日常命令

```bash
npm run dev          # 本地预览：同步 + 构建 + 起服务器 → http://localhost:8080
npm run sync         # 只同步笔记，不构建
npm run site:build   # 干净完整构建（装插件 + 同步 + 构建到 public/），CI/部署用
npm run bootstrap    # 仅首次/换机：下载社区插件并生成插件索引
```

改完笔记重新 `npm run dev` 即可看到最新内容。

## 配置在哪改

- **`quartz.config.yaml`** — 站点标题、语言、`baseUrl`、主题色、启用/禁用插件
- **`sync.mjs`** — 顶部 `INCLUDE_DIRS` 控制发布哪些文件夹；`SECTIONS` 控制首页板块

## 已内置启用的功能

内容索引、RSS、sitemap、关系图谱、全文搜索、反向链接、KaTeX 数学公式、
Obsidian callouts / wikilinks、代码高亮、暗色模式、阅读模式、面包屑、目录。

## 部署

站点是纯静态 `public/`，任何平台都能托管。推荐 **Cloudflare Pages**（免费、不限流量）。

### 方式 A：本地构建 + 直接上传（最稳，推荐）

```bash
npm run site:build                  # 生成 public/
npx wrangler login                  # 首次：浏览器登录 Cloudflare（一次即可）
npx wrangler pages deploy public --project-name=zero2hero-notes
```

之后每次更新只需 `npm run publish`（= 构建 + 上传，见 package.json）。

### 方式 B：连 Git 仓库自动部署

1. 把本文件夹推到一个新的 GitHub 仓库
2. Cloudflare Pages → Connect to Git → 选该仓库
3. 构建命令 `npm run site:build`，输出目录 `public`，Node 版本 `22`
4. 之后 `git push` 即自动部署

> 部署后把 `quartz.config.yaml` 的 `baseUrl` 改成你的实际域名（如 `zero2hero-notes.pages.dev`），
> 这样 RSS / sitemap / 站内绝对链接才正确。

## 实现备注（Windows 适配）

为在 Windows 非管理员环境跑通 Quartz 5，本项目改了两处：
- `quartz/plugins/loader/gitLoader.ts` 的 `trySymlink`：符号链接失败时回退到 **junction**（Windows 普通用户即可），再回退到复制。
- 用 `bootstrap.mjs` 直接调用 loader 的 `installPlugins` + `regeneratePluginIndex`，绕开 Quartz 自带 `install-plugins.ts` 的自举循环（它会过早 `import quartz.js` 导致插件索引鸡生蛋）。

这两处对 Linux/macOS 无副作用，CI 构建也能直接用。
