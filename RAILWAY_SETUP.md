# 🚂 Railway Setup - Ghid Complet

## 📋 Ce Vei Obține

- ✅ Deploy automat din GitHub
- ✅ HTTPS automat
- ✅ URL permanent (ex: `https://your-app.railway.app`)
- ✅ Fără limite de deployments
- ✅ Funcționează perfect cu Telegram Mini Apps

## 🚀 Setup Pas cu Pas

### Pasul 1: Creează Cont Railway

1. Mergi la https://railway.app
2. Click pe **"Start a New Project"** sau **"Login"**
3. Sign up cu **GitHub** (recomandat - cel mai ușor)
4. Autorizează Railway să acceseze repository-urile tale

### Pasul 2: Deploy Aplicația

1. În dashboard-ul Railway, click **"New Project"**
2. Selectează **"Deploy from GitHub repo"**
3. Selectează repository-ul tău (`Origin App` sau cum se numește)
4. Railway va detecta automat că e un proiect Vite/React

### Pasul 3: Configurare Build (Dacă e necesar)

Railway ar trebui să detecteze automat, dar dacă nu:

1. Click pe proiectul tău în Railway
2. Click pe **"Settings"**
3. Verifică:
   - **Build Command**: `npm run build` (sau lasă gol dacă e auto-detectat)
   - **Start Command**: (nu e necesar pentru static sites)
   - **Output Directory**: `dist` (pentru Vite)

### Pasul 4: Obține URL-ul

1. În dashboard-ul proiectului, click pe **"Settings"**
2. Scroll până la **"Domains"**
3. Click pe **"Generate Domain"** (sau folosește cel generat automat)
4. Copiază URL-ul (ex: `https://your-app.railway.app`)

### Pasul 5: Configurează Telegram Bot

1. Deschide Telegram → Caută **@BotFather**
2. Trimite `/setmenubutton`
3. Selectează bot-ul tău
4. Trimite URL-ul de la Railway (ex: `https://your-app.railway.app`)
5. Trimite `/newapp`
6. Completează:
   - **Title**: "CRM System"
   - **Short name**: "crm"
   - **Description**: "Sistem CRM"
   - **Photo**: Încarcă o iconiță
   - **Web App URL**: URL-ul de la Railway
7. Gata! Bot-ul poate deschide aplicația

## 🔧 Configurare Avansată (Opțional)

### Variabile de Mediu

Dacă vrei să folosești variabile de mediu:

1. În Railway, click pe proiect
2. Click pe **"Variables"**
3. Adaugă variabile (ex: `NODE_ENV=production`)

**Notă:** Pentru aplicația ta, nu e necesar - Supabase URL și key sunt deja în cod.

### Custom Domain (Opțional)

1. În Railway, click pe **"Settings"** → **"Domains"**
2. Click **"Custom Domain"**
3. Adaugă domeniul tău
4. Configurează DNS-ul conform instrucțiunilor

## 📊 Monitoring

Railway oferă:
- ✅ Logs în timp real
- ✅ Metrics (CPU, Memory, etc.)
- ✅ Deploy history
- ✅ Rollback la versiuni anterioare

## 💰 Costuri

- **Free Tier**: $5 credit/lună
- **Pentru aplicația ta** (static site): ~$0.01-0.05/lună
- **Deci ai destul credit gratuit!**

## 🔄 Deploy Automat

După setup:
1. Fă push pe GitHub
2. Railway detectează automat
3. Build și deploy automat
4. Aplicația e live în ~2-3 minute

## 🐛 Troubleshooting

### Build eșuează
- Verifică logs în Railway dashboard
- Asigură-te că `package.json` are script-ul `build`
- Verifică că toate dependențele sunt în `package.json`

### Aplicația nu se încarcă
- Verifică că build-ul s-a terminat cu succes
- Verifică URL-ul în browser
- Verifică logs pentru erori

### Deploy nu se declanșează automat
- Verifică că repository-ul e conectat corect
- Verifică branch-ul (Railway folosește `main` sau `master`)

## ✅ Verificare Finală

1. ✅ Aplicația rulează pe Railway
2. ✅ URL-ul funcționează în browser
3. ✅ Bot-ul Telegram poate deschide aplicația
4. ✅ Deploy automat funcționează

## 🎯 Next Steps

După ce e live pe Railway:
1. Testează aplicația în browser
2. Testează în Telegram prin bot
3. Fă o modificare și verifică deploy automat
4. Gata! Nu mai ai limite de deployments! 🎉

## 📝 Notă Importantă

Railway e perfect pentru:
- ✅ Static sites (ca aplicația ta)
- ✅ Node.js apps
- ✅ Deploy automat
- ✅ Fără limite de deployments

**Perfect alternativă la Vercel!** 🚂


