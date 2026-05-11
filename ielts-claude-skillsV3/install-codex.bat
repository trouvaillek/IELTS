@echo off
setlocal
chcp 65001 >nul

set "SRC=%~dp0"
set "DST=%USERPROFILE%\.codex\skills"

echo.
echo === IELTS Skills V3 for Codex installer ===
echo.
echo Source: %SRC%
echo Target: %DST%
echo.

if not exist "%DST%" mkdir "%DST%"

set "SKILLS=ielts ielts-diagnose ielts-writing ielts-reading ielts-listening ielts-speaking ielts-vocab"

for %%S in (%SKILLS%) do (
    if not exist "%DST%\%%S" mkdir "%DST%\%%S"
    copy /Y "%SRC%%%S\SKILL.md" "%DST%\%%S\SKILL.md" >nul
    if errorlevel 1 (
        echo [FAILED] %%S
        exit /b 1
    ) else (
        echo [OK] %%S
    )
)

if not exist "%DST%\ielts-dashboard" mkdir "%DST%\ielts-dashboard"
copy /Y "%SRC%ielts-dashboard\SKILL.md" "%DST%\ielts-dashboard\SKILL.md" >nul
if errorlevel 1 (
    echo [FAILED] ielts-dashboard SKILL.md
    exit /b 1
)

robocopy "%SRC%ielts-dashboard\dashboard" "%DST%\ielts-dashboard\dashboard" /E /XD node_modules dist .git /NFL /NDL /NJH /NJS /NP >nul
set "ROBOCOPY_STATUS=%ERRORLEVEL%"

if %ROBOCOPY_STATUS% LSS 8 goto dashboard_ok
echo [FAILED] ielts-dashboard dashboard copy
exit /b 1

:dashboard_ok
echo [OK] ielts-dashboard

copy /Y "%SRC%SCHEMA.md" "%DST%\SCHEMA.md" >nul
if errorlevel 1 (
    echo [FAILED] SCHEMA.md
    exit /b 1
)
echo [OK] SCHEMA.md

echo.
echo === Install complete ===
echo.
echo Next:
echo   1. Restart Codex so it reloads skills.
echo   2. Say: 我要备考雅思
echo   3. To start dashboard:
echo      cd /d "%%USERPROFILE%%\.codex\skills\ielts-dashboard\dashboard"
echo      npm.cmd install
echo      npm.cmd start
echo.

endlocal
