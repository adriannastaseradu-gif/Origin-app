# 🚂 Pași pentru Deploy pe Railway

## ✅ Ce ai făcut deja:
- ✅ Cont Railway creat
- ✅ Conectat la GitHub

## 📋 Pașii următori:

### Pasul 1: Creează Proiect Nou
1. În dashboard-ul Railway, click pe butonul **"New Project"** (sau **"+"** în colțul din stânga sus)
2. Selectează **"Deploy from GitHub repo"**
3. Dacă nu vezi repository-ul tău, click pe **"Configure GitHub App"** și autorizează accesul

### Pasul 2: Selectează Repository-ul
1. Găsește repository-ul tău în listă (probabil se numește "Origin App" sau similar)
2. Click pe el
3. Railway va începe automat să detecteze tipul de proiect

### Pasul 3: Verifică Configurația
Railway ar trebui să detecteze automat:
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`
- **Output Directory**: `dist`

Dacă nu detectează automat:
1. Click pe proiectul tău
2. Click pe **"Settings"**
3. Verifică că:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`

### Pasul 4: Așteaptă Deploy-ul
1. Railway va începe automat build-ul
2. Poți vedea progresul în tab-ul **"Deployments"**
3. Build-ul durează ~2-3 minute
4. Când e gata, vei vedea **"Active"** cu un checkmark verde ✅

### Pasul 5: Obține URL-ul
1. Click pe proiectul tău
2. Click pe **"Settings"**
3. Scroll până la secțiunea **"Domains"**
4. Click pe **"Generate Domain"** (sau folosește cel generat automat)
5. **Copiază URL-ul** (ex: `https://your-app-name.railway.app`)

### Pasul 6: Testează Aplicația
1. Deschide URL-ul în browser
2. Verifică că aplicația se încarcă corect
3. Testează funcționalitățile (login, adăugare client, etc.)

### Pasul 7: Configurează Telegram Bot
1. Deschide Telegram → Caută **@BotFather**
2. Trimite `/setmenubutton`
3. Selectează bot-ul tău
4. Trimite URL-ul de la Railway (ex: `https://your-app-name.railway.app`)
5. Sau folosește `/newapp` pentru a crea un Mini App complet

## 🔄 Deploy Automat
După setup:
- **Orice push pe GitHub** → Railway face deploy automat
- **Nu mai ai limite de deployments!** 🎉

## 🐛 Dacă apare o problemă:

### Build eșuează
- Click pe deployment-ul eșuat
- Vezi logs pentru detalii
- Verifică că toate dependențele sunt în `package.json`

### Aplicația nu se încarcă
- Verifică că build-ul s-a terminat cu succes
- Verifică URL-ul în browser
- Verifică logs în Railway dashboard

### Port issues
- Railway setează automat variabila `PORT`
- Script-ul `start` folosește `$PORT` automat

## ✅ Checklist Final
- [ ] Proiect creat în Railway
- [ ] Repository conectat
- [ ] Deploy reușit (status "Active")
- [ ] URL obținut și testat în browser
- [ ] Telegram bot configurat cu URL-ul
- [ ] Deploy automat funcționează (testează cu un push)

## 🎯 Gata!
Aplicația ta e live pe Railway și se va actualiza automat la fiecare push! 🚂

