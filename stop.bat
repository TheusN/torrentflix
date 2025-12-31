@echo off
echo Parando TorrentFlix...

:: Mata processos node
taskkill /f /im node.exe 2>nul

echo.
echo TorrentFlix encerrado!
pause
