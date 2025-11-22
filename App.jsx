import React, { useState, useEffect } from 'react';
import { Zap, HeartHandshake, Minus, Plus } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, increment } from 'firebase/firestore';

// Aceasta este o simulare a datelor despre utilizator, dacă datele reale din Telegram nu sunt disponibile.
const MOCK_USER = {
  first_name: "Adrian",
};

export default function App() {
  const [db, setDb] = useState(null);
  const [userId, setUserId] = useState(null);
  const [videoCount, setVideoCount] = useState(0);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Inițializarea Firebase și Autentificarea
  useEffect(() => {
    try {
      if (typeof __firebase_config === 'undefined' || !__firebase_config) {
        setError("Eroare: Configurația Firebase lipsește. Aplicația nu poate salva datele.");
        setLoading(false);
        return;
      }
      
      const firebaseConfig = JSON.parse(__firebase_config);
      const app = initializeApp(firebaseConfig);
      const firestore = getFirestore(app);
      const authInstance = getAuth(app);

      setDb(firestore);

      // Funcție de autentificare
      const authenticate = async () => {
        try {
          if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(authInstance, __initial_auth_token);
          } else {
            await signInAnonymously(authInstance);
          }
        } catch (e) {
          console.error("Eroare la autentificare (se încearcă anonim):", e);
          await signInAnonymously(authInstance); // Fallback
        }
        
        // Setează ID-ul utilizatorului autentificat sau un ID aleatoriu
        setUserId(authInstance.currentUser?.uid || crypto.randomUUID());
        setIsAuthReady(true);
      };
      
      authenticate();

    } catch (e) {
      console.error("Eroare la inițializarea Firebase:", e);
      setError("Eroare critică la inițializarea bazei de date.");
      setLoading(false);
    }
  }, []);

  // 2. Ascultarea în timp real a Contorului din Baza de Date
  useEffect(() => {
    // Așteaptă până când autentificarea și baza de date sunt gata
    if (!isAuthReady || !db) return;

    setLoading(true);
    setError(null);

    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    // Calea publică (shared) pentru a vedea toți același contor
    const docRef = doc(db, `artifacts/${appId}/public/data/video_tracker`, 'jd_vance_count');

    // Ascultă modificările documentului în timp real (onSnapshot)
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setVideoCount(data.count || 0);
      } else {
        // Dacă nu există, îl creăm cu valoarea 0
        setDoc(docRef, { count: 0, last_updated_by: 'system', timestamp: new Date().toISOString() });
        setVideoCount(0);
      }
      setLoading(false);
    }, (e) => {
        console.error("Eroare onSnapshot:", e);
        setError("Eroare la citirea datelor. Verifică conexiunea.");
        setLoading(false);
    });

    // Curățarea ascultătorului la dezmontarea componentei
    return () => unsubscribe();
  }, [isAuthReady, db]);

  // 3. Funcția de Incrementare
  const incrementCount = async () => {
    if (!db || !userId) {
      setError("Aplicația nu este conectată la baza de date.");
      return;
    }
    
    // Asigură-te că nu se incrementează în timpul încărcării
    if (loading) return;
    
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const docRef = doc(db, `artifacts/${appId}/public/data/video_tracker`, 'jd_vance_count');
    
    try {
        setLoading(true);
        await setDoc(docRef, {
            // Folosim increment(1) pentru a adăuga atomic o unitate
            count: increment(1),
            last_updated_by: MOCK_USER.first_name || 'Anonim', 
            last_updated_id: userId,
            timestamp: new Date().toISOString()
        }, { merge: true }); // merge: true păstrează celelalte câmpuri
        setLoading(false);
    } catch (e) {
        console.error("Eroare la incrementare:", e);
        setError("Eroare la înregistrare. Încearcă din nou.");
        setLoading(false);
    }
  };

  // 4. Interfața de Utilizator (UI)
  const CounterUI = () => (
    <div className="flex flex-col items-center h-full w-full pt-16 px-4">
      <h1 className="text-3xl font-black text-gray-900 mb-2 text-center">Contor Video "JD Vance"</h1>
      <p className="text-gray-500 text-sm mb-12 text-center">
        Înregistrează manual video-urile trimise lui Artiom pe Telegram.
      </p>

      {/* Mesaj de eroare/încărcare */}
      {error && (
        <div className="text-red-700 bg-red-100 p-3 rounded-xl border border-red-300 mb-8 w-full max-w-sm text-center font-medium">
          {error}
        </div>
      )}

      {/* Contorul */}
      <div className="text-center mb-16">
        <div className="text-gray-500 text-sm uppercase tracking-wider mb-4 font-semibold">Total Video-uri Înregistrate</div>
        <div className={`text-8xl font-black text-gray-900 transition-all duration-300 ${loading ? 'opacity-50 blur-sm' : 'opacity-100'}`}>
          {videoCount.toLocaleString()}
        </div>
      </div>

      {/* Butonul de Incrementare */}
      <button 
        onClick={incrementCount}
        disabled={loading || error}
        className="w-full max-w-sm p-4 text-white font-bold text-lg rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/50 hover:from-blue-600 hover:to-indigo-700 transition transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
      >
        {loading ? (
            <>
                <Zap size={20} className="animate-spin" /> Se înregistrează...
            </>
        ) : (
            <>
                <Plus size={24} strokeWidth={3} /> Adaugă +1 Video
            </>
        )}
      </button>

      {/* Informații Utilizator */}
      <div className="mt-8 text-center text-xs text-gray-400">
        <p>Aplicație ID: {userId || 'Se încarcă...'}</p>
        <p>Datele sunt salvate în timp real (Cloud Firestore).</p>
      </div>
    </div>
  );

  // Ecran de încărcare inițial
  if (loading && !isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-blue-600 flex flex-col items-center">
          <Zap size={32} className="animate-spin mb-4" />
          <p className="font-medium">Se inițializează conexiunea...</p>
        </div>
      </div>
    );
  }

  // Randare finală
  return (
    <div className="bg-white min-h-screen font-sans select-none text-gray-800">
      <CounterUI />
    </div>
  );
}