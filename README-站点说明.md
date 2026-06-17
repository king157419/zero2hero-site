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

## 部署（已上线）

线上地址：**https://king157419.github.io/zero2hero-site/**

托管在 **GitHub Pages + GitHub Actions**：
- 部署仓库 `king157419/zero2hero-site`（独立于笔记仓库 zero2hero）
- `.github/workflows/deploy.yml`：每次 push 到 `main` 自动构建（装依赖 → `npm run bootstrap` 拉插件 → `npx quartz build`）并部署到 Pages

### 更新网站（push 即更新）

改完笔记后，在本目录执行：

```bash
npm run publish     # = node sync.mjs + git add + git commit + git push
```

约 3-4 分钟后 Actions 构建完成，网站自动刷新。要先本地看效果就 `npm run dev`。

> `content/` 已提交进仓库（CI 读不到本地笔记库 D:\Claude_Notes，所以发布的是仓库里 sync 进来的副本）。
> `baseUrl` 已设为 `king157419.github.io/zero2hero-site`；若以后绑自定义域名再改它并更新 Pages 设置。

## 实现备注（Windows 适配）

为在 Windows 非管理员环境跑通 Quartz 5，本项目改了两处：
- `quartz/plugins/loader/gitLoader.ts` 的 `trySymlink`：符号链接失败时回退到 **junction**（Windows 普通用户即可），再回退到复制。
- 用 `bootstrap.mjs` 直接调用 loader 的 `installPlugins` + `regeneratePluginIndex`，绕开 Quartz 自带 `install-plugins.ts` 的自举循环（它会过早 `import quartz.js` 导致插件索引鸡生蛋）。

这两处对 Linux/macOS 无副作用，CI 构建也能直接用。
