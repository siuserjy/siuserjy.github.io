---
title: "用 Astro 搭建个人网站的完整复盘"
date: 2024-04-05
description: "从零到上线，记录我用 Astro + Tailwind CSS 搭建个人网站的技术选型、设计思考和踩坑经验。"
tags: [技术, 建站, Astro]
draft: false
---

## 为什么要自己建站

市面上有很多现成的博客平台——掘金、知乎、Medium。为什么还要自己搭？

三个原因：

1. **完全控制**: 内容、设计、数据都在自己手里
2. **技术练手**: 一个完整的项目，从设计到部署，全链路走一遍
3. **个人品牌**: 一个有辨识度的个人站点，比平台主页更有说服力

## 技术选型

### 框架：Astro

选 Astro 的理由很简单：

- **零 JS by default**: 静态页面不需要运行时 JavaScript，性能极好
- **内容优先**: 原生支持 Markdown，Content Collections 类型安全
- **Islands 架构**: 需要交互的地方才加载 JS，不浪费

对比过 Next.js 和 Hugo。Next.js 太重，个人博客不需要 SSR。Hugo 太死板，模板语法不够灵活。Astro 是最好的平衡点。

### 样式：Tailwind CSS 4

Tailwind 4 的新特性让开发体验又上了一个台阶：

- CSS 变量原生支持，主题切换更简单
- 零配置，直接 `@import "tailwindcss"` 就行
- 性能更好，构建更快

### 部署：Cloudflare Pages

免费、快速、全球 CDN。Git push 自动部署，零运维成本。

## 设计思考

### 暗色优先 + 金色点缀

个人审美偏好：暗色背景 + 金色 accent (#c9a96e)。

这个配色方案的好处是：
- 暗色背景对眼睛友好，适合长时间阅读
- 金色点缀提升质感，不会太沉闷
- 明暗对比强，信息层次清晰

### 动效哲学

动效不是越多越好，原则是：

- **有意义**: 每个动画都服务于信息传达
- **不打扰**: 微妙的 scroll reveal，不会吓到用户
- **性能优先**: Canvas 动画用 requestAnimationFrame，不掉帧

### 自定义光标

一个小细节：用 SVG data URI 做了金色圆点光标。精确模式设备才生效，触屏设备自动降级。

## 踩过的坑

### Cloudflare Pages 不支持 SSR

最开始用了 `@astrojs/node` 适配器，想做服务端渲染。结果 Cloudflare Pages 静态部署根本不支持。

解决方案：全站纯静态构建。Admin 后台用纯前端 SPA + GitHub API。

### 内容管理

没有后端，怎么管理内容？最终方案是写了一个纯静态的 Admin SPA，通过 GitHub Contents API 直接操作仓库里的 Markdown 文件。

保存文章 = 调 GitHub API 提交 commit = 触发 Cloudflare Pages 重新部署。整个流程零后端。

### View Transitions

Astro 的 View Transitions API 让页面切换丝滑了很多，但要注意 inline script 在页面切换后不会重新执行。需要监听 `astro:page-load` 事件重新初始化。

## 总结

个人网站是一个永远不会完成的项目——总有新功能想加、新样式想改。但这正是它的魅力：一个可以持续迭代、反映你当前状态的作品。

如果你也想搭建自己的个人站点，我的建议是：**先上线，再迭代。完美是好的敌人。**
