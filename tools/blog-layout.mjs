import fs from "node:fs/promises";
import path from "node:path";

const sections = new Map([
  ["posts", "Blog"],
  ["archives", "Archives"],
  ["search", "Search"],
  ["categories", "Categories"],
  ["tags", "Tags"],
]);

const skipLink = '<a class="blog-skip" href="#blog-main">跳到主要内容</a>';
const fontLink = '<link rel="stylesheet" href="/assets/landing/fonts/jetbrains-mono.css">';
const styleLink = '<link rel="stylesheet" href="/assets/css/blog-readme.css">';
const bodyPattern = /<body\b([^>]*)>/i;
const headerPattern = /(?:<a class="blog-skip"[^>]*>[\s\S]*?<\/a>\s*)?<header class="(?:header|readme-site-header)">[\s\S]*?<\/header>/;
const mainPattern = /<main class="main"(?: id="blog-main")?>\s*(?:(?:<p class="blog-path"[^>]*>[\s\S]*?<\/p>|<div class="blog-chrome">[\s\S]*?<\/div>)\s*)?/;
const repeatedAuthor = /(<(footer|div) class="(?:entry-footer|archive-meta)"><span[^>]*>[^<]*<\/span>&nbsp;·&nbsp;<span>[^<]*<\/span>)&nbsp;·&nbsp;<span>[^<]*<\/span>(<\/\2>)/g;

function blogHeader() {
  return `${skipLink}
  <header class="readme-site-header">
    <nav class="readme-nav" aria-label="Site navigation">
      <a class="home-link" href="/">← Home</a>
      <a href="/posts/">Blog</a>
      <a href="/assets/homepage/Zhang-Huarui-CV.pdf?v=20261123">Résumé <span aria-hidden="true">↗</span></a>
    </nav>
  </header>`;
}

function blogTools(current) {
  const menu = [
    ["archives", "归档"],
    ["search", "搜索"],
    ["about", "关于"],
  ];

  return `<nav class="blog-tools" aria-label="博客工具">
      <ul id="menu">${menu.map(([section, label]) => {
        const active = current === section ? ' aria-current="page"' : "";
        const accesskey = section === "search" ? ' accesskey="/"' : "";
        return `<li><a href="/${section}/"${active}${accesskey}>${label}</a></li>`;
      }).join("")}</ul>
      <button type="button" id="theme-toggle" accesskey="t" title="切换明暗主题 (Alt + T)" aria-label="切换明暗主题">
        <svg id="moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>
        <svg id="sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4m0-14.2-1.4 1.4M6.3 17.7l-1.4 1.4"/></svg>
      </button>
    </nav>`;
}

export function applyBlogLayout(html, relativePath) {
  const [section, subpage] = relativePath.split(path.sep);
  if (!sections.has(section) || path.basename(relativePath) !== "index.html") {
    throw new Error(`不支持的博客路径：${relativePath}`);
  }
  if (!bodyPattern.test(html) || !headerPattern.test(html) || !mainPattern.test(html) || !html.includes("</head>")) {
    throw new Error(`无法识别页面外壳，未更新：${relativePath}`);
  }

  const article = section === "posts" && subpage !== "index.html" && subpage !== "page";
  const listing = section === "posts" && !article;
  const label = sections.get(section);
  const page = article ? '<a href="/posts/">Blog</a> / Article' : label;
  const pathLine = listing ? "" : `<p class="blog-path" translate="no">FadingWind <span aria-hidden="true">/</span> ${page}</p>`;
  const layoutClasses = listing ? ["blog-readme", "blog-index"] : ["blog-readme"];
  const links = [fontLink, styleLink].filter((link) => !html.includes(link));

  const updated = html
    .replace("</head>", `${links.map((link) => `  ${link}\n`).join("")}</head>`)
    .replace(bodyPattern, (_, attributes) => {
      if (!/\bclass="/.test(attributes)) return `<body class="${layoutClasses.join(" ")}"${attributes}>`;
      return `<body${attributes.replace(/\bclass="([^"]*)"/, (_, classes) => {
        const names = classes.split(/\s+/).filter(Boolean);
        return `class="${[...new Set([...names, ...layoutClasses])].join(" ")}"`;
      })}>`;
    })
    .replace(headerPattern, blogHeader())
    .replace(mainPattern, `<main class="main" id="blog-main">
    <div class="blog-chrome">${pathLine}${blogTools(section)}</div>
    `);

  if (section === "archives") return updated.replace(repeatedAuthor, "$1$3");
  if (!listing) return updated;

  return updated
    .replace("<h1>博客</h1>", "<h1>Blogs</h1>")
    .replace(/(<a class="entry-link" aria-label="阅读 ([^"]+)")(?= href=)/g, '$1 title="$2"')
    .replace(repeatedAuthor, "$1$3");
}

async function blogPages(siteRoot, relativeDirectory) {
  const entries = await fs.readdir(path.join(siteRoot, relativeDirectory), { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const relative = path.join(relativeDirectory, entry.name);
    if (entry.isDirectory()) return blogPages(siteRoot, relative);
    return entry.isFile() && entry.name === "index.html" ? [relative] : [];
  }));
  return nested.flat();
}

export async function refreshBlogLayout(siteRoot) {
  const pages = (await Promise.all([...sections.keys()].map((section) => blogPages(siteRoot, section)))).flat();
  const updates = await Promise.all(pages.map(async (relative) => {
    const filename = path.join(siteRoot, relative);
    const original = await fs.readFile(filename, "utf8");
    const updated = applyBlogLayout(original, relative);
    return { filename, updated, changed: original !== updated };
  }));

  const changed = updates.filter((item) => item.changed);
  await Promise.all(changed.map(({ filename, updated }) => fs.writeFile(filename, updated, "utf8")));
  return { pages: pages.length, changed: changed.length };
}
