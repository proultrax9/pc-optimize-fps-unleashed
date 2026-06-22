@echo off

setlocal

call "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvars64.bat" >nul

set "PATH=%USERPROFILE%\.cargo\bin;%PATH%"

cd /d "%~dp0"



if not exist "release" mkdir "release"



call pnpm install

if errorlevel 1 exit /b 1

call npx tsc --noEmit

if errorlevel 1 exit /b 1

call pnpm tauri build

if errorlevel 1 exit /b 1



set "BUILT="

for /f "delims=" %%F in ('dir /s /b "%LOCALAPPDATA%\Temp\cursor-sandbox-cache" 2^>nul ^| findstr /i "\\release\\FPS Unleashed.exe$"') do set "BUILT=%%F"

if not defined BUILT if exist "src-tauri\target\release\FPS Unleashed.exe" set "BUILT=%~dp0src-tauri\target\release\FPS Unleashed.exe"



if not defined BUILT (

  echo Build finished but FPS Unleashed.exe was not found to copy.

  exit /b 1

)



for %%F in ("release\pc-optimizer-pro.exe" "release\FPS Unleashed_0.1.0_x64-setup.exe" "release\FPS Unleashed_0.1.0_x64_en-US.msi") do (

  if exist %%F del /f /q %%F

)



set "RELEASE_DIR=%~dp0release"

set "CARGO_RELEASE=%BUILT%\.."



copy /Y "%BUILT%" "%RELEASE_DIR%\FPS Unleashed.exe" >nul



for /f "delims=" %%F in ('dir /b "%CARGO_RELEASE%\bundle\nsis\*-setup.exe" 2^>nul') do (

  copy /Y "%CARGO_RELEASE%\bundle\nsis\%%F" "%RELEASE_DIR%\FPS Unleashed Setup.exe" >nul

)

for /f "delims=" %%F in ('dir /b "%CARGO_RELEASE%\bundle\msi\*.msi" 2^>nul') do (

  copy /Y "%CARGO_RELEASE%\bundle\msi\%%F" "%RELEASE_DIR%\FPS Unleashed.msi" >nul

)



echo Built release folder:

echo   FPS Unleashed.exe

echo   FPS Unleashed Setup.exe

echo   FPS Unleashed.msi



exit /b 0

