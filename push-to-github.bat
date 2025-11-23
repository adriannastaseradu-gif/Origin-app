@echo off
echo ========================================
echo Pushing Task Manager to GitHub
echo ========================================
echo.

REM Check if .git exists
if not exist ".git" (
    echo Initializing Git repository...
    git init
    echo.
)

REM Add remote (will update if exists)
echo Setting up GitHub remote...
git remote remove origin 2>nul
git remote add origin https://github.com/adriannastaseradu-gif/Origin-app.git
echo.

REM Add all files
echo Staging files...
git add .
echo.

REM Commit
echo Committing changes...
git commit -m "Update Task Manager with Firebase persistence and Telegram user ID"
echo.

REM Push to GitHub
echo Pushing to GitHub...
echo.
echo NOTE: You may be prompted for GitHub credentials.
echo If asked for username/password, use a Personal Access Token instead of password.
echo.
git push -u origin main
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Trying 'master' branch instead...
    git push -u origin master
)

echo.
echo ========================================
echo Done! Check your GitHub repository.
echo ========================================
pause

