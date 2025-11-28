# 🔑 Obține Gemini API Key - Pași Rapizi

## ✅ Pasul 1: Verifică VPN-ul

Asigură-te că VPN-ul este **conectat** și că ești pe un server din:
- România
- Germania
- Sau altă țară disponibilă

Verifică IP-ul: https://whatismyipaddress.com/

## 🔑 Pasul 2: Obține API Key

1. **Cu VPN activat**, deschide: https://makersuite.google.com/app/apikey

2. **Loghează-te** cu contul tău Google

3. Dacă vezi mesajul "Not available in your region":
   - Verifică că VPN-ul este conectat
   - Schimbă serverul VPN la altă țară (ex: Germania)
   - Reîncarcă pagina

4. **Click pe "Create API Key"** (sau "Get API Key")

5. **Selectează proiect**:
   - Dacă ai deja un proiect Google Cloud, selectează-l
   - Sau creează unul nou (gratuit)

6. **Copiază cheia API**:
   - Se va afișa o cheie (ex: `AIzaSy...`)
   - **Copiază-o imediat** (se afișează o singură dată!)

## ⚙️ Pasul 3: Configurează .env

Actualizează fișierul `.env`:

```env
# Telegram Bot Configuration
BOT_TOKEN=8279646817:AAGr9MCtYqYR8M93jpPy4lWqZ0KcaqS4tM0
APP_URL=https://your-app-url.com

# AI Provider Configuration
AI_PROVIDER=gemini

# Gemini API Key
GEMINI_API_KEY=AIzaSy...your_key_here

# OpenAI API Key (Opțional - pentru fallback)
OPENAI_API_KEY=
```

**Înlocuiește** `AIzaSy...your_key_here` cu cheia ta reală.

## 🚀 Pasul 4: Testează

Restart bot-ul:

```bash
npm run bot
```

Ar trebui să vezi:
```
✅ Gemini AI initialized
🤖 Telegram bot is running!
```

## ✅ Gata!

După ce ai API key-ul, **nu mai ai nevoie de VPN** pentru bot. API key-ul funcționează permanent!

---

**Notă**: Dacă nu poți accesa Google AI Studio, verifică că VPN-ul este conectat și că ești pe un server din țară disponibilă.

