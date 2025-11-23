@echo off
echo Starting production preview server...
echo.

REM Add Node.js to PATH for this session
set "PATH=%PATH%;C:\Program Files\nodejs"

REM Check if Node.js is available
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js not found in PATH!
    echo Please make sure Node.js is installed at: C:\Program Files\nodejs
    pause
    exit /b 1
)

REM Check if dist folder exists
if not exist "dist" (
    echo ERROR: dist folder not found!
    echo Please run 'build-local.bat' first to build the application.
    pause
    exit /b 1
)

REM Start preview server
echo.
echo Starting preview server...
echo Open http://localhost:4173 in your browser when ready!
echo.
call npm run preview

pause


