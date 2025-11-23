# How to Push Files to GitHub

Since Git isn't configured in your terminal, here are the easiest ways to push your files:

## Option 1: Using VS Code (Easiest)

1. **Open VS Code Source Control**:
   - Click the Source Control icon in the left sidebar (looks like a branch)
   - Or press `Ctrl+Shift+G`

2. **Initialize Repository** (if not already done):
   - Click "Initialize Repository" if you see that button
   - Or open terminal in VS Code (`Ctrl+``) and run: `git init`

3. **Stage Files**:
   - Click the "+" next to each file you want to commit, OR
   - Click "+" next to "Changes" to stage all files

4. **Commit**:
   - Type a commit message like "Update Task Manager with Firebase persistence"
   - Click the checkmark (✓) or press `Ctrl+Enter`

5. **Connect to GitHub** (if not already connected):
   - Click "..." menu → "Remote" → "Add Remote"
   - Enter your GitHub repository URL
   - Or use: "Publish Branch" to create a new repo on GitHub

6. **Push**:
   - Click "..." menu → "Push" → "Push to..."
   - Select your remote (usually "origin")
   - Enter your GitHub credentials if prompted

## Option 2: Using GitHub Desktop

1. **Download GitHub Desktop** (if you don't have it):
   - https://desktop.github.com/

2. **Add Repository**:
   - File → Add Local Repository
   - Select your project folder: `C:\Users\Adrian\Desktop\Origin App`

3. **Commit Changes**:
   - You'll see all changed files
   - Write a commit message: "Update Task Manager with Firebase persistence"
   - Click "Commit to main"

4. **Push**:
   - Click "Push origin" button
   - Enter your GitHub credentials if needed

## Option 3: Using Command Line (if Git is installed)

Open PowerShell in your project folder and run:

```powershell
# Initialize repository (if needed)
git init

# Add all files
git add .

# Commit
git commit -m "Update Task Manager with Firebase persistence"

# Add remote (replace with your GitHub repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push
git push -u origin main
```

## Files to Push

Make sure these updated files are included:
- ✅ `App.jsx` (updated with Telegram user ID)
- ✅ `firebase.js` (with your Firebase config)
- ✅ `FIRESTORE_RULES.md` (new file)
- ✅ `.gitignore` (new file)
- ✅ All other project files

## After Pushing

1. **Vercel will auto-deploy** - Check your Vercel dashboard
2. **Test in Telegram** - Your app should now persist data!

