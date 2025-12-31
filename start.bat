@echo off
title TorrentFlix Launcher

echo ========================================
echo        TORRENTFLIX - Iniciando
echo ========================================
echo.

:: Verifica se node_modules existe no server
if not exist "server\node_modules" (
    echo [SERVER] Instalando dependencias...
    cd server
    call npm install
    cd ..
)

:: Verifica se node_modules existe no client
if not exist "client\node_modules" (
    echo [CLIENT] Instalando dependencias...
    cd client
    call npm install
    cd ..
)

echo.
echo [*] Iniciando Backend e Frontend...
echo.

:: Inicia o backend em uma nova janela
start "TorrentFlix - Backend" cmd /k "cd /d %~dp0server && npm run dev"

:: Aguarda 2 segundos para o backend iniciar
timeout /t 2 /nobreak > nul

:: Inicia o frontend em uma nova janela
start "TorrentFlix - Frontend" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo ========================================
echo   Backend: http://localhost:3000
echo   Frontend: http://localhost:5173
echo ========================================
echo.
echo Pressione qualquer tecla para abrir o navegador...
pause > nul

:: Abre o navegador
start http://localhost:5173
