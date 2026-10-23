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

研究资料默认从当前用户主目录下的 `基于PINN和历元间连续性约束的GNSSINS融合定位方法` 文件夹读取。如需使用其他位置，可以在运行时指定：

```bash
BLOG_RESEARCH_ROOT=/path/to/research-folder npm run blog:import
```

具身智能文章默认从当前用户文档目录下的对应输出文件夹读取。如需使用其他位置，可以在运行时指定：

```bash
BLOG_EMBODIED_AI_ROOT=/path/to/vla-vlm-embodied-ai-blog npm run blog:import
```

## 首页资源更新

首页使用 WebP 展示图片，原 JPG/PNG 素材保留用于重新导出。照片推荐质量 82，流程图推荐质量 88，例如：

```bash
cwebp -mt -m 6 -q 82 assets/homepage/media/profile-2.jpg -o assets/homepage/media/profile-2.webp
```

头像保留 `src` 和 `fetchpriority="high"`。延迟加载的图片使用 `data-src`、`loading="lazy"` 和 `decoding="async"`；`home.js` 会在图片接近可视区域时填写 `src`，不支持 IntersectionObserver 的浏览器会一次加载全部图片。

`noto-serif-sc-name-500.woff2` 只包含“张华睿”，保留现有姓名字形。完整中文字库及字体许可证均保留；更改姓名时，需要重新生成字体子集并同步 `home.css` 的 `unicode-range`。

Vercel 只为首页 WebP 图片和 WOFF2 字体设置一天的浏览器缓存。HTML、CSS、JavaScript 和简历 PDF 沿用默认重新验证策略，避免影响简历与页面更新。同名替换图片或字体时，需同步更改页面中的资源文件名或版本参数；修改 `home.js` 后更新首页脚本的 `v` 参数。

发布前运行：

```bash
node --check assets/homepage/home.js
git diff --check
npm run blog:check
```

在本地浏览器确认姓名字形、轮播按钮和向下滚动时的图片加载正常。缓存响应头只能在部署后核验，本地预览服务器不会应用 `vercel.json`。
