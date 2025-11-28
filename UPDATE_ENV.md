# ⚙️ Actualizează .env pentru Gemini API

Actualizează manual fișierul `.env` cu următoarele:

```env
# Telegram Bot Configuration
BOT_TOKEN=8279646817:AAGr9MCtYqYR8M93jpPy4lWqZ0KcaqS4tM0
APP_URL=https://your-app-url.com

# AI Provider Configuration
AI_PROVIDER=gemini

# Gemini API Key (Obține de la https://makersuite.google.com/app/apikey)
GEMINI_API_KEY=your_gemini_api_key_here

# OpenAI API Key (Opțional - pentru fallback)
OPENAI_API_KEY=
```

## 📝 Pași:

1. Deschide `.env` în editor
2. Schimbă `AI_PROVIDER=openai` la `AI_PROVIDER=gemini`
3. Adaugă `GEMINI_API_KEY` (obține de la Google AI Studio)
4. Salvează fișierul

## ⚠️ Notă despre Gemini API:

Gemini API nu este disponibil în Moldova. Opțiuni:
- Folosește VPN cu server în țară disponibilă (ex: România)
- Sau așteaptă până devine disponibil
- Sau folosește OpenAI când adaugi credit

