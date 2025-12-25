@echo off
echo ==============================
echo Compiling TypeScript...
echo ==============================

npx tsc

IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo Compilation failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo Compilation successful!
pause
