import test from "node:test";
import assert from "node:assert/strict";
import { applyBlogLayout } from "./blog-layout.mjs";

const metadata = '<link rel="canonical" href="https://www.zhr8997.cn/posts/example/">';
const content = '<article class="post-single"><h1>示例</h1><div class="post-content"><h2 id="math">公式</h2><span class="katex">x</span><img src="/assets/example.webp"></div></article>';
const oldPage = `<!doctype html>
<html data-theme="auto">
<head>${metadata}</head>
<body class="list" id="top">
  <header class="header"><nav id="menu">旧导航</nav></header>
  <main class="main">${content}</main>
  <script>document.getElementById("theme-toggle")</script>
</body>
</html>`;

test("restyles the shell without rewriting metadata, body content, or scripts", () => {
  const updated = applyBlogLayout(oldPage, "posts/example/index.html");
  assert.ok(updated.includes(metadata));
  assert.ok(updated.includes(content));
  assert.ok(updated.includes('<script>document.getElementById("theme-toggle")</script>'));
  assert.match(updated, /<body class="list blog-readme" id="top">/);
  assert.match(updated, /<a href="\/posts\/">Blog<\/a> \/ Article/);
  assert.match(updated, /id="theme-toggle"/);
  assert.match(updated, /href="\/about\/">关于/);
  assert.doesNotMatch(updated, /aria-current="page"/);
});

test("marks the current section and can be run again without changing the file", () => {
  const updated = applyBlogLayout(oldPage, "archives/index.html");
  assert.match(updated, /<a href="\/archives\/" aria-current="page">归档/);
  assert.equal(applyBlogLayout(updated, "archives/index.html"), updated);
});

test("uses the shared navigation and gives only the main listing compact cards", () => {
  const listing = oldPage.replace(content, '<header class="page-header"><h1>博客</h1><p>说明</p></header><article class="post-entry"><footer class="entry-footer"><span title="2026-11-23">November 23</span>&nbsp;·&nbsp;<span>5 min</span>&nbsp;·&nbsp;<span>ZHR</span></footer><a class="entry-link" aria-label="阅读 完整文章标题" href="/posts/example/"></a></article>');
  const updated = applyBlogLayout(listing, "posts/index.html");
  assert.match(updated, /class="list blog-readme blog-index"/);
  assert.match(updated, /<nav class="readme-nav" aria-label="Site navigation">/);
  assert.match(updated, /href="\/">← Home/);
  assert.match(updated, /<h1>Blogs<\/h1><p>说明<\/p>/);
  assert.match(updated, /title="完整文章标题"/);
  assert.match(updated, /November 23<\/span>&nbsp;·&nbsp;<span>5 min<\/span><\/footer>/);
  assert.doesNotMatch(updated, /<span>ZHR<\/span>/);
  assert.doesNotMatch(updated, /class="blog-path"|遂心快意/);
  assert.equal(applyBlogLayout(updated, "posts/index.html"), updated);
  assert.doesNotMatch(applyBlogLayout(oldPage, "posts/example/index.html"), /class="[^"]*blog-index/);
});

test("rejects unrecognised shells or unrelated paths", () => {
  assert.throws(() => applyBlogLayout("<main></main>", "posts/index.html"), /无法识别/);
  assert.throws(() => applyBlogLayout(oldPage, "about/index.html"), /不支持/);
});

test("removes repeated authors from archives without changing the article byline", () => {
  const dateAndDuration = '<span title="2026-11-23">November 23</span>&nbsp;·&nbsp;<span>5 min</span>';
  const archive = oldPage.replace(content, `<div class="archive-meta">${dateAndDuration}&nbsp;·&nbsp;<span>ZHR</span></div>`);
  const article = oldPage.replace(content, `<div class="post-meta">${dateAndDuration}&nbsp;·&nbsp;<span>ZHR</span></div>${content}`);
  assert.ok(applyBlogLayout(archive, "archives/index.html").includes(`<div class="archive-meta">${dateAndDuration}</div>`));
  assert.ok(applyBlogLayout(article, "posts/example/index.html").includes('<span>ZHR</span>'));
});
