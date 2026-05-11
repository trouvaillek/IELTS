@echo off
REM IELTS Skills V3.1 — Windows 安装脚本
REM 用法：双击本文件，或在 cmd 里执行
REM
REM 它做的事：
REM   1. 把 7 个 skill 的 SKILL.md 复制到 %USERPROFILE%\.claude\skills\
REM   2. 把 ielts-dashboard 的 SKILL.md + dashboard 项目（不含 node_modules）复制过去
REM   3. 复制 SCHEMA.md
REM   4. 提示下一步

setlocal
chcp 65001 >nul

set "SRC=%~dp0"
set "DST=%USERPROFILE%\.claude\skills"

echo.
echo === 雅思 Skills V3.1 安装 ===
echo.
echo 源目录：%SRC%
echo 目标：  %DST%
echo.

if not exist "%DST%" mkdir "%DST%"

set "SKILLS=ielts ielts-diagnose ielts-writing ielts-reading ielts-listening ielts-speaking ielts-vocab"

for %%S in (%SKILLS%) do (
    if not exist "%DST%\%%S" mkdir "%DST%\%%S"
    copy /Y "%SRC%%%S\SKILL.md" "%DST%\%%S\SKILL.md" >nul
    if errorlevel 1 (
        echo [失败] %%S
    ) else (
        echo [完成] %%S
    )
)

REM ielts-dashboard：复制 SKILL.md + 整个 dashboard 项目（排除 node_modules / dist 节省空间，并保留用户已装的依赖）
if not exist "%DST%\ielts-dashboard" mkdir "%DST%\ielts-dashboard"
copy /Y "%SRC%ielts-dashboard\SKILL.md" "%DST%\ielts-dashboard\SKILL.md" >nul

set "EXCLUDE_FILE=%TEMP%\ielts_xcopy_exclude.txt"
> "%EXCLUDE_FILE%" echo \node_modules\
>>"%EXCLUDE_FILE%" echo \dist\
>>"%EXCLUDE_FILE%" echo \.git\

xcopy /E /I /Y /Q /EXCLUDE:"%EXCLUDE_FILE%" "%SRC%ielts-dashboard\dashboard" "%DST%\ielts-dashboard\dashboard\" >nul
del "%EXCLUDE_FILE%" >nul 2>&1
echo [完成] ielts-dashboard（含 dashboard 项目，未覆盖你已装的 node_modules）

REM Schema
copy /Y "%SRC%SCHEMA.md" "%DST%\SCHEMA.md" >nul
echo [完成] SCHEMA.md

echo.
echo === 安装完成 ===
echo.
echo 接下来：
echo   1. 确认 Node.js 18+ 已装：node --version
echo      （没有的话从 https://nodejs.org 下 LTS）
echo.
echo   2. 第一次启动 Dashboard（PowerShell 或 Git Bash）：
echo        cd "%%USERPROFILE%%\.claude\skills\ielts-dashboard\dashboard"
echo        npm install
echo        npm start
echo      浏览器会自动打开 http://localhost:5173
echo.
echo   3. 在 Claude Code 里输入：
echo        /ielts                  教练入口
echo        /ielts-dashboard        启动可视化仪表板（自动 npm install）
echo.
echo   4. 状态栏（可选）：编辑 %%USERPROFILE%%\.claude\settings.json，加：
echo      {
echo        "statusLine": {
echo          "type": "command",
echo          "command": "node %%USERPROFILE%%/.claude/skills/ielts-dashboard/dashboard/scripts/statusline.js"
echo        }
echo      }
echo.
pause
