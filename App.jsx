import React, { useState, useEffect } from 'react';
import { Zap, AlertTriangle, Plus } from 'lucide-react';
// Importuri necesare pentru Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, increment } from 'firebase/firestore';

// =========================================================================
// !!! PAS ESENȚIAL PENTRU VERCEL !!!
// AICI TREBUIE SĂ PUI CONFIGURAȚIA TA DE LA FIREBASE.
// PUNE CHEILE TALE REALE AICI!
// =========================================================================
const FIREBASE_CONFIG = {
  // ATENȚIE: înlocuiți valorile cu cheile DVS. reale de la Firebase!
  apiKey: "AIzaSyBj...d7d-sRQZeY", 
  authDomain: "origin-app-489a4.firebaseapp.com", 
  projectId: "origin-app-489a4", 
  storageBucket: "origin-app-489a4.firebasestorage.app", 
  messagingSenderId: "669338657246", 
  appId: "1:669338657246:web:92294f676e1585c787d4f" 
};

// Un nume unic pentru a identifica aplicația în baza de date
const APP_IDENTIFIER = "adrian-jd-vance-tracker"; 
// =========================================================================

const MOCK_USER = {
  first_name: "Adrian", // Numele tău
};

export default function App() {
  const [db, setDb] = useState(null);
  const [userId, setUserId] = useState(null);
  const [videoCount, setVideoCount] = useState(0);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Inițializarea Firebase și Autentificarea Anonimă
  useEffect(() => {
    // Verifică dacă user-ul a pus cheile de configurare (pentru a evita erori inutile)
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
          // Autentificare Anonimă
          await signInAnonymously(authInstance);
        } catch (e) {
          console.error("Eroare la autentificare:", e);
          setError("Eroare la autentificarea bazei de date. Verificați setările de Firebase Auth (Anonim).");
        }
        
        // Setează ID-ul utilizatorului autentificat.
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

  // 2. Ascultarea în timp real a Contorului din Baza de Date (onSnapshot)
  useEffect(() => {
    // Așteaptă până când Firebase e inițializat și autentificarea e gata
    if (!isAuthReady || !db) return;

    setLoading(true);
    setError(null); // Șterge eroarea de configurare, dacă exista

    const appId = APP_IDENTIFIER;
    // Calea unde se salvează contorul: public/data/video_tracker/jd_vance_count
    const docRef = doc(db, `artifacts/${appId}/public/data/video_tracker`, 'jd_vance_count');

    // onSnapshot ascultă modificările în timp real
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setVideoCount(data.count || 0);
      } else {
        // Dacă nu există documentul, îl creăm cu valoarea 0
        setDoc(docRef, { count: 0, last_updated_by: 'system', timestamp: new Date().toISOString() });
        setVideoCount(0);
      }
      setLoading(false);
    }, (e) => {
        console.error("Eroare onSnapshot (permisiuni):", e);
        // Eroare tipică de permisiuni Firebase
        setError("Eroare Permisiuni Firestore. Asigură-te că Regulile de Securitate permit accesul (allow read, write: if request.auth != null;)");
        setLoading(false);
    });

    return () => unsubscribe(); // Cleanup la ieșire din componentă
  }, [isAuthReady, db]);

  // 3. Funcția de Incrementare
  const incrementCount = async () => {
    // Verifică starea aplicației
    if (!db || !userId || error) {
      setError(error || "Aplicația nu este conectată la baza de date.");
      return;
    }
    
    if (loading) return;
    
    const appId = APP_IDENTIFIER;
    const docRef = doc(db, `artifacts/${appId}/public/data/video_tracker`, 'jd_vance_count');
    
    try {
        setLoading(true);
        // Folosește increment(1) pentru a crește valoarea atomic
        await setDoc(docRef, {
            count: increment(1),
            last_updated_by: MOCK_USER.first_name || 'Anonim', 
            last_updated_id: userId,
            timestamp: new Date().toISOString()
        }, { merge: true }); // merge: true păstrează câmpurile existente
        setLoading(false);
    } catch (e) {
        console.error("Eroare la incrementare:", e);
        setError("Eroare la înregistrare. Verifică Regulile de Securitate Firebase!");
        setLoading(false);
    }
  };

  // 4. Interfața de Utilizator (UI)
  const CounterUI = () => (
    <div className="flex flex-col items-center h-full w-full pt-16 px-4">
      <h1 className="text-3xl font-black text-gray-900 mb-2 text-center">Contor Video "JD Vance"</h1>
      <p className="text-gray-500 text-sm mb-12 text-center">
        Înregistrează manual video-urile primite de Artiom pe Telegram.
      </p>

      {/* Mesaj de eroare/încărcare */}
      {error && (
        <div className="text-red-700 bg-red-100 p-3 rounded-xl border border-red-300 mb-8 w-full max-w-sm text-center font-medium flex items-start gap-2">
          <AlertTriangle size={20} className="mt-0.5 flex-shrink-0" />
          <span className="text-left">{error}</span>
        </div>
      )}

      {/* Contorul */}
      <div className="text-center mb-16">
        <div className="text-gray-500 text-sm uppercase tracking-wider mb-4 font-semibold">Total Video-uri Înregistrate</div>
        <div className={`text-8xl font-black text-gray-900 transition-all duration-300 ${loading && !error ? 'opacity-50 blur-sm' : 'opacity-100'}`}>
          {videoCount.toLocaleString()}
        </div>
      </div>

      {/* Butonul de Incrementare */}
      <button 
        onClick={incrementCount}
        disabled={loading || error}
        className="w-full max-w-sm p-4 text-white font-bold text-lg rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/50 hover:from-blue-600 hover:to-indigo-700 transition transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
      >
        {loading && !error ? (
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
        <p>ID Utilizator: {userId || 'Se încarcă...'}</p>
        <p>Aplicație ID: {APP_IDENTIFIER}</p>
      </div>
    </div>
  );

  // Ecran de încărcare inițial
  if (loading && !isAuthReady && !error) {
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
