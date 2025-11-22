import React, { useState, useEffect } from 'react';
import { Zap, AlertTriangle, Music, Plus, RefreshCw } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, increment } from 'firebase/firestore';

// =========================================================================
// !!! CONFIGURATIA FIREBASE !!!
// ATENȚIE: înlocuiește valorile cu cheile tale reale de la Firebase!
// =========================================================================
const firebaseConfig = {
  apiKey: "AIzaSyBjgakAvC8G1SiwxkaoJCKkd7d-sRgQzeY",
  authDomain: "origin-app-489a4.firebaseapp.com",
  projectId: "origin-app-489a4",
  storageBucket: "origin-app-489a4.firebasestorage.app",
  messagingSenderId: "669338657246",
  appId: "1:669338657246:web:92294f676e15858c787d4f",
  measurementId: "G-F39KQR71L7"
};

// ID unic pentru a identifica aplicația în baza de date
const APP_IDENTIFIER = "artiom-plot-song-tracker"; 
// URL-ul imaginii tale. Am folosit un placeholder.
// Ar trebui să încarci imaginea 'Artiom_1.jpg' pe un serviciu (ex: Imgur, Google Photos)
// și să pui URL-ul public aici.
const BACKGROUND_IMAGE_URL = "https://placehold.co/1080x1920/1a1a2e/ffffff?text=ARTIOM%20+%20PLOT%20(HOST%20IMAGE)";
// =========================================================================

const MOCK_USER = {
  first_name: "Adrian", // Numele tău
};

// Functie pentru a obtine data curenta ca string YYYY-MM-DD
const getTodayDate = () => new Date().toISOString().split('T')[0];

export default function App() {
  const [db, setDb] = useState(null);
  const [userId, setUserId] = useState(null);
  const [songCount, setSongCount] = useState(0);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(getTodayDate());

  // 1. Inițializarea Firebase și Autentificarea Anonimă
  useEffect(() => {
    // Verifică dacă cheile sunt reale
    if (!FIREBASE_CONFIG.projectId || FIREBASE_CONFIG.apiKey.includes('...')) {
        setError("Eroare Critică: Vă rugăm să înlocuiți cheile din FIREBASE_CONFIG în cod cu cele reale de la Firebase!");
        setLoading(false);
        return;
    }
    
    try {
      const app = initializeApp(FIREBASE_CONFIG);
      const firestore = getFirestore(app);
      const authInstance = getAuth(app);

      setDb(firestore);

      const authenticate = async () => {
        try {
          await signInAnonymously(authInstance);
        } catch (e) {
          console.error("Eroare la autentificare:", e);
          setError("Eroare la autentificarea bazei de date. Verificați setările de Firebase Auth (Anonim).");
        }
        
        setUserId(authInstance.currentUser?.uid || crypto.randomUUID());
        setIsAuthReady(true);
      };
      
      authenticate();

    } catch (e) {
      console.error("Eroare la inițializarea Firebase:", e);
      setError("Eroare critică la inițializarea bazei de date. Verifică cheile de configurare.");
      setLoading(false);
    }
  }, []);

  // 2. Ascultarea în timp real a Contorului (cu resetare zilnică)
  useEffect(() => {
    if (!isAuthReady || !db) return;

    setLoading(true);
    setError(null);
    setCurrentDate(getTodayDate());

    const appId = APP_IDENTIFIER;
    // Calea include data curentă (YYYY-MM-DD) ca ID de document.
    // Aceasta asigură că se folosește un document nou în fiecare zi.
    const docRef = doc(db, `artifacts/${appId}/public/data/song_tracker`, currentDate);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Verificăm dacă documentul este cu data de azi (deși ID-ul deja asigură asta)
        if (data.date === currentDate) {
            setSongCount(data.count || 0);
        } else {
            // Dacă din motive excepționale data din document nu corespunde, resetăm.
            setSongCount(0);
            setDoc(docRef, { count: 0, date: currentDate, last_updated_by: 'system', timestamp: new Date().toISOString() });
        }
      } else {
        // Dacă nu există documentul pentru ziua curentă, îl creăm cu 0.
        setDoc(docRef, { count: 0, date: currentDate, last_updated_by: 'system', timestamp: new Date().toISOString() });
        setSongCount(0);
      }
      setLoading(false);
    }, (e) => {
        console.error("Eroare onSnapshot (permisiuni):", e);
        setError("Eroare Permisiuni Firestore. Asigură-te că Regulile de Securitate permit accesul (allow read, write: if request.auth != null;)");
        setLoading(false);
    });

    return () => unsubscribe(); 
  }, [isAuthReady, db, currentDate]); // Dependența pe currentDate este importantă

  // 3. Funcția de Incrementare
  const incrementCount = async () => {
    if (!db || !userId || error || loading) return;
    
    const appId = APP_IDENTIFIER;
    const docRef = doc(db, `artifacts/${appId}/public/data/song_tracker`, currentDate);
    
    try {
        setLoading(true);
        // Creștem contorul și actualizăm data
        await setDoc(docRef, {
            count: increment(1),
            date: currentDate, // Asigură că data e mereu salvată
            last_updated_by: MOCK_USER.first_name || 'Anonim', 
            last_updated_id: userId,
            timestamp: new Date().toISOString()
        }, { merge: true });
        setLoading(false);
    } catch (e) {
        console.error("Eroare la incrementare:", e);
        setError("Eroare la înregistrare. Verifică Regulile de Securitate Firebase!");
        setLoading(false);
    }
  };

  // 4. Interfața de Utilizator (UI)
  const CounterUI = () => (
    <div className="flex flex-col items-center h-full w-full pt-12 px-4 text-white relative z-10">
      <div className="text-center mb-8 bg-black/50 p-4 rounded-xl backdrop-blur-sm shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-black mb-1">Contor Cântec: Плот</h1>
        <p className="text-sm font-light text-gray-300">
          Iurii Loza (Înregistrează de câte ori pornește Artiom pe zi)
        </p>
      </div>

      {/* Mesaj de eroare/încărcare */}
      {error && (
        <div className="text-red-700 bg-red-100 p-3 rounded-xl border border-red-300 mb-8 w-full max-w-sm text-center font-medium flex items-start gap-2 z-20">
          <AlertTriangle size={20} className="mt-0.5 flex-shrink-0" />
          <span className="text-left">{error}</span>
        </div>
      )}

      {/* Contorul */}
      <div className="text-center mb-16 bg-black/50 p-6 rounded-3xl backdrop-blur-md shadow-2xl">
        <div className="text-gray-300 text-xs uppercase tracking-widest mb-2 font-semibold flex items-center justify-center gap-1">
            <RefreshCw size={12} /> Azi ({currentDate})
        </div>
        <div className={`text-9xl font-extrabold transition-all duration-300 ${loading && !error ? 'opacity-50 blur-sm' : 'opacity-100'}`}>
          {songCount.toLocaleString()}
        </div>
        <div className="text-gray-300 text-sm mt-2">de start-uri pe ziua de azi</div>
      </div>

      {/* Butonul de Incrementare */}
      <button 
        onClick={incrementCount}
        disabled={loading || error}
        className="w-full max-w-sm p-4 text-white font-bold text-lg rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 shadow-xl shadow-green-500/50 hover:from-green-600 hover:to-emerald-700 transition transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 z-20"
      >
        {loading && !error ? (
            <>
                <Music size={20} className="animate-spin" /> Se înregistrează...
            </>
        ) : (
            <>
                <Plus size={24} strokeWidth={3} /> Lansați Плот!
            </>
        )}
      </button>

      {/* Informații Utilizator */}
      <div className="mt-8 text-center text-xs text-gray-400 z-20">
        <p>ID Sesiune: {userId || 'Se încarcă...'}</p>
        <p>ID Bază: {APP_IDENTIFIER}</p>
      </div>
    </div>
  );

  // Ecran de încărcare inițial
  if (loading && !isAuthReady && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-emerald-500 flex flex-col items-center">
          <Music size={32} className="animate-spin mb-4" />
          <p className="font-medium">Se inițializează contorul zilnic...</p>
        </div>
      </div>
    );
  }

  // Randare finală
  return (
    <div 
        className="min-h-screen font-sans select-none text-gray-800"
        style={{
            backgroundImage: `url('${BACKGROUND_IMAGE_URL}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingBottom: '2rem'
        }}
    >
      {/* Overlay pentru vizibilitate sporită a textului */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0"></div>
      <CounterUI />
    </div>
  );
}


