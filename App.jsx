import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection, query, addDoc, deleteDoc } from 'firebase/firestore';
import { Plus, Trash2, AlertTriangle, Loader, Zap, Hourglass, MessageSquare, CheckCircle, Tag } from 'lucide-react';

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
const APP_IDENTIFIER = "adrian-simple-crm"; 
// =========================================================================

// Etapele (coloanele) Kanban
const KANBAN_STAGES = [
  { id: 'new', name: '1. Nou', color: 'border-red-500 bg-red-800/20 text-red-300', icon: AlertTriangle },
  { id: 'in_progress', name: '2. În Curs', color: 'border-indigo-500 bg-indigo-800/20 text-indigo-300', icon: Hourglass },
  { id: 'follow_up', name: '3. Follow-up', color: 'border-yellow-500 bg-yellow-800/20 text-yellow-300', icon: MessageSquare },
  { id: 'closed', name: '4. Închis/Câștigat', color: 'border-green-500 bg-green-800/20 text-green-300', icon: CheckCircle },
];

// Priorități pentru Deal-uri/Sarcini
const PRIORITIES = {
    low: { name: 'Scăzută', color: 'text-gray-500' },
    medium: { name: 'Medie', color: 'text-indigo-400' },
    high: { name: 'URGENTĂ', color: 'text-red-500' },
};

export default function App() {
  const [db, setDb] = useState(null);
  const [userId, setUserId] = useState(null);
  const [deals, setDeals] = useState([]); // Lista de deal-uri/sarcini
  const [newDealTitle, setNewDealTitle] = useState('');
  const [newDealPriority, setNewDealPriority] = useState('medium');
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uiError, setUiError] = useState(null);

  // Inițializarea Firebase și Autentificarea Anonimă
  useEffect(() => {
    // Verifică placeholder-urile
    if (!FIREBASE_CONFIG.projectId || FIREBASE_CONFIG.apiKey.includes('...')) {
        setError("!!! EROARE CRITICĂ: Vă rugăm să înlocuiți cheile din FIREBASE_CONFIG în cod cu cele reale de la Firebase. !!!");
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
          const userCredential = await signInAnonymously(authInstance);
          setUserId(userCredential.user.uid);
        } catch (e) {
          console.error("Eroare la autentificare:", e);
          setError("Eroare la autentificarea bazei de date. Verificați setările de Firebase Auth (Anonim).");
        }
        
        setIsAuthReady(true);
        setLoading(false);
      };
      
      authenticate();

    } catch (e) {
      console.error("Eroare la inițializarea Firebase:", e);
      setError("Eroare critică la inițializarea bazei de date. Verifică cheile de configurare.");
      setLoading(false);
    }
  }, []);

  // Ascultarea în timp real a Deal-urilor/Sarcinilor
  useEffect(() => {
    if (!isAuthReady || !db || !userId) return;

    if (deals.length === 0) setLoading(true); 
    setError(null);

    const appId = APP_IDENTIFIER;
    // Calea colecției: /artifacts/{appId}/users/{userId}/deals
    const dealsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/deals`);
    
    // Ascultă schimbările în colecție
    const unsubscribe = onSnapshot(dealsCollectionRef, (snapshot) => {
      const fetchedDeals = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sortare locală: după prioritate (High -> Medium -> Low)
      const sortedDeals = fetchedDeals.sort((a, b) => {
          const priorityOrder = { high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

      setDeals(sortedDeals);
      setLoading(false);
    }, (e) => {
        console.error("Eroare onSnapshot (permisiuni):", e);
        setError("Eroare Permisiuni Firestore. Asigură-te că Regulile de Securitate permit accesul.");
        setLoading(false);
    });

    return () => unsubscribe(); 
  }, [isAuthReady, db, userId]); 

  // Gruparea deal-urilor pe etape (coloane)
  const dealsByStage = useMemo(() => {
    const groups = {};
    KANBAN_STAGES.forEach(stage => {
      groups[stage.id] = deals.filter(deal => deal.status === stage.id);
    });
    return groups;
  }, [deals]);

  // Adăugarea unui nou Deal/Sarcină
  const addDeal = async (e) => {
    e.preventDefault();
    if (!db || !userId || newDealTitle.trim() === '' || loading) return;

    if (newDealTitle.trim().length > 150) {
        setUiError("Titlul este prea lung (max 150 caractere).");
        return;
    }
    setUiError(null);

    const appId = APP_IDENTIFIER;
    const dealsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/deals`);
    
    try {
        setLoading(true);
        await addDoc(dealsCollectionRef, {
            title: newDealTitle.trim(),
            status: 'new', // Începe mereu în prima etapă
            priority: newDealPriority,
            createdAt: new Date().toISOString(),
        });
        setNewDealTitle(''); // Golește câmpul de intrare
        setNewDealPriority('medium');
    } catch (e) {
        console.error("Eroare la adăugarea deal-ului:", e);
        setError("Eroare la salvare. Verifică Regulile de Securitate Firebase!");
        setLoading(false);
    }
  };

  // Mutarea unui Deal/Sarcină în altă etapă
  const updateDealStatus = async (dealId, newStatus) => {
    if (!db || !userId || loading) return;

    const appId = APP_IDENTIFIER;
    const dealDocRef = doc(db, `artifacts/${appId}/users/${userId}/deals`, dealId);
    
    try {
        setLoading(true);
        await setDoc(dealDocRef, {
            status: newStatus,
            updatedAt: new Date().toISOString(),
        }, { merge: true });
    } catch (e) {
        console.error("Eroare la actualizare:", e);
        setError("Eroare la mutarea deal-ului. Verifică Regulile de Securitate!");
        setLoading(false);
    }
  };
  
  // Ștergerea unui Deal/Sarcină
  const deleteDeal = async (dealId) => {
    if (!db || !userId || loading) return;

    const appId = APP_IDENTIFIER;
    const dealDocRef = doc(db, `artifacts/${appId}/users/${userId}/deals`, dealId);
    
    try {
        setLoading(true);
        await deleteDoc(dealDocRef);
    } catch (e) {
        console.error("Eroare la ștergere:", e);
        setError("Eroare la ștergerea deal-ului. Verifică Regulile de Securitate!");
        setLoading(false);
    }
  };

  // Componentă Deal Card
  const DealCard = ({ deal }) => {
    const priority = PRIORITIES[deal.priority] || PRIORITIES.medium;

    return (
      <div className="bg-gray-700 p-4 rounded-xl shadow-lg border border-gray-600/50 flex flex-col space-y-3">
        <div className="flex justify-between items-start">
            <p className={`font-semibold text-lg break-words ${deal.status === 'closed' ? 'line-through text-gray-400' : 'text-white'}`}>
                {deal.title}
            </p>
            <button
                onClick={() => deleteDeal(deal.id)}
                className="p-1 text-gray-500 hover:text-red-500 transition transform hover:scale-110 ml-2 flex-shrink-0"
                disabled={loading}
                title="Șterge"
            >
                <Trash2 size={18} />
            </button>
        </div>

        <div className="flex items-center text-sm">
            <Tag size={14} className={`mr-2 ${priority.color}`} />
            <span className={`font-medium ${priority.color}`}>
                Prioritate: {priority.name}
            </span>
        </div>

        {/* Selector de Status (pentru mobil/rapid) */}
        <select
            value={deal.status}
            onChange={(e) => updateDealStatus(deal.id, e.target.value)}
            className="w-full p-2 text-sm bg-gray-600 border border-gray-500 rounded-lg text-white appearance-none cursor-pointer focus:ring-indigo-500 focus:border-indigo-500"
            disabled={loading}
        >
            {KANBAN_STAGES.map(stage => (
                <option key={stage.id} value={stage.id}>
                    Mută în: {stage.name}
                </option>
            ))}
        </select>
      </div>
    );
  };

  // Interfața de Utilizator (UI)
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center p-4 font-sans">
      <div className="w-full max-w-7xl">
        <header className="bg-gray-800 rounded-2xl shadow-2xl p-6 mb-6">
            <h1 className="text-4xl font-extrabold text-white mb-2 text-center">
              <Zap className="inline-block mr-2 text-indigo-400" size={32} />
              Simple CRM Board (Adrian)
            </h1>
            <p className="text-sm text-gray-400 text-center mb-4">
              Organizează deal-urile/sarcinile pe etape (Kanban).
            </p>

            {/* Mesaje de eroare / încărcare */}
            {(error || uiError) && (
              <div className="bg-red-900/50 text-red-300 p-3 rounded-xl mb-4 border border-red-700 text-sm flex items-start gap-2">
                <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
                <span className='font-medium'>{error || uiError}</span>
              </div>
            )}
            
            {/* Formular de adăugare Deal/Sarcină */}
            <form onSubmit={addDeal} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newDealTitle}
                onChange={(e) => setNewDealTitle(e.target.value)}
                placeholder="Numele Clientului/Titlul Deal-ului..."
                className="flex-grow p-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                disabled={loading || error}
                required
              />
              <select
                value={newDealPriority}
                onChange={(e) => setNewDealPriority(e.target.value)}
                className="p-3 bg-gray-700 border border-gray-600 rounded-xl text-white appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition w-full sm:w-40"
                disabled={loading || error}
              >
                  <option value="high" className="bg-gray-700 text-red-500">URGENTĂ</option>
                  <option value="medium" className="bg-gray-700 text-indigo-400">Medie</option>
                  <option value="low" className="bg-gray-700 text-gray-500">Scăzută</option>
              </select>
              <button
                type="submit"
                className="p-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white font-semibold transition shadow-lg shadow-indigo-600/30 disabled:opacity-50 flex items-center justify-center sm:w-28"
                disabled={loading || error || newDealTitle.trim() === ''}
              >
                {loading && !error ? <Loader size={20} className="animate-spin" /> : <><Plus size={20} className="mr-1"/> Adaugă</>}
              </button>
            </form>
        </header>

        {/* Ecran de încărcare inițial */}
        {(loading && deals.length === 0 && !error) && (
            <div className="text-center text-indigo-400 py-16 flex flex-col items-center justify-center gap-4">
                <Loader size={40} className="animate-spin" />
                <p className="font-medium text-xl">Se încarcă board-ul...</p>
            </div>
        )}

        {/* Board-ul Kanban (Afișat după încărcare sau dacă există erori) */}
        {(!loading || deals.length > 0 || error) && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {KANBAN_STAGES.map(stage => (
                    <div 
                        key={stage.id} 
                        className={`p-4 rounded-xl shadow-xl border-t-4 ${stage.color} space-y-4 min-h-[200px]`}
                    >
                        <h2 className="text-xl font-bold flex items-center gap-2 mb-3">
                            <stage.icon size={20} />
                            {stage.name} ({dealsByStage[stage.id]?.length || 0})
                        </h2>

                        {dealsByStage[stage.id].map(deal => (
                            <DealCard key={deal.id} deal={deal} />
                        ))}
                        
                        {dealsByStage[stage.id].length === 0 && (
                            <p className="text-center text-gray-600 pt-8 pb-4">Niciun deal în această etapă.</p>
                        )}
                    </div>
                ))}
            </div>
        )}

        {/* Informații Utilizator pentru debug */}
        <div className="mt-8 pt-4 border-t border-gray-700 text-center text-xs text-gray-500 w-full max-w-7xl mx-auto">
          <p>ID Utilizator: {userId || 'Se încarcă...'}</p>
          <p>Atenție: Aplicația salvează datele în colecția `/artifacts/{APP_IDENTIFIER}/users/{userId}/deals`.</p>
        </div>
      </div>
    </div>
  );
}
