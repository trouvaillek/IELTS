# IELTS Skills V3 for Codex

这是一套给 Codex 使用的本地雅思备考技能包：写作批改、阅读/听力错题分析、口语素材、词汇训练、诊断规划，以及本地可视化 dashboard。

数据默认写在 `~/.ielts/`，程序安装到 `~/.codex/skills/`。所有数据保留在本机。

## 安装

Windows 在本目录运行：

```cmd
install-codex.bat
```

macOS / Linux / Git Bash：

```bash
bash install-codex.sh
```

安装后应看到：

```text
%USERPROFILE%\.codex\skills\ielts\SKILL.md
%USERPROFILE%\.codex\skills\ielts-dashboard\dashboard\package.json
%USERPROFILE%\.codex\skills\SCHEMA.md
```

旧的 `install.bat` / `install.sh` 保留给 Claude Code 用户；Codex 用户请使用 `install-codex.*`。

## Codex 触发方式

Codex 不依赖 Claude Code 的 `/ielts` slash 命令。直接用自然语言说：

| 你想做什么 | 对 Codex 说 |
| --- | --- |
| 备考入口 / 规划 | 我要备考雅思 |
| 成绩诊断 | 分析我的雅思成绩，帮我做计划 |
| 写作批改 | 帮我批改这篇雅思作文 |
| 阅读分析 | 分析这篇雅思阅读错题 |
| 听力分析 | 分析这套雅思听力错题 |
| 口语素材 | 帮我准备雅思口语 Part 2 素材 |
| 词汇训练 | 带我练雅思词汇，考我 |
| 可视化 | 打开雅思 dashboard |

8 个 skill 会保留拆分结构，Codex 会根据你的话自动加载最相关的一个。

## Dashboard

第一次启动 dashboard：

```cmd
cd /d "%USERPROFILE%\.codex\skills\ielts-dashboard\dashboard"
npm.cmd install
npm.cmd start
```

PowerShell 也要用 `npm.cmd`，不要直接打 `npm`，否则某些 Windows 机器会遇到执行策略报错。

浏览器打开：

```text
http://localhost:5173
```

常用命令：

```cmd
npm.cmd run seed       REM 灌演示数据
npm.cmd run validate   REM 校验 ~/.ielts/ 数据
npm.cmd run backup     REM 备份 ~/.ielts/
npm.cmd run reset      REM 清空数据，先备份再确认
```

## 文件夹

```text
解压目录/                              安装源文件，保留备用
C:\Users\你的用户名\.codex\skills\    Codex 自动发现 skill 的位置
C:\Users\你的用户名\.ielts\            你的备考数据
```

`~/.ielts/` 里的数据结构见 `SCHEMA.md`。

## 故障排查

| 现象 | 解决 |
| --- | --- |
| Codex 没触发 IELTS skill | 确认 `~/.codex/skills/ielts/SKILL.md` 存在，重启 Codex |
| dashboard 目录不存在 | 重新运行 `install-codex.bat` |
| PowerShell 运行 npm 报 `npm.ps1 cannot be loaded` | 改用 `npm.cmd` 或 CMD |
| `npm.cmd install` 网络慢 | 运行 `npm.cmd config set registry https://registry.npmmirror.com` 后重试 |
| 页面打开但没数据 | 先让 Codex 做一次诊断/批改，或运行 `npm.cmd run seed` 看演示 |
