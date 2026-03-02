@echo off
REM Android 图标复制脚本 (Windows)
REM 在运行 `pnpm tauri android init` 后执行此脚本

setlocal enabledelayedexpansion

set SCRIPT_DIR=%~dp0
set PROJECT_ROOT=%SCRIPT_DIR%..
set ICONS_SRC=%PROJECT_ROOT%\src-tauri\icons\android
set GEN_RES=%PROJECT_ROOT%\src-tauri\gen\android\app\src\main\res

echo 📱 Android 图标复制脚本
echo ========================

REM 检查 gen 目录是否存在
if not exist "%PROJECT_ROOT%\src-tauri\gen\android" (
  echo ❌ 错误: gen\android 目录不存在
  echo 请先运行: pnpm tauri android init
  exit /b 1
)

REM 检查源图标目录
if not exist "%ICONS_SRC%" (
  echo ❌ 错误: 图标源目录不存在: %ICONS_SRC%
  exit /b 1
)

REM 复制 mipmap 目录
for %%d in (mipmap-mdpi mipmap-hdpi mipmap-xhdpi mipmap-xxhdpi mipmap-xxxhdpi) do (
  if exist "%ICONS_SRC%\%%d" (
    echo 📁 复制 %%d...
    if not exist "%GEN_RES%\%%d" mkdir "%GEN_RES%\%%d"
    xcopy /Y /Q "%ICONS_SRC%\%%d\*" "%GEN_RES%\%%d\" >nul 2>&1
  )
)

REM 复制 mipmap-anydpi-v26 (自适应图标)
if exist "%ICONS_SRC%\mipmap-anydpi-v26" (
  echo 📁 复制 mipmap-anydpi-v26 (自适应图标)...
  if not exist "%GEN_RES%\mipmap-anydpi-v26" mkdir "%GEN_RES%\mipmap-anydpi-v26"
  xcopy /Y /Q "%ICONS_SRC%\mipmap-anydpi-v26\*" "%GEN_RES%\mipmap-anydpi-v26\" >nul 2>&1
)

REM 复制 values (颜色配置)
if exist "%ICONS_SRC%\values" (
  echo 📁 复制 values (颜色配置)...
  if not exist "%GEN_RES%\values" mkdir "%GEN_RES%\values"
  xcopy /Y /Q "%ICONS_SRC%\values\*" "%GEN_RES%\values\" >nul 2>&1
)

echo.
echo ✅ Android 图标复制完成！
echo 已复制到: %GEN_RES%