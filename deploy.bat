@echo off
echo ========================================
echo  TorrentFlix - Deploy para Easypanel
echo ========================================
echo.

REM Faz push para o repositorio
echo [1/2] Enviando commits para o repositorio...
git push

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERRO: Falha ao enviar commits para o repositorio.
    pause
    exit /b 1
)

echo.
echo [2/2] Disparando deploy no Easypanel...
curl -X POST "http://177.190.147.114:3000/api/compose/deploy/f0afc0392fba54b8245b79aaaa502929bcca1c914eaaf8f2"

echo.
echo.
echo ========================================
echo  Deploy iniciado com sucesso!
echo ========================================
echo.
pause
