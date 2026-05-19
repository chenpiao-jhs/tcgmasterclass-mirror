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
