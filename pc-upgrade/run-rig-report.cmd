@echo off
REM ---------------------------------------------------------------
REM  Desktop-94 Rig Report - double-click launcher
REM
REM  Runs the PowerShell report from Command Prompt without having to
REM  change any execution-policy settings permanently. The -Bypass flag
REM  applies to this one run only.
REM ---------------------------------------------------------------
title Desktop-94 Rig Report
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0rig-report.ps1"
echo.
echo Report also saved to "%~dp0rig-report.txt"
echo.
pause
