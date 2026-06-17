// sync.mjs — 把 Obsidian 笔记库里的 .md 同步进 Quartz 的 content/
// 笔记原样不动；每次构建前运行此脚本即可。
import fs from "node:fs"
import path from "node:path"

// ── 配置 ──────────────────────────────────────────────
const SOURCE = "D:/Claude_Notes" // 你的 Obsidian 笔记库（源，只读）
const DEST = path.join(import.meta.dirname, "content") // Quartz 内容目录

// 只同步这些顶层文件夹（保持顺序 = 站点导航顺序）
const INCLUDE_DIRS = [
  "01-大模型LLM",
  "02-Gated-Attention",
  "03-课程-计算机组成原理",
  "04-课程-最优化算法",
  "99-杂项",
]

// 只复制这些扩展名（.docx 等二进制不发布）
const INCLUDE_EXT = new Set([".md", ".canvas", ".base", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"])

// 首页各板块的中文标题 + 简介
const SECTIONS = [
  { dir: "01-大模型LLM", title: "大模型 LLM", desc: "从零构建大语言模型：数据准备、Transformer 架构、预训练、BPE 分词" },
  { dir: "02-Gated-Attention", title: "Gated Attention", desc: "门控注意力研究报告与 nanoGPT 复现" },
  { dir: "03-课程-计算机组成原理", title: "计算机组成原理", desc: "知识图谱、各章手册、模拟卷与小白深度解析" },
  { dir: "04-课程-最优化算法", title: "最优化算法", desc: "线性规划期末题型与操作手册" },
  { dir: "99-杂项", title: "杂项", desc: "费曼教学法、想法到产品框架等" },
]

// ── 工具函数 ──────────────────────────────────────────
function rmContent() {
  if (fs.existsSync(DEST)) fs.rmSync(DEST, { recursive: true, force: true })
  fs.mkdirSync(DEST, { recursive: true })
}

function copyDir(srcDir, destDir) {
  let count = 0
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const src = path.join(srcDir, entry.name)
    const dest = path.join(destDir, entry.name)
    if (entry.isDirectory()) {
      count += copyDir(src, dest)
    } else if (INCLUDE_EXT.has(path.extname(entry.name).toLowerCase())) {
      fs.mkdirSync(path.dirname(dest), { recursive: true })
      fs.copyFileSync(src, dest)
      count++
    }
  }
  return count
}

function writeIndex() {
  const lines = [
    "---",
    "title: zero2hero 学习笔记",
    "---",
    "",
    "> 用**费曼学习法**从零讲透 AI 与计算机核心概念 —— 12 岁也能看懂。",
    "",
    "## 内容导航",
    "",
  ]
  for (const s of SECTIONS) {
    lines.push(`### [[${s.dir}/|${s.title}]]`)
    lines.push("")
    lines.push(s.desc)
    lines.push("")
  }
  lines.push("---")
  lines.push("")
  lines.push("源仓库：<https://github.com/king157419/zero2hero>")
  lines.push("")
  fs.writeFileSync(path.join(DEST, "index.md"), lines.join("\n"))
}

// ── 执行 ──────────────────────────────────────────────
rmContent()
let total = 0
for (const dir of INCLUDE_DIRS) {
  const src = path.join(SOURCE, dir)
  if (!fs.existsSync(src)) {
    console.warn(`⚠ 跳过不存在的目录: ${dir}`)
    continue
  }
  const n = copyDir(src, path.join(DEST, dir))
  console.log(`  ${dir}: ${n} 个文件`)
  total += n
}
writeIndex()
console.log(`✓ 同步完成，共 ${total} 个文件 + 首页 index.md`)
