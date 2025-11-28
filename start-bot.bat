@echo off
echo ========================================
echo   Starting Telegram Bot...
echo ========================================
echo.

if not exist .env (
    echo ERROR: .env file not found!
    echo Please create .env file first.
    pause
    exit /b 1
)

echo Starting bot...
echo (dotenv will load .env automatically)
echo.

call npm run bot

if errorlevel 1 (
    echo.
    echo ERROR: Bot failed to start!
    echo Check your .env configuration.
    pause
)

