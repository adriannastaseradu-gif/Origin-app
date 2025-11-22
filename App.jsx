import React, { useState, useEffect } from 'react';
import { Home, User, Wallet, Zap, Gift, Users } from 'lucide-react';

// Simulare date utilizator (în realitate acestea vin din Telegram.WebApp.initDataUnsafe)
const MOCK_USER = {
  id: 123456789,
  first_name: "Adrian",
  username: "adrian_dev",
  is_premium: true,
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [coins, setCoins] = useState(12500);
  const [energy, setEnergy] = useState(980);
  const [isMining, setIsMining] = useState(false);

  // Efect la încărcare
  useEffect(() => {
    console.log("Telegram WebApp Ready");
  }, []);

  // Funcție simplă de "Clicker"
  const handleMine = (e) => {
    if (energy > 0) {
      const x = e.clientX;
      const y = e.clientY;
      createFloatingText(x, y);

      setCoins(prev => prev + 5);
      setEnergy(prev => prev - 1);
      setIsMining(true);
      setTimeout(() => setIsMining(false), 100);
    }
  };

  // Funcție helper pentru animație
  const createFloatingText = (x, y) => {
    const el = document.createElement('div');
    el.textContent = '+5';
    el.style.position = 'fixed';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.color = '#2563eb'; // blue-600
    el.style.fontWeight = 'bold';
    el.style.zIndex = '100';
    el.style.pointerEvents = 'none';
    el.style.animation = 'floatUp 1s ease-out forwards';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  };

  // Componenta pentru Tab-ul Acasă
  const HomeTab = () => (
    <div className="flex flex-col items-center h-full w-full pt-8">
      
      {/* Header Utilizator */}
      <div className="flex items-center space-x-2 mb-8 bg-gray-50 px-4 py-2 rounded-full border border-gray-100 shadow-sm">
        <User size={20} className="text-blue-600" />
        <span className="text-gray-800 font-bold">{MOCK_USER.first_name} (CEO)</span>
      </div>

      {/* Balanța Principală */}
      <div className="text-center mb-12">
        <div className="text-gray-500 text-sm uppercase tracking-wider mb-2 font-semibold">Balanță Totală</div>
        <div className="text-5xl font-black text-gray-900 flex items-center justify-center gap-2">
          <img src="https://cdn-icons-png.flaticon.com/512/1277/1277175.png" alt="coin" className="w-10 h-10" />
          {coins.toLocaleString()}
        </div>
      </div>

      {/* Zona de Click (Butonul Principal) */}
      <div className="relative group cursor-pointer" onClick={handleMine}>
        <div className={`w-64 h-64 rounded-full bg-gradient-to-b from-blue-400 to-blue-600 flex items-center justify-center shadow-[0_10px_30px_rgba(37,99,235,0.3)] transition-transform duration-100 ${isMining ? 'scale-95' : 'scale-100 hover:scale-105'}`}>
          <div className="w-56 h-56 rounded-full bg-gradient-to-b from-blue-300 to-blue-500 flex items-center justify-center border-4 border-white/40 shadow-inner">
            <img src="https://cdn-icons-png.flaticon.com/512/616/616490.png" className="w-32 h-32 drop-shadow-xl" alt="Tap me" />
          </div>
        </div>
      </div>

      {/* Bara de Energie */}
      <div className="w-full max-w-xs mt-8">
        <div className="flex justify-between text-sm text-gray-500 mb-1 font-medium">
          <span className="flex items-center gap-1"><Zap size={14} className="text-yellow-500 fill-yellow-500"/> Energie</span>
          <span>{energy} / 1000</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full transition-all duration-300" 
            style={{ width: `${(energy / 1000) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );

  // Componenta pentru Tab-ul Tasks
  const EarnTab = () => (
    <div className="p-4 w-full">
      <h2 className="text-2xl font-black text-gray-900 mb-6 text-center">Câștigă mai mult</h2>
      
      <div className="space-y-3">
        <div className="bg-white p-4 rounded-xl flex items-center justify-between shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Users size={24} /></div>
            <div>
              <h3 className="text-gray-900 font-bold">Invită un prieten</h3>
              <p className="text-gray-500 text-xs font-medium">+5,000 monede</p>
            </div>
          </div>
          <button className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow hover:bg-blue-700 transition">Start</button>
        </div>

        <div className="bg-white p-4 rounded-xl flex items-center justify-between shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-pink-50 p-2 rounded-lg text-pink-500"><Gift size={24} /></div>
            <div>
              <h3 className="text-gray-900 font-bold">Bonus Zilnic</h3>
              <p className="text-gray-500 text-xs font-medium">Revino mâine</p>
            </div>
          </div>
          <button className="bg-gray-100 text-gray-400 px-4 py-1.5 rounded-full text-sm font-bold cursor-not-allowed">Luat</button>
        </div>

        <div className="bg-white p-4 rounded-xl flex items-center justify-between shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-lg text-blue-500"><img src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg" className="w-6 h-6" alt="tg"/></div>
            <div>
              <h3 className="text-gray-900 font-bold">Urmărește canalul</h3>
              <p className="text-gray-500 text-xs font-medium">+1,000 monede</p>
            </div>
          </div>
          <button className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow hover:bg-blue-700 transition">Verifică</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-b from-white via-white via-90% to-blue-200 min-h-screen font-sans select-none pb-24 text-gray-800">
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-50px); opacity: 0; }
        }
      `}</style>
      
      <main className="h-full overflow-y-auto">
        {activeTab === 'home' && <HomeTab />}
        {activeTab === 'earn' && <EarnTab />}
        {activeTab === 'wallet' && (
             <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
                <Wallet size={64} className="mb-4 text-blue-200"/>
                <p className="font-medium text-lg text-gray-500">Portofelul va fi disponibil în curând.</p>
             </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 pb-safe pt-2 px-6 z-50">
        <div className="flex justify-between items-center max-w-md mx-auto h-16">
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'home' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Home size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
            <span className="text-[10px] font-bold">Exchange</span>
          </button>

          <button 
            onClick={() => setActiveTab('earn')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'earn' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Zap size={24} strokeWidth={activeTab === 'earn' ? 2.5 : 2} />
            <span className="text-[10px] font-bold">Sarcini</span>
          </button>

          <button 
            onClick={() => setActiveTab('wallet')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'wallet' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Wallet size={24} strokeWidth={activeTab === 'wallet' ? 2.5 : 2} />
            <span className="text-[10px] font-bold">Airdrop</span>
          </button>
        </div>
        <div className="h-5 w-full"></div> 
      </div>
    </div>
  );
}