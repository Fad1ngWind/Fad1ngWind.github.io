# 博客文章导入

以后新增或更新 Markdown 文章，只需要在工作区根目录运行：

```bash
npm run blog:import
```

这条命令会一次完成：

- 读取 `tools/import-blog-posts.mjs` 中登记的文章源文件；
- 复制文章目录内通过相对路径引用的本地图片；
- 渲染行内公式、块级公式和 Obsidian 风格提示块；
- 更新文章页、博客列表、归档、分类、标签、搜索和站点地图；
- 检查全部文章是否残留 Markdown 标记、公式错误或缺失图片。

只检查当前网站、不重新导入时运行：

```bash
npm run blog:check
```

预览副本可以通过 `BLOG_SITE_ROOT` 指定输出目录，避免改动正式网站：

```bash
BLOG_SITE_ROOT=/path/to/preview npm run blog:import
```

新增文章时，在 `legacyImports` 或 `currentImports` 中登记源文件、网址名称、标题、日期、分类和简介。文章图片建议放在 Markdown 同目录的 `images` 文件夹，并使用相对路径引用。

默认从当前用户主目录下的 `_posts` 文件夹读取文章。如果文章文件夹位于其他位置，可以在运行时指定：

```bash
BLOG_SOURCE_ROOT=/path/to/_posts npm run blog:import
```
