@echo off
echo Starting Task Manager Development Server...
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

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to install dependencies!
        pause
        exit /b 1
    )
)

REM Start the development server
echo.
echo Starting Vite development server...
echo Open http://localhost:5173 in your browser when ready!
echo.
call npm run dev

pause


