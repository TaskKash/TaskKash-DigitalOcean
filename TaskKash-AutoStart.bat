@echo off
REM ============================================================
REM  TaskKash Server — Windows Auto-Start Script
REM  Runs silently on login via Task Scheduler.
REM  Place this in your Startup folder or run as a scheduled task.
REM ============================================================
cd /d "C:\Users\ahmed\Downloads\TK_2026\WebSite\TaskKash-DigitalOcean"
pm2 resurrect
