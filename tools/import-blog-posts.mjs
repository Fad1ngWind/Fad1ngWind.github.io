import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { marked } = require("marked");
const katex = require("katex");

const WORKSPACE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_SITE_ROOT =
  path.basename(WORKSPACE_ROOT) === "Fad1ngWind.github.io"
    ? WORKSPACE_ROOT
    : path.join(WORKSPACE_ROOT, "work", "Fad1ngWind.github.io");
const SITE_ROOT = path.resolve(
  process.env.BLOG_SITE_ROOT || DEFAULT_SITE_ROOT,
);
const SOURCE_ROOT = path.resolve(
  process.env.BLOG_SOURCE_ROOT || path.join(os.homedir(), "_posts"),
);
const RESEARCH_ROOT = path.resolve(
  process.env.BLOG_RESEARCH_ROOT ||
    path.join(os.homedir(), "基于PINN和历元间连续性约束的GNSSINS融合定位方法"),
);
const EMBODIED_AI_ROOT = path.resolve(
  process.env.BLOG_EMBODIED_AI_ROOT ||
    path.join(
      os.homedir(),
      "Documents",
      "Codex",
      "2026-08-06",
      "referenced-chatgpt-conversation-this-is-an-2",
      "outputs",
      "vla-vlm-embodied-ai-blog",
    ),
);
const KATEX_DIST_ROOT = path.dirname(require.resolve("katex"));
const SITE_URL = "https://zhr0529.cn";
const AUTHOR = "ZHR";

function sourcePath(...segments) {
  return path.join(SOURCE_ROOT, ...segments);
}

function researchSourcePath(...segments) {
  return path.join(RESEARCH_ROOT, ...segments);
}

function embodiedAiSourcePath(...segments) {
  return path.join(EMBODIED_AI_ROOT, ...segments);
}

const legacyImports = [
  {
    source: sourcePath("（杂）旅游攻略合集.md"),
    slug: "旅游攻略合集",
    title: "（杂）旅游攻略合集",
    category: "日记",
    tags: [],
    summary: "旅行路线备忘与分享",
  },
  {
    source: sourcePath("【理论】《ARM cortex-M3权威指南》学习笔记.md"),
    slug: "arm-cortex-m3学习笔记",
    title: "【理论】《ARM Cortex-M3 权威指南》学习笔记",
    category: "理论",
    tags: ["cortex-M3"],
    summary: "《ARM Cortex-M3 权威指南》阅读笔记。",
  },
  {
    source: sourcePath("【理论】51单片机学习笔记（AI8051U，32bit）.md"),
    slug: "51单片机学习笔记",
    title: "【理论】51单片机学习笔记（AI8051U，32bit）",
    category: "理论",
    tags: ["STM51"],
    summary: "AI8051U 32bit 单片机学习笔记。",
  },
  {
    source: sourcePath("【理论】Linux学习笔记.md"),
    slug: "linux学习笔记-2025",
    title: "【理论】Linux学习笔记",
    category: "理论",
    tags: ["Linux"],
    summary: "Linux 命令、权限、网络与进程管理。",
  },
  {
    source: sourcePath("【前端】个人博客开发日记 - 基于hexo+butterfly.md"),
    slug: "个人博客开发日记",
    title: "【前端】个人博客开发日记 - 基于 Hexo + Butterfly",
    category: "实操",
    tags: ["Hexo"],
    summary: "第一版个人博客的搭建过程，基于 Hexo + Butterfly。",
  },
  {
    source: sourcePath("【日记】.md"),
    slug: "日记-第一篇",
    title: "【日记】",
    category: "日记",
    tags: ["生活"],
    summary: "这是一篇日记",
  },
];

const currentImports = [
  {
    source: embodiedAiSourcePath(
      "从 VLM 到 VLA：具身智能系统中的模型、环境与控制层.md",
    ),
    slug: "从-vlm-到-vla-具身智能系统中的模型-环境与控制层",
    title: "从 VLM 到 VLA：具身智能系统中的模型、环境与控制层",
    date: "2026-08-06 11:21:18",
    category: "理论",
    tags: ["具身智能", "VLM", "VLA", "机器人"],
    summary:
      "梳理 LLM、VLM、VLA、世界模型与具身智能的边界，以及仿真、训练、规划和控制在机器人闭环中的位置。",
    copyLocalImages: true,
    stripTitleHeading: true,
  },
  {
    source: researchSourcePath(
      "基于PINN和历元间连续性约束的GNSSINS融合定位研究手记.md",
    ),
    slug: "基于pinn和历元间连续性约束的-gnss-ins-融合定位研究手记",
    title: "基于 PINN 和历元间连续性约束的 GNSS/INS 融合定位研究手记",
    date: "2026-08-04 20:39:20",
    category: "理论",
    tags: ["GNSS", "INS", "PINN"],
    summary:
      "记录一次从 GNSS 加权最小二乘误差补偿出发，经数据对齐、约束调整和消融验证完成 PINN-GNSS/INS 融合定位方案的过程。",
    copyLocalImages: true,
    stripTitleHeading: true,
  },
  {
    source: sourcePath("posts", "电机控制", "电机控制.md"),
    slug: "电机控制",
    title: "电机控制",
    date: "2025-08-01 00:00:00",
    category: "实操",
    tags: ["电机控制"],
    summary: "直流有刷电机、电机驱动与控制学习笔记。",
    copyLocalImages: true,
  },
  {
    source: sourcePath(
      "posts",
      "硬件基本功：电路设计及制造",
      "硬件基本功：电路设计及制造.md",
    ),
    slug: "硬件基本功-电路设计及制造",
    title: "硬件基本功：电路设计及制造",
    date: "2025-07-01 00:00:00",
    category: "理论",
    tags: ["电路"],
    summary: "电路基础、供电保护、PCB 设计与制造学习笔记。",
    copyLocalImages: true,
  },
  {
    source: sourcePath("posts", "机器视觉", "机器视觉.md"),
    slug: "机器视觉",
    title: "机器视觉",
    date: "2025-07-31 00:00:00",
    category: "实操",
    tags: ["机器视觉"],
    summary: "MicroPython 机器视觉与常用图像处理学习笔记。",
    copyLocalImages: true,
  },
  {
    source: sourcePath(
      "posts",
      "C1 - 有监督的机器学习：回归和分类",
      "C1 - 有监督的机器学习：回归和分类.md",
    ),
    slug: "c1-有监督的机器学习-回归和分类",
    title: "C1 - 有监督的机器学习：回归和分类",
    date: "2026-03-30 00:00:00",
    category: "理论",
    tags: ["机器学习"],
    summary: "有监督学习、回归、分类与梯度下降学习笔记。",
    copyLocalImages: true,
  },
  {
    source: sourcePath(
      "posts",
      "载波相位引入在 pyRTKLIB 中的实现研究",
      "载波相位引入在 pyRTKLIB 中的实现研究.md",
    ),
    slug: "载波相位引入在-pyrtklib-中的实现研究",
    title: "载波相位引入在 pyRTKLIB 中的实现研究",
    date: "2025-10-22 00:00:00",
    category: "理论",
    tags: ["GNSS", "pyRTKLIB"],
    summary: "GNSS 载波相位观测在 pyRTKLIB 中的引入与实现记录。",
    copyLocalImages: true,
  },
  {
    source: sourcePath(
      "posts",
      "SPI、UART、RS232、RS485、IIC 通信总线协议",
      "SPI、UART、RS232、RS485、IIC 通信总线协议.md",
    ),
    slug: "通信总线协议",
    title: "SPI、UART、RS232、RS485、IIC 通信总线协议",
    date: "2025-03-29 00:00:00",
    category: "理论",
    tags: ["通信协议"],
    summary: "串行通信基础与常用通信总线协议学习笔记。",
    copyLocalImages: true,
  },
  {
    source: sourcePath(
      "posts",
      "STM32第二部分学习（待命中）",
      "STM32第二部分学习（待命中）.md",
    ),
    slug: "stm32第二部分学习",
    title: "STM32第二部分学习（待命中）",
    date: "2025-07-11 00:00:00",
    category: "实操",
    tags: ["STM32"],
    summary: "STM32 寄存器、串口、总线与常用外设学习笔记。",
    copyLocalImages: true,
  },
  {
    source: sourcePath("posts", "STM32第一部分学习", "STM32第一部分学习.md"),
    slug: "stm32第一部分学习",
    title: "STM32第一部分学习",
    date: "2025-03-30 00:00:00",
    category: "",
    tags: ["STM32"],
    summary: "STM32 外设学习笔记：GPIO、定时器、串口、ADC 与 DMA。",
    copyLocalImages: true,
  },
];

const currentTitles = new Set(currentImports.map((post) => post.title));
const imports = [
  ...legacyImports.filter((post) => !currentTitles.has(post.title)),
  ...currentImports,
];
const postSlugsByTitle = new Map(imports.map((post) => [post.title, post.slug]));

const existingPosts = [
  {
    slug: "随想",
    title: "随想",
    date: "2024-11-29 23:01:15",
    category: "日记",
    tags: [],
    summary: "往事总在回忆中被赋予寓意。",
    readingTime: 1,
    searchContent:
      "迎着阳光盛大逃亡。最后留在记忆深处的总是那些虚无缥缈的东西，往事总在回忆中被赋予寓意。",
  },
  {
    slug: "理论linux学习笔记",
    title: "【理论】Linux学习笔记",
    date: "2024-07-08 14:34:24",
    category: "理论",
    tags: ["Linux"],
    summary: "Linux 基础命令、目录结构、文件操作与权限管理。",
    readingTime: 3,
    searchContent: "Linux 基础命令、目录结构、文件操作、用户权限与常用指令学习笔记。",
  },
];

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeXml(value = "") {
  return escapeHtml(value);
}

function stripTags(value = "") {
  return String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_>#~|=-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseFrontMatter(source) {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!match) return { data: {}, body: source };

  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    value = value.replace(/^['"]|['"]$/g, "");
    data[key] = value;
  }
  return { data, body: source.slice(match[0].length) };
}

function encodePublicPath(relativePath) {
  return `/${relativePath
    .split(path.sep)
    .map((segment) => encodeURIComponent(segment))
    .join("/")}`;
}

async function copyLocalImages(markdown, config) {
  if (!config.copyLocalImages) return markdown;

  const sourceDir = path.dirname(config.source);
  const imagePattern = /!\[([^\]]*)\]\((?:<([^>]+)>|([^)]+))\)/g;
  const replacements = [];
  const copied = new Set();

  for (const match of markdown.matchAll(imagePattern)) {
    const target = (match[2] || match[3]).trim();
    if (/^(?:https?:|data:|\/|#)/i.test(target)) continue;

    const sourcePath = path.resolve(sourceDir, target);
    if (!sourcePath.startsWith(`${sourceDir}${path.sep}`)) {
      throw new Error(`图片路径超出文章目录：${config.title} -> ${target}`);
    }

    try {
      await fs.access(sourcePath);
    } catch {
      throw new Error(`找不到文章图片：${config.title} -> ${target}`);
    }

    const assetPath = path.relative(sourceDir, sourcePath);
    const destination = path.join("assets", "blog", config.slug, assetPath);
    if (!copied.has(destination)) {
      await fs.mkdir(path.dirname(path.join(SITE_ROOT, destination)), { recursive: true });
      await fs.copyFile(sourcePath, path.join(SITE_ROOT, destination));
      copied.add(destination);
    }

    replacements.push({
      start: match.index,
      end: match.index + match[0].length,
      value: `![${match[1]}](${encodePublicPath(destination)})`,
    });
  }

  let output = markdown;
  for (const replacement of replacements.reverse()) {
    output =
      output.slice(0, replacement.start) +
      replacement.value +
      output.slice(replacement.end);
  }
  return output;
}

function renderFormula(formula, displayMode) {
  try {
    return katex.renderToString(formula.trim(), {
      displayMode,
      output: "html",
      strict: "ignore",
      throwOnError: true,
      trust: false,
    });
  } catch (error) {
    console.warn(`公式渲染失败：${formula.trim()}\n${error.message}`);
    return `<code class="math-error">${escapeHtml(formula.trim())}</code>`;
  }
}

function renderMath(markdown) {
  return markdown
    .split(/(```[\s\S]*?```|~~~[\s\S]*?~~~)/g)
    .map((section, sectionIndex) => {
      if (sectionIndex % 2 === 1) return section;

      const withBlocks = section
        .replace(
          /\\\[([\s\S]*?)\\\]/g,
          (_, formula) =>
            `\n\n<div class="math-block">${renderFormula(formula, true)}</div>\n\n`,
        )
        .replace(
          /\$\$([\s\S]*?)\$\$/g,
          (_, formula) =>
            `\n\n<div class="math-block">${renderFormula(formula, true)}</div>\n\n`,
        );

      return withBlocks
        .split(/\r?\n/)
        .map((line) =>
          line
            .split(/(`[^`\n]*`)/g)
            .map((part, partIndex) => {
              if (partIndex % 2 === 1) return part;
              return part
                .replace(
                  /\\\((.+?)\\\)/g,
                  (_, formula) => renderFormula(formula, false),
                )
                .replace(
                  /(^|[^\\])\$([^$\n]+?)(?<!\\)\$/g,
                  (_, prefix, formula) => `${prefix}${renderFormula(formula, false)}`,
                );
            })
            .join(""),
        )
        .join("\n");
    })
    .join("");
}

function renderCallouts(markdown) {
  const lines = markdown.split(/\r?\n/);
  const output = [];

  for (let index = 0; index < lines.length; index += 1) {
    const callout = lines[index].match(/^>\s*\[!([^\]]+)\]\s*$/);
    if (!callout) {
      output.push(lines[index]);
      continue;
    }

    output.push(
      `> <strong class="article-callout-title">${escapeHtml(callout[1].trim())}</strong>`,
    );
    output.push(">");

    while (index + 1 < lines.length && /^>/.test(lines[index + 1])) {
      index += 1;
      const content = lines[index].replace(/^>\s?/, "").trim();
      if (content) output.push(`> - ${content.replace(/^[-*]\s+/, "")}`);
    }
  }

  return output.join("\n");
}

function headingId(text) {
  return (
    text
      .toLowerCase()
      .replace(/&[a-z]+;/g, "")
      .replace(/[^\p{Letter}\p{Number}\u4e00-\u9fff]+/gu, "-")
      .replace(/^-|-$/g, "") || "section"
  );
}

function renderWikiLinks(markdown) {
  return markdown
    .split(/(```[\s\S]*?```|~~~[\s\S]*?~~~)/g)
    .map((section, sectionIndex) => {
      if (sectionIndex % 2 === 1) return section;
      return section
        .split(/(`[^`\n]*`)/g)
        .map((part, partIndex) => {
          if (partIndex % 2 === 1) return part;
          return part.replace(
            /\[\[([^#|\]]+)(?:#([^|\]]+))?(?:\|([^\]]+))?\]\]/g,
            (original, title, sectionTitle, alias) => {
              const slug = postSlugsByTitle.get(title.trim());
              if (!slug) return original;
              const hash = sectionTitle ? `#${encodeURIComponent(headingId(sectionTitle.trim()))}` : "";
              const label = (alias || sectionTitle || title).trim();
              return `[${label}](/posts/${encodeURIComponent(slug)}/${hash})`;
            },
          );
        })
        .join("");
    })
    .join("");
}

function preprocessMarkdown(markdown) {
  let output = markdown
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(
      /\{%\s*link\s+([^,]+),\s*(https?:\/\/[^,\s]+)[^%]*%\}/g,
      (_, label, url) => `[${label.trim()}](${url.trim().replace(/[）)]$/, "")})`,
    )
    .replace(/\{%\s*timeline\s+([^,%]+)(?:,[^%]+)?%\}/g, (_, title) => {
      return `<section class="legacy-timeline">\n<h2>${escapeHtml(title.trim())}</h2>`;
    })
    .replace(
      /<!--\s*timeline\s+([^\[]+?)(?:\s*\[([^\]]+)\])?\s*-->/g,
      (_, date, phase) =>
        `<div class="timeline-item"><div class="timeline-date">${escapeHtml(date.trim())}${
          phase ? `<span>${escapeHtml(phase.trim())}</span>` : ""
        }</div><div class="timeline-body">`,
    )
    .replace(/<!--\s*endtimeline\s*-->/g, "</div></div>")
    .replace(/\{%\s*endtimeline\s*%\}/g, "</section>");

  let inFence = false;
  output = output
    .split(/\r?\n/)
    .map((line) => {
      if (/^\s*```/.test(line)) {
        inFence = !inFence;
        return line;
      }
      return inFence ? line : line.replace(/==(.+?)==/g, "<mark>$1</mark>");
    })
    .join("\n");

  return renderMath(renderWikiLinks(renderCallouts(output)));
}

function addHeadingAnchors(html) {
  const used = new Map();
  const headings = [];
  const output = html.replace(/<h([1-4])>([\s\S]*?)<\/h\1>/g, (_, level, inner) => {
    const text = stripTags(inner);
    const base = headingId(text);
    const count = used.get(base) || 0;
    used.set(base, count + 1);
    const id = count ? `${base}-${count + 1}` : base;
    headings.push({ level: Number(level), text, id });
    return `<h${level} id="${escapeHtml(id)}">${inner}<a hidden class="anchor" aria-hidden="true" href="#${escapeHtml(id)}">#</a></h${level}>`;
  });
  return { html: output, headings };
}

function formatDate(dateString) {
  const date = new Date(dateString.replace(" ", "T") + "+08:00");
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Shanghai",
  }).format(date);
}

function numericDate(dateString) {
  const [date] = dateString.split(" ");
  return date.replaceAll("-", ".");
}

function readingTime(text) {
  const chinese = (text.match(/[\u3400-\u9fff]/g) || []).length;
  const latinWords = (text.match(/[A-Za-z0-9_]+/g) || []).length;
  return Math.max(1, Math.ceil(chinese / 400 + latinWords / 220));
}

function postUrl(post) {
  return `/posts/${post.slug}/`;
}

function canonicalUrl(relativePath) {
  return `${SITE_URL}${relativePath}`;
}

function tocMarkup(headings) {
  if (!headings.length) return "";
  const items = headings
    .map(
      ({ level, text, id }) =>
        `<li class="toc-level-${level}"><a href="#${escapeHtml(id)}" aria-label="${escapeHtml(text)}">${escapeHtml(text)}</a></li>`,
    )
    .join("");
  return `<div class="toc">
    <details>
      <summary accesskey="c" title="(Alt + C)"><span class="details">目录</span></summary>
      <div class="inner"><ul>${items}</ul></div>
    </details>
  </div>`;
}

function siteHeader(active = "") {
  return `<header class="header">
    <nav class="nav">
      <div class="logo">
        <a href="/" accesskey="h" title="遂心快意 (Alt + H)">遂心快意</a>
        <div class="logo-switches">
          <button id="theme-toggle" accesskey="t" title="切换明暗主题 (Alt + T)" aria-label="切换明暗主题">
            <svg id="moon" xmlns="http://www.w3.org/2000/svg" width="24" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            <svg id="sun" xmlns="http://www.w3.org/2000/svg" width="24" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
          </button>
        </div>
      </div>
      <ul id="menu">
        <li><a href="/archives/" title="归档"><span${active === "archives" ? ' class="active"' : ""}>归档</span></a></li>
        <li><a href="/search/" title="搜索 (Alt + /)" accesskey="/"><span${active === "search" ? ' class="active"' : ""}>搜索</span></a></li>
      </ul>
    </nav>
  </header>`;
}

function sharedScripts() {
  return `<a href="#top" aria-label="返回顶部" title="返回顶部 (Alt + G)" class="top-link" id="top-link" accesskey="g">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 6" fill="currentColor"><path d="M12 6H0l6-6z"></path></svg>
  </a>
  <script>
    const menu = document.getElementById("menu");
    const savedMenuPosition = localStorage.getItem("menu-scroll-position");
    if (menu && savedMenuPosition) menu.scrollLeft = Number.parseInt(savedMenuPosition, 10);
    if (menu) menu.addEventListener("scroll", () => localStorage.setItem("menu-scroll-position", menu.scrollLeft));
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (event) => {
        const id = anchor.getAttribute("href").slice(1);
        const target = id === "top" ? document.documentElement : document.getElementById(decodeURIComponent(id));
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
        history.replaceState(null, "", id === "top" ? location.pathname : "#" + id);
      });
    });
    const topLink = document.getElementById("top-link");
    addEventListener("scroll", () => {
      const visible = document.documentElement.scrollTop > 800;
      topLink.style.visibility = visible ? "visible" : "hidden";
      topLink.style.opacity = visible ? "1" : "0";
    }, { passive: true });
    document.getElementById("theme-toggle").addEventListener("click", () => {
      const html = document.documentElement;
      const next = html.dataset.theme === "dark" ? "light" : "dark";
      html.dataset.theme = next;
      localStorage.setItem("pref-theme", next);
    });
  </script>`;
}

function pageLayout({
  title,
  browserTitle = "",
  description,
  relativePath,
  main,
  bodyClass = "",
  active = "",
  extraHead = "",
  articleData = null,
}) {
  const fullTitle = browserTitle || (title === "Zhanghr" ? title : `${title} | Zhanghr`);
  const articleMeta = articleData
    ? `<meta property="og:type" content="article">
  <meta property="article:published_time" content="${escapeHtml(articleData.isoDate)}">
  <meta property="article:modified_time" content="${escapeHtml(articleData.isoDate)}">`
    : `<meta property="og:type" content="website">`;
  const jsonLd = articleData
    ? `<script type="application/ld+json">${JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: title,
        datePublished: articleData.isoDate,
        dateModified: articleData.isoDate,
        author: { "@type": "Person", name: AUTHOR },
        mainEntityOfPage: canonicalUrl(relativePath),
      })}</script>`
    : "";
  const articleMetaBlock = articleMeta ? `  ${articleMeta}\n` : "";
  const extraHeadBlock = extraHead ? `  ${extraHead}\n` : "";
  const jsonLdBlock = jsonLd ? `  ${jsonLd}\n` : "";

  return `<!doctype html>
<html lang="zh-CN" dir="auto" data-theme="auto">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <meta name="robots" content="index, follow">
  <title>${escapeHtml(fullTitle)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="author" content="${AUTHOR}">
  <link rel="canonical" href="${escapeHtml(canonicalUrl(relativePath))}">
  <link crossorigin="anonymous" href="/assets/css/stylesheet.css" rel="preload stylesheet" as="style">
  <link rel="icon" href="/assets/homepage/favicon.svg?v=original-flower-2026" type="image/svg+xml">
  <meta name="theme-color" content="#2e2e33">
  <meta property="og:url" content="${escapeHtml(canonicalUrl(relativePath))}">
  <meta property="og:site_name" content="Zhanghr">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:locale" content="zh_CN">
${articleMetaBlock}\
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
${extraHeadBlock}\
  <script>
    const savedTheme = localStorage.getItem("pref-theme");
    document.documentElement.dataset.theme = savedTheme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  </script>
${jsonLdBlock}\
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ""} id="top">
  ${siteHeader(active)}
  <main class="main">${main}</main>
  <footer class="footer"><span>&copy; 2026 <a href="/">Zhanghr</a></span> · <span>Powered by <a href="https://gohugo.io/" rel="noopener noreferrer" target="_blank">Hugo</a> &amp; <a href="https://github.com/adityatelange/hugo-PaperMod/" rel="noopener noreferrer" target="_blank">PaperMod</a></span></footer>
  ${sharedScripts()}
</body>
</html>
`;
}

function postMeta(post) {
  return `<span title="${escapeHtml(post.date)} +0800 CST">${formatDate(post.date)}</span>&nbsp;·&nbsp;<span>${post.readingTime} min</span>&nbsp;·&nbsp;<span>${AUTHOR}</span>`;
}

function listEntry(post) {
  return `<article class="post-entry">
    <header class="entry-header"><h2 class="entry-hint-parent">${escapeHtml(post.title)}</h2></header>
    <div class="entry-content"><p>${escapeHtml(post.summary)}</p></div>
    <footer class="entry-footer">${postMeta(post)}</footer>
    <a class="entry-link" aria-label="阅读 ${escapeHtml(post.title)}" href="${escapeHtml(postUrl(post))}"></a>
  </article>`;
}

function articlePage(post, previous, next) {
  const tags = post.tags.length
    ? `<ul class="post-tags">${post.tags
        .map(
          (tag) =>
            `<li><a href="/tags/${encodeURIComponent(tag.toLowerCase())}/">${escapeHtml(tag)}</a></li>`,
        )
        .join("")}</ul>`
    : `<ul class="post-tags"></ul>`;
  const navigation = [
    previous
      ? `<a class="prev" href="${escapeHtml(postUrl(previous))}"><span class="title">« 上一篇</span><br><span>${escapeHtml(previous.title)}</span></a>`
      : "",
    next
      ? `<a class="next" href="${escapeHtml(postUrl(next))}"><span class="title">下一篇 »</span><br><span>${escapeHtml(next.title)}</span></a>`
      : "",
  ].join("");
  const isoDate = post.date.replace(" ", "T") + "+08:00";
  const main = `<article class="post-single">
    <header class="post-header">
      <div class="breadcrumbs"><a href="/">首页</a>&nbsp;»&nbsp;<a href="/posts/">博客</a></div>
      <h1 class="post-title entry-hint-parent">${escapeHtml(post.title)}</h1>
      <div class="post-meta">${postMeta(post)}</div>
    </header>
    ${tocMarkup(post.headings)}
    <div class="post-content">${post.html}</div>
    <footer class="post-footer">${tags}<nav class="paginav">${navigation}</nav></footer>
  </article>`;

  return pageLayout({
    title: post.title,
    description: post.summary,
    relativePath: postUrl(post),
    main,
    extraHead:
      '<link rel="stylesheet" href="/assets/vendor/katex/katex.min.css">\n  <link rel="stylesheet" href="/assets/homepage/blog-import.css">',
    articleData: { isoDate },
  });
}

function listPage(posts) {
  const main = `<header class="page-header">
    <div class="breadcrumbs"><a href="/">首页</a></div>
    <h1>博客</h1>
    <p>记录技术学习、竞赛之外的探索与生活。</p>
  </header>
  ${posts.map(listEntry).join("\n")}`;
  return pageLayout({
    title: "博客",
    browserTitle: "博客｜ZHR",
    description: "记录技术学习、竞赛之外的探索与生活。",
    relativePath: "/posts/",
    main,
    bodyClass: "list",
  });
}

function archivePage(posts) {
  const byYear = Map.groupBy(posts, (post) => post.date.slice(0, 4));
  const years = [...byYear.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([year, yearPosts]) => {
      const byMonth = Map.groupBy(yearPosts, (post) => post.date.slice(5, 7));
      const months = [...byMonth.entries()]
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([month, monthPosts]) => {
          const monthName = new Intl.DateTimeFormat("en-US", {
            month: "long",
            timeZone: "Asia/Shanghai",
          }).format(new Date(`${year}-${month}-01T00:00:00+08:00`));
          return `<div class="archive-month">
            <h3 class="archive-month-header" id="${year}-${monthName}"><a class="archive-header-link" href="#${year}-${monthName}">${monthName}</a><sup class="archive-count">&nbsp;${monthPosts.length}</sup></h3>
            <div class="archive-posts">${monthPosts
              .map(
                (post) => `<div class="archive-entry">
                  <h3 class="archive-entry-title entry-hint-parent">${escapeHtml(post.title)}</h3>
                  <div class="archive-meta">${postMeta(post)}</div>
                  <a class="entry-link" aria-label="阅读 ${escapeHtml(post.title)}" href="${escapeHtml(postUrl(post))}"></a>
                </div>`,
              )
              .join("")}</div>
          </div>`;
        })
        .join("");
      return `<div class="archive-year">
        <h2 class="archive-year-header" id="${year}"><a class="archive-header-link" href="#${year}">${year}</a><sup class="archive-count">&nbsp;${yearPosts.length}</sup></h2>
        ${months}
      </div>`;
    })
    .join("");

  return pageLayout({
    title: "归档",
    browserTitle: "归档",
    description: "Zhanghr 的博客归档。",
    relativePath: "/archives/",
    main: `<header class="page-header"><h1>归档</h1></header>${years}`,
    bodyClass: "list",
    active: "archives",
  });
}

function termIndexPage(title, terms, basePath) {
  const entries = terms
    .map(
      ({ name, count }) => `<li><a href="/${basePath}/${encodeURIComponent(name.toLowerCase())}/">${escapeHtml(name)} <sup><strong><sup>${count}</sup></strong></sup></a></li>`,
    )
    .join("");
  return pageLayout({
    title,
    description: `${title}索引`,
    relativePath: `/${basePath}/`,
    main: `<header class="page-header"><div class="breadcrumbs"><a href="/">首页</a></div><h1>${title}</h1></header><ul class="terms-tags">${entries}</ul>`,
    bodyClass: "list",
  });
}

function termPage(name, posts, basePath) {
  return pageLayout({
    title: name,
    description: `${name}下的文章`,
    relativePath: `/${basePath}/${encodeURIComponent(name.toLowerCase())}/`,
    main: `<header class="page-header"><div class="breadcrumbs"><a href="/">首页</a>&nbsp;»&nbsp;<a href="/${basePath}/">${basePath === "tags" ? "标签" : "分类"}</a></div><h1>${escapeHtml(name)}</h1></header>${posts.map(listEntry).join("\n")}`,
    bodyClass: "list",
  });
}

function rss(posts, title, relativePath = "/") {
  const items = posts
    .map(
      (post) => `<item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(canonicalUrl(postUrl(post)))}</link>
      <pubDate>${new Date(post.date.replace(" ", "T") + "+08:00").toUTCString()}</pubDate>
      <guid>${escapeXml(canonicalUrl(postUrl(post)))}</guid>
      <description>${escapeXml(post.summary)}</description>
    </item>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>${escapeXml(title)}</title>
  <link>${escapeXml(canonicalUrl(relativePath))}</link>
  <description>Zhanghr 的个人博客</description>
  <language>zh-CN</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  ${items}
</channel></rss>
`;
}

async function write(relativePath, content) {
  const target = path.join(SITE_ROOT, relativePath);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, content, "utf8");
}

async function copyKatexAssets() {
  const destination = path.join(SITE_ROOT, "assets", "vendor", "katex");
  await fs.mkdir(destination, { recursive: true });
  await fs.copyFile(
    path.join(KATEX_DIST_ROOT, "katex.min.css"),
    path.join(destination, "katex.min.css"),
  );
  await fs.cp(path.join(KATEX_DIST_ROOT, "fonts"), path.join(destination, "fonts"), {
    recursive: true,
  });
}

async function auditRenderedPosts() {
  const postsRoot = path.join(SITE_ROOT, "posts");
  const entries = await fs.readdir(postsRoot, { withFileTypes: true });
  const issues = [];
  let postCount = 0;
  let imageCount = 0;

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === "page") continue;
    const pagePath = path.join(postsRoot, entry.name, "index.html");
    let html;
    try {
      html = await fs.readFile(pagePath, "utf8");
    } catch {
      continue;
    }

    postCount += 1;
    if (/(^|\n)>\s/.test(html)) issues.push(`${entry.name}：残留引用符号 >`);
    if (/\[![^\]]+\]/.test(html)) issues.push(`${entry.name}：残留提示块标记`);
    if (/class="math-error"/.test(html)) issues.push(`${entry.name}：存在公式渲染错误`);
    if (/\$\$[\s\S]*?\$\$/.test(html)) issues.push(`${entry.name}：残留块级公式标记`);
    if (/\\\[[\s\S]*?\\\]/.test(html)) issues.push(`${entry.name}：残留 \\[...\\] 公式标记`);
    if (/\\\([^\n]*?\\\)/.test(html)) issues.push(`${entry.name}：残留 \\(...\\) 公式标记`);

    for (const match of html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)) {
      const source = match[1];
      if (/^(?:https?:|data:)/i.test(source)) continue;
      imageCount += 1;
      const cleanSource = decodeURIComponent(source.split(/[?#]/)[0]);
      const relativePath = cleanSource.startsWith("/")
        ? cleanSource.slice(1)
        : path.posix.join("posts", entry.name, cleanSource);
      try {
        await fs.access(path.join(SITE_ROOT, relativePath));
      } catch {
        issues.push(`${entry.name}：缺少图片 ${source}`);
      }
    }
  }

  if (issues.length) {
    throw new Error(`文章渲染检查失败：\n- ${issues.join("\n- ")}`);
  }

  console.log(`渲染检查通过：${postCount} 篇文章，${imageCount} 张本地图片。`);
}

async function importPosts() {
  const generated = [];
  await copyKatexAssets();

  for (const config of imports) {
    const source = await fs.readFile(config.source, "utf8");
    const { data, body } = parseFrontMatter(source);
    const articleBody = config.stripTitleHeading
      ? body.replace(/^#\s+[^\n]+\r?\n+/, "")
      : body;
    const markdown = preprocessMarkdown(
      await copyLocalImages(articleBody, config),
    );
    let html = marked.parse(markdown, { gfm: true, breaks: false });
    html = html
      .replace(/<img\b/g, '<img loading="lazy" decoding="async"')
      .replace(
        /<blockquote>\s*<p><strong class="article-callout-title">/g,
        '<blockquote class="article-terms">\n<p><strong class="article-callout-title">',
      )
      .replace(/<a href="(https?:\/\/[^"]+)"/g, '<a href="$1" target="_blank" rel="noopener noreferrer"');
    const withAnchors = addHeadingAnchors(html);
    const plainText = stripTags(markdown);
    const summarySource = data.description || plainText;
    const summary = config.summary
      ? config.summary.trim()
      : stripTags(summarySource).slice(0, 155).replace(/[，。；、\s]+$/, "") +
        (summarySource.length > 155 ? "…" : "");

    generated.push({
      ...config,
      date: config.date || data.date,
      summary,
      readingTime: readingTime(plainText),
      searchContent: plainText,
      html: withAnchors.html,
      headings: withAnchors.headings,
    });
  }

  const allPosts = [...generated, ...existingPosts].sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  for (const post of generated) {
    const index = allPosts.findIndex((candidate) => candidate.slug === post.slug);
    await write(
      path.join("posts", post.slug, "index.html"),
      articlePage(post, allPosts[index - 1] || null, allPosts[index + 1] || null),
    );
  }

  const postsHtml = listPage(allPosts);
  await write("posts/index.html", postsHtml);
  await write("posts/page/1/index.html", postsHtml);
  await write("archives/index.html", archivePage(allPosts));

  const categories = Map.groupBy(
    allPosts.filter((post) => post.category),
    (post) => post.category,
  );
  const tags = Map.groupBy(
    allPosts.flatMap((post) => post.tags.map((tag) => ({ ...post, term: tag }))),
    (post) => post.term,
  );

  await write(
    "categories/index.html",
    termIndexPage(
      "分类",
      [...categories.entries()].map(([name, posts]) => ({ name, count: posts.length })),
      "categories",
    ),
  );
  for (const [name, posts] of categories) {
    await write(
      path.join("categories", name.toLowerCase(), "index.html"),
      termPage(name, posts, "categories"),
    );
  }

  await write(
    "tags/index.html",
    termIndexPage(
      "标签",
      [...tags.entries()].map(([name, posts]) => ({ name, count: posts.length })),
      "tags",
    ),
  );
  for (const [name, posts] of tags) {
    await write(
      path.join("tags", name.toLowerCase(), "index.html"),
      termPage(name, posts, "tags"),
    );
  }

  const searchIndex = allPosts.map((post) => ({
    permalink: canonicalUrl(postUrl(post)),
    title: post.title,
    content: post.searchContent,
    summary: post.summary,
  }));
  await write("index.json", JSON.stringify(searchIndex));
  await write("posts/index.xml", rss(allPosts, "Posts | Zhanghr", "/posts/"));
  await write("index.xml", rss(allPosts, "Zhanghr"));

  const sitemapPaths = [
    "/",
    "/posts/",
    "/archives/",
    "/search/",
    "/categories/",
    "/tags/",
    ...allPosts.map(postUrl),
    ...[...categories.keys()].map(
      (name) => `/categories/${encodeURIComponent(name.toLowerCase())}/`,
    ),
    ...[...tags.keys()].map((name) => `/tags/${encodeURIComponent(name.toLowerCase())}/`),
  ];
  await write(
    "sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapPaths
      .map((relativePath) => `  <url><loc>${escapeXml(canonicalUrl(relativePath))}</loc></url>`)
      .join("\n")}\n</urlset>\n`,
  );

  const homepagePath = path.join(SITE_ROOT, "index.html");
  const homepage = await fs.readFile(homepagePath, "utf8");
  const homepageEntries = allPosts
    .slice(0, 4)
    .map(
      (post) =>
        `          <a href="${postUrl(post).slice(1)}"><span>${numericDate(post.date)}</span><strong>${escapeHtml(post.title.replace(/^【理论】/, ""))}</strong><i>↗</i></a>`,
    )
    .join("\n");
  const homepageListPattern =
    /(<div class="writing-list">)[\s\S]*?(<\/div>\s*<\/section>)/;
  if (!homepageListPattern.test(homepage)) {
    throw new Error("未找到首页博客列表，已停止更新以避免误写。");
  }
  const updatedHomepage = homepage.replace(
    homepageListPattern,
    `$1\n${homepageEntries}\n          <a href="archives/"><span>Archive</span><strong class="i18n" data-zh="查看全部文章" data-en="View all posts">查看全部文章</strong><i>↗</i></a>\n        $2`,
  );
  await fs.writeFile(homepagePath, updatedHomepage, "utf8");

  await auditRenderedPosts();

  console.log(`已导入 ${generated.length} 篇文章，博客总数 ${allPosts.length} 篇。`);
  for (const post of generated) {
    console.log(`${post.date.slice(0, 10)}  ${post.title}  ${postUrl(post)}`);
  }
}

if (process.argv.includes("--check")) {
  await auditRenderedPosts();
} else {
  await importPosts();
}
