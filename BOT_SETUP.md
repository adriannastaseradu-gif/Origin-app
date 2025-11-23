# 🤖 Setup Telegram Bot - Ghid Complet

## 📋 Ce Vei Obține

Un bot Telegram care poate:
- ✅ Deschide aplicația CRM cu un buton
- ✅ Răspunde la comenzi (`/start`, `/menu`)
- ✅ Oferă acces rapid la aplicație
- ✅ Funcționează 24/7

## 🚀 Setup Rapid

### Pasul 1: Creează Bot-ul

1. Deschide Telegram
2. Caută **@BotFather**
3. Trimite `/newbot`
4. Urmează instrucțiunile:
   - Nume bot: `CRM System Bot` (sau ce vrei tu)
   - Username: `your_crm_bot` (trebuie să se termine cu `bot`)
5. **Salvează token-ul** (ex: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### Pasul 2: Configurează Bot-ul

1. În BotFather, trimite `/setmenubutton`
2. Selectează bot-ul tău
3. Trimite URL-ul aplicației (ex: `https://your-app.railway.app`)
4. Gata! Butonul "Menu" din bot va deschide aplicația

### Pasul 3: Creează Mini App

1. În BotFather, trimite `/newapp`
2. Selectează bot-ul tău
3. Completează:
   - **Title**: "CRM System"
   - **Short name**: "crm" (trebuie să fie unic)
   - **Description**: "Sistem CRM pentru gestionare clienți"
   - **Photo**: Încarcă o iconiță (512x512px recomandat)
   - **Web App URL**: URL-ul aplicației tale
4. BotFather îți va da un link: `https://t.me/your_bot/crm`

### Pasul 4: Rulează Bot-ul (Opțional)

Dacă vrei un bot care răspunde la comenzi:

1. Instalează dependențele:
   ```bash
   npm install
   ```

2. Creează un fișier `.env`:
   ```
   BOT_TOKEN=your_bot_token_here
   APP_URL=https://your-app-url.com
   ```

3. Rulează bot-ul:
   ```bash
   node telegram-bot.js
   ```

**Notă:** Bot-ul poate rula pe:
- Computer-ul tău (când e pornit)
- Railway/Render (pentru 24/7)
- Un VPS (pentru control complet)

## 🎯 Opțiuni de Rulare Bot

### Opțiunea 1: Fără Bot Script (Recomandat pentru început)
- Doar configurează Menu Button în BotFather
- Butonul "Menu" va deschide direct aplicația
- Nu ai nevoie de server pentru bot

### Opțiunea 2: Cu Bot Script (Pentru funcționalități avansate)
- Bot-ul răspunde la comenzi
- Poți adăuga funcționalități custom
- Necesită un server care rulează bot-ul

## 📱 Testare

1. Deschide bot-ul în Telegram
2. Apasă butonul "Menu" (dacă l-ai configurat)
3. Sau folosește link-ul de la BotFather: `https://t.me/your_bot/crm`
4. Aplicația ar trebui să se deschidă!

## 🔧 Troubleshooting

### Bot-ul nu răspunde
- Verifică că token-ul este corect
- Asigură-te că bot-ul rulează (dacă folosești script)

### Aplicația nu se deschide
- Verifică că URL-ul este corect și accesibil
- Asigură-te că aplicația rulează pe hosting
- Testează URL-ul în browser înainte

### Menu Button nu apare
- Așteaptă câteva minute (poate dura până la 5 min)
- Reîncearcă `/setmenubutton` în BotFather

## 💡 Tips

- **Menu Button** este cel mai simplu mod de a deschide aplicația
- **Mini App Link** (`https://t.me/your_bot/crm`) poate fi partajat
- Poți adăuga bot-ul în grupuri pentru acces comun


