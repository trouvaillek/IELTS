---
name: ielts-dashboard
description: 启动本地雅思备考可视化 dashboard。Use when the user asks to open/view the IELTS dashboard, visualize progress, inspect charts, run demo data, validate data, or says “看仪表板”, “打开 dashboard”, “图表进度”, “可视化”. Uses ~/.codex/skills/ielts-dashboard/dashboard and reads ~/.ielts/.
---

# IELTS Dashboard — Codex 启动器

你是 dashboard 启动器。你的任务只有一件事：启动本地服务，并把浏览器 URL 告诉用户。

不要在对话里解释图表、分析数据或贴截图；页面本身负责展示，文字分析交给 `ielts` 主入口。

## 路径约定

Dashboard 程序安装在：

```text
~/.codex/skills/ielts-dashboard/dashboard/
```

用户备考数据读取自：

```text
~/.ielts/
```

不要让用户回源代码目录启动。Codex 安装脚本会把 dashboard 复制到 `.codex/skills`。

## 启动流程

1. 确认 Node.js 可用且版本 >= 18：

```bash
node --version
```

2. Windows 优先使用 CMD 或 `npm.cmd`，避免 PowerShell 的 `npm.ps1` 执行策略拦截：

```cmd
cd /d "%USERPROFILE%\.codex\skills\ielts-dashboard\dashboard"
if not exist node_modules npm.cmd install
npm.cmd start
```

3. PowerShell 也可以，但必须显式使用 `npm.cmd`：

```powershell
cd "$env:USERPROFILE\.codex\skills\ielts-dashboard\dashboard"
if (!(Test-Path node_modules)) { npm.cmd install }
npm.cmd start
```

4. macOS / Linux / Git Bash：

```bash
cd ~/.codex/skills/ielts-dashboard/dashboard
[ -d node_modules ] || npm install
npm start
```

启动后终端应显示：

```text
[server] listening on http://127.0.0.1:4000
Local: http://localhost:5173/
```

告诉用户：dashboard 已启动，打开 http://localhost:5173；停止服务按 `Ctrl+C`。

## 常用维护命令

在 dashboard 目录运行：

```cmd
npm.cmd run seed       REM 写入演示数据
npm.cmd run validate   REM 校验 ~/.ielts/ 数据格式
npm.cmd run backup     REM 备份 ~/.ielts/
npm.cmd run reset      REM 清空数据，脚本会先备份并确认
```

macOS / Linux 把 `npm.cmd` 换成 `npm`。

## Statusline

`scripts/statusline.js` 是旧 Claude Code 状态栏脚本。Codex 主流程不需要配置 status line；除非用户明确要求，否则不要引导用户修改设置。

## 故障排查

| 现象 | 处理 |
| --- | --- |
| PowerShell 提示 `npm.ps1 cannot be loaded` | 使用 `npm.cmd` 或 CMD |
| `EADDRINUSE :4000` | 后端端口被占，用 CMD 跑 `set PORT=4001 && npm.cmd start` |
| 页面空白 | 确认终端有 `[server] listening`，再刷新浏览器 |
| 数据全是 0 | 先用 IELTS 诊断/写作等技能生成真实数据，或运行 `npm.cmd run seed` 看演示 |
| 找不到 dashboard 目录 | 运行源目录里的 `install-codex.bat` |
