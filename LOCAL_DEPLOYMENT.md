# 🚀 Deploy Local - Ghid Complet

## 📋 Cerințe
- Node.js instalat (versiunea 18 sau mai nouă)
- npm sau yarn

## 🛠️ Instalare Dependențe

Prima dată, instalează dependențele:
```bash
npm install
```

## 🏃 Rulare în Mod Development

### Opțiunea 1: Folosind script-ul batch (Windows)
Dă dublu-click pe `start-dev.bat` sau rulează în terminal:
```bash
start-dev.bat
```

### Opțiunea 2: Manual
```bash
npm run dev
```

Aplicația va rula la: **http://localhost:5173**

## 🏗️ Build pentru Producție (Local)

### Pasul 1: Construiește aplicația
```bash
npm run build
```

Aceasta va crea un folder `dist/` cu fișierele optimizate.

### Pasul 2: Preview build-ul de producție
```bash
npm run preview
```

Aplicația va rula la: **http://localhost:4173** (sau alt port dacă 4173 e ocupat)

## 📱 Testare în Telegram (Local)

Pentru a testa aplicația în Telegram când rulează local, ai nevoie de:

### Opțiunea 1: ngrok (Recomandat)
1. Instalează ngrok: https://ngrok.com/download
2. Rulează aplicația local: `npm run dev`
3. Într-un alt terminal, rulează:
   ```bash
   ngrok http 5173
   ```
4. Copiază URL-ul HTTPS dat de ngrok (ex: `https://abc123.ngrok.io`)
5. Folosește acest URL în BotFather pentru Web App URL

### Opțiunea 2: LocalTunnel
```bash
npx localtunnel --port 5173
```

## 🔧 Configurare

### Variabile de Mediu (Opțional)
Dacă vrei să folosești variabile de mediu, creează un fișier `.env.local`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

**Notă:** Configurația Supabase este deja setată în `supabase.js`, deci nu e necesar.

## 🐛 Troubleshooting

### Port 5173 este ocupat
Vite va încerca automat alt port. Verifică în terminal ce port a fost ales.

### Eroare "Cannot find module"
Rulează:
```bash
npm install
```

### Aplicația nu se încarcă
1. Verifică că Node.js este instalat: `node --version`
2. Șterge `node_modules` și `package-lock.json`, apoi rulează din nou `npm install`

## 📝 Comenzi Rapide

| Comandă | Descriere |
|---------|-----------|
| `npm run dev` | Rulează în mod development |
| `npm run build` | Construiește pentru producție |
| `npm run preview` | Preview build-ul de producție |

## 🎯 Testare Rapidă

1. Deschide terminalul în folderul proiectului
2. Rulează: `npm run dev`
3. Deschide browserul la: http://localhost:5173
4. Aplicația ar trebui să funcționeze exact ca pe Vercel!

## 💡 Tips

- **Hot Reload:** Modificările în cod se reflectă automat în browser
- **Console Logs:** Deschide Developer Tools (F12) pentru a vedea log-urile
- **Network:** Verifică tab-ul Network pentru a vedea request-urile către Supabase


