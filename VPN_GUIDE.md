# 🔒 VPN Guide pentru Gemini API

## ⚠️ Avertisment Important

Folosirea VPN-ului pentru a ocoli restricțiile regionale poate încălca termenii de serviciu Google. Folosește la propriul risc.

## 🌍 Țări Recomandate pentru Server VPN

Gemini API este disponibil în:
- ✅ România
- ✅ Germania
- ✅ Franța
- ✅ UK
- ✅ Polonia
- ✅ Țările din UE

**Recomandare**: Folosește un server din **România** (cel mai apropiat și rapid).

## 🏆 VPN-uri Recomandate

### 1. **ProtonVPN** (Recomandat) ⭐

**De ce:**
- ✅ Plan gratuit disponibil
- ✅ Servere în România
- ✅ Foarte rapid
- ✅ Fără log-uri
- ✅ Ușor de folosit

**Setup:**
1. Descarcă de la: https://protonvpn.com/download
2. Creează cont gratuit
3. Conectează-te la server din România
4. Obține API key de la Google AI Studio

**Plan Gratuit:**
- 1 dispozitiv simultan
- Servere în 3 țări (inclusiv România)
- Viteză limitată (dar suficientă pentru API)

### 2. **Windscribe** (Alternativă Gratuită)

**De ce:**
- ✅ Plan gratuit: 10GB/lună
- ✅ Servere în România
- ✅ Ușor de folosit

**Setup:**
1. Descarcă de la: https://windscribe.com/download
2. Creează cont (10GB gratuit)
3. Conectează-te la România
4. Obține API key

### 3. **Cloudflare WARP** (Cel Mai Simplu)

**De ce:**
- ✅ Complet gratuit
- ✅ Foarte rapid
- ✅ Ușor de instalat
- ⚠️ Nu poți alege țara exactă (dar funcționează)

**Setup:**
1. Descarcă de la: https://1.1.1.1/
2. Instalează și activează
3. Testează dacă funcționează cu Gemini API

### 4. **NordVPN** (Dacă vrei Premium)

**De ce:**
- ✅ Foarte rapid
- ✅ Servere în România
- ✅ Foarte sigur
- ❌ Necesită abonament (dar are trial)

## 📋 Pași pentru Setup

### Pasul 1: Instalează VPN

1. Alege un VPN de mai sus
2. Descarcă și instalează
3. Creează cont (dacă e necesar)

### Pasul 2: Conectează-te la Server

1. Deschide aplicația VPN
2. Alege un server din **România** (sau altă țară disponibilă)
3. Conectează-te

### Pasul 3: Verifică IP-ul

1. Mergi la: https://whatismyipaddress.com/
2. Verifică că IP-ul este din România (sau țara aleasă)

### Pasul 4: Obține Gemini API Key

1. **Cu VPN activat**, mergi la: https://makersuite.google.com/app/apikey
2. Loghează-te cu contul Google
3. Click "Create API Key"
4. Copiază cheia API

### Pasul 5: Configurează Bot-ul

1. Actualizează `.env`:
   ```env
   AI_PROVIDER=gemini
   GEMINI_API_KEY=your_api_key_here
   ```

2. Restart bot-ul:
   ```bash
   npm run bot
   ```

## ⚠️ Important

### După ce obții API Key:

**Nu mai ai nevoie de VPN pentru bot!**

- API key-ul funcționează indiferent de locație
- Botul rulează pe server (nu pe computerul tău)
- Doar pentru **obținerea** API key-ului ai nevoie de VPN

### Dacă API key-ul nu funcționează:

1. Verifică că l-ai obținut cu VPN activat
2. Verifică că VPN-ul era din țară disponibilă
3. Încearcă să obții un API key nou cu VPN activat

## 🆘 Troubleshooting

### "API key not valid"
- Obține un API key nou cu VPN activat
- Verifică că VPN-ul era conectat când ai creat cheia

### "Region not available"
- Schimbă serverul VPN la altă țară disponibilă
- Verifică lista de țări disponibile: https://ai.google.dev/gemini-api/docs/available-regions

### VPN-ul este lent
- Schimbă serverul (încearcă altul din România)
- Sau folosește un VPN premium (NordVPN, ExpressVPN)

## 💡 Recomandare Finală

**Pentru început:**
1. Folosește **ProtonVPN** (gratuit, ușor)
2. Conectează-te la România
3. Obține API key
4. Configurează bot-ul
5. **Nu mai ai nevoie de VPN după ce ai API key!**

---

**Notă**: API key-ul funcționează permanent, chiar dacă nu mai folosești VPN. Doar pentru **obținerea** cheii ai nevoie de VPN.

