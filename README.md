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
