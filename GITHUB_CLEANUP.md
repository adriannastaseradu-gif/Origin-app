# How to Delete Old Files from GitHub

## Option 1: Using GitHub Desktop (Easiest)

1. **Open GitHub Desktop**
2. **Select your repository**: "Origin-app"
3. **View files**: You'll see all files in the repository
4. **Delete files locally**:
   - In GitHub Desktop, right-click on files you want to delete
   - Select "Delete" or "Remove"
   - Or delete them from your file explorer
5. **Commit the deletions**:
   - Write commit message: "Remove old/unnecessary files"
   - Click "Commit to main"
6. **Push to GitHub**:
   - Click "Push origin"
   - Files will be deleted from GitHub

## Option 2: Using VS Code

1. **Open VS Code** in your project folder
2. **Open Source Control** (Ctrl+Shift+G)
3. **Delete files** you don't need (from file explorer or terminal)
4. **Stage deletions**:
   - You'll see deleted files in "Changes"
   - Click "+" to stage them
5. **Commit**:
   - Write message: "Remove old files"
   - Click checkmark ✓
6. **Push**:
   - Click "..." → "Push" → "Push to..."

## Option 3: Delete Everything and Start Fresh

If you want to completely replace everything:

1. **Delete all files locally** (except `.git` folder)
2. **Add your new CRM files**
3. **Commit and push**:
   ```bash
   git add .
   git commit -m "Replace with CRM system"
   git push
   ```

## Files You Should Keep

✅ **Keep these:**
- `App.jsx` (your CRM)
- `supabase.js` (Supabase config)
- `package.json` (dependencies)
- `index.html`, `main.jsx`, `index.css` (app files)
- `vite.config.js` (build config)
- `.gitignore` (Git ignore rules)
- `database-setup.sql` (database setup)
- `SETUP.md`, `TELEGRAM_SETUP.md` (documentation)

❌ **You can delete:**
- Old Firebase files (already deleted locally)
- Old task manager files
- Any backup files
- Old documentation files

## Quick Command (if Git is installed)

```bash
# Delete specific files
git rm filename.js
git commit -m "Remove old files"
git push

# Or delete everything and re-add
git rm -r .
git add .
git commit -m "Replace with CRM"
git push
```

