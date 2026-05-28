# 符文战场-比赛精华汇总

一个符文战场 TCG 比赛复盘静态站，把公开赛和区域赛关键对局整理成可对照视频观看、复盘练习的打法页面。

## 本地查看

反馈功能需要后端接口。推荐本地用 Python 启动：

```bash
python3 server.py
```

然后打开 `http://127.0.0.1:8000/`。

## 部署

当前部署在 exe.dev VM：

```bash
ssh tcgmasterclass.exe.xyz
cd ~/runeterra-irelia-mirror-guide
git pull
```

服务文件是 `runeterra-guide.service`，由 `server.py` 提供静态网页和反馈接口。

## 比赛详情页组件

所有比赛详情页需要加载共享样式：

```html
<link rel="stylesheet" href="../assets/page-nav.css">
<link rel="stylesheet" href="../assets/detail-layout.css">
<link rel="stylesheet" href="../assets/video-hub.css">
<link rel="stylesheet" href="../assets/watch-card.css">
<link rel="stylesheet" href="../assets/detail-content.css">
```

`page-nav.css` / `page-nav.js` 负责目录高亮、视角切换和移动端锚点偏移，会根据 sticky 视频导航区域动态定位。双视角页面可用 `?perspective=视角ID` 直接打开指定视角，视角 ID 来自 `data-perspective-target` / `data-perspective-panel`，例如 `?perspective=yi`。`detail-content.css` 负责移动端正文密度、表格、时间点卡片和常用内容块间距。正文里的视频片段统一使用 `.watch-card`、`.watch-button`、`.watch-link`。如果按钮外层需要包裹，用 `.watch-actions`。PC 宽屏会把操作放在右侧上下排列，移动端会自动恢复为卡片底部上下排列。

牌表弹窗和正文卡名链接使用 `decklist-modal.css` / `decklist-modal.js`。启用 `window.tcgDecklistConfig.articleCardLinks` 后，正文和跳转卡片等组件里命中的牌表卡名会自动生成 `.tcg-card-link`：绿金点状下划线，点击打开卡图，悬停显示卡图预览。没有牌表弹窗的文章页可用 `window.tcgArticleCardLinkConfig` 单独启用同一组件。组件支持 `aliases` 识别简称/别名，也支持 `corrections` 或 `correctedAliases` 把错别字显示成正字。手写卡图链接也应复用 `.tcg-card-link`，并提供 `data-card-image`、`data-card-name` 和 `href`。

目录组件只保留一份 DOM：每个详情页在 `.topbar` 内写一个 `<nav class="nav">`，PC 竖排和移动端横向胶囊滚动都由 `assets/page-nav.css` 统一控制，不要在单个页面的移动端 media query 里重复定义 `.nav`、`.brand`、`.links` 或 `.links a` 的目录布局。新增或修改比赛页后运行：

```bash
python3 tools/check_page_nav.py
```

并在本地浏览器分别检查 PC 和移动端目录：只有一份目录、移动端目录横向滚动、点击目录后 hash 和高亮同步，正文标题不被固定视频区域遮住。

## 反馈数据

用户提交的反馈会追加保存到服务器本地：

```text
data/feedback.jsonl
```

这个目录不会提交到 Git，也不会被网页直接访问。

## 访问统计

服务端会把页面访问记录追加保存到服务器本地：

```text
data/visits.jsonl
```

只统计 HTML 页面访问，不统计图片、CSS、JS、健康检查和反馈接口。统计会使用匿名浏览器 Cookie 识别独立访客，并保存哈希后的 IP 辅助排查，不保存明文 IP。

查看最近 7 天访问次数和独立访客：

```bash
python3 analytics.py
```

查看今天：

```bash
python3 analytics.py --days 1
```

查看全部历史：

```bash
python3 analytics.py --days 0
```

默认会排除常见机器人和命令行请求。如果要一起看：

```bash
python3 analytics.py --include-bots
```
