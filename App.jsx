import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection, query, orderBy, addDoc, deleteDoc } from 'firebase/firestore';
import { Plus, Trash2, CheckCircle, Circle, AlertTriangle, Loader, Zap } from 'lucide-react';

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
const APP_IDENTIFIER = "adrian-task-manager"; 
// =========================================================================

export default function App() {
  const [db, setDb] = useState(null);
  const [userId, setUserId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Stare pentru a gestiona mesajele de eroare din UI
  const [uiError, setUiError] = useState(null);

  // 1. Inițializarea Firebase și Autentificarea Anonimă
  useEffect(() => {
    // Verifică placeholder-urile
    if (!FIREBASE_CONFIG.projectId || FIREBASE_CONFIG.apiKey.includes('...')) {
        // Dacă cheile nu sunt reale, afișăm o eroare clară
        setError("!!! EROARE CRITICĂ: Vă rugăm să înlocuiți cheile din FIREBASE_CONFIG în cod cu cele reale de la Firebase pentru a permite încărcarea bazei de date. !!!");
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
          // Autentificare anonimă
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

  // 2. Ascultarea în timp real a Sarcinii (Tasks)
  useEffect(() => {
    // Așteaptă până când autentificarea și baza de date sunt gata
    if (!isAuthReady || !db || !userId) return;

    // Setează loading doar dacă nu este deja setat de la o operație anterioară
    // Păstrăm loading-ul setat de la autentificare pentru a nu clipi
    if (tasks.length === 0) setLoading(true); 
    setError(null);

    const appId = APP_IDENTIFIER;
    // Calea colecției: /artifacts/{appId}/users/{userId}/tasks
    const tasksCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/tasks`);
    
    // ATENȚIE: Nu folosim orderBy() pentru a evita erorile de indexare.
    // Vom sorta datele direct în React.

    const unsubscribe = onSnapshot(tasksCollectionRef, (snapshot) => {
      const fetchedTasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sortare locală: sarcini nefinalizate primele (false), apoi cele finalizate (true).
      const sortedTasks = fetchedTasks.sort((a, b) => {
          if (a.completed === b.completed) return 0;
          return a.completed ? 1 : -1;
      });

      setTasks(sortedTasks);
      setLoading(false);
    }, (e) => {
        console.error("Eroare onSnapshot (permisiuni):", e);
        setError("Eroare Permisiuni Firestore. Asigură-te că Regulile de Securitate permit accesul.");
        setLoading(false);
    });

    return () => unsubscribe(); 
  }, [isAuthReady, db, userId]); 

  // 3. Adăugarea unei sarcini noi
  const addTask = async (e) => {
    e.preventDefault();
    if (!db || !userId || newTask.trim() === '' || loading) return;

    if (newTask.trim().length > 100) {
        setUiError("Sarcina este prea lungă (max 100 caractere).");
        return;
    }
    setUiError(null);

    const appId = APP_IDENTIFIER;
    const tasksCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/tasks`);
    
    try {
        setLoading(true);
        await addDoc(tasksCollectionRef, {
            text: newTask.trim(),
            completed: false,
            createdAt: new Date().toISOString(),
        });
        setNewTask(''); // Golește câmpul de intrare
        // Nu setăm setLoading(false) aici, deoarece onSnapshot va reîncărca automat datele
    } catch (e) {
        console.error("Eroare la adăugarea sarcinii:", e);
        setError("Eroare la salvarea sarcinii. Verifică Regulile de Securitate Firebase!");
        setLoading(false);
    }
  };

  // 4. Marcarea sarcinii ca finalizată/nefinalizată
  const toggleTaskCompletion = async (taskId, currentStatus) => {
    if (!db || !userId || loading) return;

    const appId = APP_IDENTIFIER;
    const taskDocRef = doc(db, `artifacts/${appId}/users/${userId}/tasks`, taskId);
    
    try {
        setLoading(true);
        await setDoc(taskDocRef, {
            completed: !currentStatus,
            completedAt: !currentStatus ? new Date().toISOString() : null,
        }, { merge: true });
        // Nu setăm setLoading(false) aici, onSnapshot face treaba
    } catch (e) {
        console.error("Eroare la actualizare:", e);
        setError("Eroare la actualizarea sarcinii. Verifică Regulile de Securitate!");
        setLoading(false);
    }
  };

  // 5. Ștergerea unei sarcini
  const deleteTask = async (taskId) => {
    if (!db || !userId || loading) return;

    const appId = APP_IDENTIFIER;
    const taskDocRef = doc(db, `artifacts/${appId}/users/${userId}/tasks`, taskId);
    
    try {
        setLoading(true);
        await deleteDoc(taskDocRef);
        // Nu setăm setLoading(false) aici, onSnapshot face treaba
    } catch (e) {
        console.error("Eroare la ștergere:", e);
        setError("Eroare la ștergerea sarcinii. Verifică Regulile de Securitate!");
        setLoading(false);
    }
  };


  // Interfața de Utilizator (UI)
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg bg-gray-800 rounded-2xl shadow-2xl p-6 relative">
        <h1 className="text-3xl font-extrabold text-white mb-2 text-center">
          <Zap className="inline-block mr-2 text-indigo-400" size={28} />
          Task Manager (Adrian)
        </h1>
        <p className="text-sm text-gray-400 mb-6 text-center">
          Datele sunt salvate în baza ta de date Firebase.
        </p>

        {/* Mesaje de eroare / încărcare */}
        {(error || uiError) && (
          <div className="bg-red-900/50 text-red-300 p-3 rounded-xl mb-4 border border-red-700 text-sm flex items-start gap-2">
            <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
            <span className='font-medium'>{error || uiError}</span>
          </div>
        )}
        
        {/* Ecran de încărcare inițial */}
        {(loading && tasks.length === 0 && !error) && (
            <div className="text-center text-indigo-400 py-16 flex flex-col items-center justify-center gap-4">
                <Loader size={32} className="animate-spin" />
                <p className="font-medium text-lg">Se încarcă sarcinile...</p>
            </div>
        )}
        
        {/* Formular de adăugare sarcină - Afișat doar după încărcare sau dacă există erori */}
        {(!loading || tasks.length > 0 || error) && (
            <form onSubmit={addTask} className="flex gap-2 mb-6">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Adaugă o sarcină nouă..."
                className="flex-grow p-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                disabled={loading || error}
                required
              />
              <button
                type="submit"
                className="p-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white font-semibold transition shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                disabled={loading || error || newTask.trim() === ''}
              >
                {loading && !error ? <Loader size={20} className="animate-spin" /> : <Plus size={20} />}
              </button>
            </form>
        )}

        {/* Lista de Sarcini */}
        {(!loading || tasks.length > 0 || error) && (
            <div className="space-y-3">
              {tasks.length === 0 && !loading && !error && (
                <p className="text-center text-gray-500 py-8">Nu ai sarcini adăugate încă. Foarte bine!</p>
              )}

              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center p-4 rounded-xl shadow-md transition duration-200 ${
                    task.completed ? 'bg-gray-700/50 line-through text-gray-500' : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  {/* Buton de finalizare */}
                  <button
                    onClick={() => toggleTaskCompletion(task.id, task.completed)}
                    className="p-1.5 mr-3 flex-shrink-0 transition transform hover:scale-110"
                    disabled={loading}
                  >
                    {task.completed ? (
                      <CheckCircle size={24} className="text-green-500" />
                    ) : (
                      <Circle size={24} className="text-indigo-400 hover:text-indigo-300" />
                    )}
                  </button>
                  
                  {/* Textul sarcinii */}
                  <span className="flex-grow text-sm sm:text-base break-words">
                    {task.text}
                  </span>

                  {/* Buton de ștergere */}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 ml-3 flex-shrink-0 text-gray-500 hover:text-red-500 transition transform hover:scale-110"
                    disabled={loading}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
              
              {/* Indicator de încărcare în timpul operațiunilor */}
              {loading && !error && tasks.length > 0 && (
                  <div className="text-center text-indigo-400 py-3 flex items-center justify-center gap-2">
                      <Loader size={20} className="animate-spin" />
                      Se actualizează...
                  </div>
              )}
            </div>
        )}
        
        
        {/* Informații Utilizator pentru debug */}
        <div className="mt-8 pt-4 border-t border-gray-700 text-center text-xs text-gray-500">
          <p>ID Utilizator: {userId || 'Se încarcă...'}</p>
        </div>
      </div>
    </div>
  );
}
