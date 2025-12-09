
import React, { useState, useMemo, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Calendar, LayoutDashboard, Settings, ShoppingBag, Bell, ChevronRight, CheckCircle2, User, Power } from 'lucide-react';
import { Medication, AdherenceLog, Consents, UserPreferences } from './types';
import { INITIAL_MEDICATIONS, INITIAL_CONSENTS, INITIAL_PREFERENCES } from './constants';
import Header from './components/Header';
import MedCard from './components/MedCard';
import MedicationVerification from './components/MedicationVerification';
import { generateMedicationImage } from './services/imageService';

// Simple friendly Login screen
const Login: React.FC<{ onLogin: () => void }> = ({ onLogin }) => (
  <div className="fixed inset-0 bg-blue-600 flex flex-col items-center justify-center p-8 z-[100]">
    <div className="bg-white p-12 rounded-[4rem] shadow-2xl flex flex-col items-center max-w-lg w-full text-center space-y-8">
      <div className="bg-blue-100 p-8 rounded-full">
        <User size={100} className="text-blue-600" />
      </div>
      <div>
        <h1 className="text-5xl font-bold text-slate-900 mb-4">Hello Joyce!</h1>
        <p className="text-2xl text-slate-600 font-medium">Ready to manage your health today?</p>
      </div>
      <button 
        onClick={onLogin}
        className="w-full bg-blue-600 text-white text-3xl font-bold py-8 rounded-3xl shadow-xl hover:bg-blue-700 active:scale-95 transition-all"
      >
        Enter MedAssist
      </button>
      <p className="text-slate-400 text-lg">Your data is safe and kept private.</p>
    </div>
  </div>
);

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => localStorage.getItem('medassist_auth') === 'true');
  const [meds, setMeds] = useState<Medication[]>(INITIAL_MEDICATIONS);
  const [logs, setLogs] = useState<AdherenceLog[]>(() => {
    const saved = localStorage.getItem('medassist_logs');
    return saved ? JSON.parse(saved) : [];
  });
  const [consents] = useState<Consents>(INITIAL_CONSENTS);
  const [activeMedication, setActiveMedication] = useState<Medication | null>(null);
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});

  // Persist logs
  useEffect(() => {
    localStorage.setItem('medassist_logs', JSON.stringify(logs));
  }, [logs]);

  // Handle Login
  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('medassist_auth', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('medassist_auth');
  };

  // Generate unique container images for the patient
  useEffect(() => {
    const generateImages = async () => {
      const newImages: Record<string, string> = {};
      for (const med of meds) {
        if (!generatedImages[med.id]) {
          const generated = await generateMedicationImage(med.name, med.containerDescription);
          if (generated) {
            newImages[med.id] = generated;
          }
        }
      }
      if (Object.keys(newImages).length > 0) {
        setGeneratedImages(prev => ({ ...prev, ...newImages }));
      }
    };

    if (isAuthenticated) {
      generateImages();
    }
  }, [meds, isAuthenticated]);

  const handleTakeMed = (id: string) => {
    const med = meds.find(m => m.id === id);
    if (med) {
      setActiveMedication({
        ...med,
        imageUrl: generatedImages[med.id] || med.imageUrl
      });
    }
  };

  const completeTake = (verified: boolean) => {
    if (!activeMedication) return;

    const newLog: AdherenceLog = {
      id: Math.random().toString(36).substr(2, 9),
      medicationId: activeMedication.id,
      timestamp: new Date().toISOString(),
      status: 'taken',
      verified: verified
    };

    setLogs([newLog, ...logs]);
    setActiveMedication(null);
  };

  const refillsNeeded = useMemo(() => {
    const today = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(today.getDate() + 7);

    return meds.filter(med => {
      const refill = new Date(med.refillDate);
      return refill <= sevenDaysLater && refill >= today;
    });
  }, [meds]);

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col pb-28">
        <Header name="Joyce" />
        
        <main className="flex-1 max-w-4xl mx-auto w-full p-4 lg:p-8">
          <Routes>
            <Route path="/" element={
              <div className="space-y-8 animate-in fade-in duration-500">
                {refillsNeeded.length > 0 && (
                  <div className="bg-orange-50 border-2 border-orange-200 p-6 rounded-3xl flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-orange-100 rounded-2xl">
                      <ShoppingBag className="text-orange-600" size={32} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xl font-bold text-orange-900">Refill Alert</p>
                      <p className="text-lg text-orange-800">Your {refillsNeeded[0].name} is due soon.</p>
                    </div>
                    <Link to="/refills" className="bg-orange-600 text-white p-3 rounded-2xl">
                      <ChevronRight size={24} />
                    </Link>
                  </div>
                )}

                <div className="flex justify-between items-center px-2">
                  <h2 className="text-4xl font-extrabold text-slate-900">Daily Tasks</h2>
                  <div className="flex items-center gap-2 bg-green-50 px-5 py-3 rounded-3xl text-green-700 font-bold border-2 border-green-100 text-xl">
                    <CheckCircle2 size={28} />
                    <span>{logs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length} / {meds.length} Done</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {meds.map(med => (
                    <MedCard 
                      key={med.id} 
                      med={{...med, imageUrl: generatedImages[med.id] || med.imageUrl}} 
                      onTake={handleTakeMed} 
                    />
                  ))}
                </div>

                {logs.length > 0 && (
                  <div className="mt-8 bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
                    <h3 className="text-3xl font-bold text-slate-800 mb-6 flex items-center gap-4">
                      <Bell size={32} className="text-blue-500" />
                      Recent Activity
                    </h3>
                    <div className="space-y-4">
                      {logs.slice(0, 3).map(log => {
                        const m = meds.find(m => m.id === log.medicationId);
                        return (
                          <div key={log.id} className="flex justify-between items-center p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold text-slate-900">{m?.name}</span>
                                <span className="text-xl text-slate-500 font-medium">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <div className="flex items-center gap-2 text-green-700 font-bold bg-green-100 px-6 py-3 rounded-2xl text-xl">
                                <CheckCircle2 size={24} />
                                <span>Done</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            } />

            <Route path="/calendar" element={
              <div className="p-10 bg-white rounded-[3rem] shadow-xl space-y-10 animate-in fade-in">
                <h2 className="text-4xl font-bold">Health Record</h2>
                <div className="bg-blue-50 p-8 rounded-3xl border-2 border-blue-100">
                  <p className="text-2xl text-blue-900 font-medium">Joyce, you have taken all your pills on time this week!</p>
                </div>
                <div className="grid grid-cols-7 gap-4">
                  {Array.from({length: 31}).map((_, i) => (
                    <div key={i} className={`aspect-square rounded-3xl flex items-center justify-center border-2 text-xl ${i < 5 ? 'bg-green-100 border-green-300 text-green-700 font-bold' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>
            } />

            <Route path="/refills" element={
              <div className="p-10 bg-white rounded-[3rem] shadow-xl space-y-10 animate-in fade-in">
                <h2 className="text-4xl font-bold text-slate-900">Pharmacy Orders</h2>
                <div className="space-y-8">
                  {meds.map(med => {
                    const isDue = new Date(med.refillDate) <= new Date(new Date().setDate(new Date().getDate() + 7));
                    return (
                      <div key={med.id} className={`p-8 border-4 rounded-[2.5rem] flex flex-col gap-8 ${isDue ? 'border-orange-300 bg-orange-50' : 'border-slate-100 bg-slate-50'}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-4xl font-extrabold text-slate-900">{med.name}</h4>
                            <p className="text-2xl text-slate-600 font-medium mt-2">Pick up by: <span className={isDue ? 'text-orange-700 font-bold' : ''}>{new Date(med.refillDate).toLocaleDateString()}</span></p>
                          </div>
                          {isDue && (
                            <span className="bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold text-xl animate-pulse shadow-lg">Due Now</span>
                          )}
                        </div>
                        <div className="flex gap-4">
                          <button className="flex-1 bg-blue-600 text-white font-bold py-6 rounded-3xl text-2xl shadow-xl hover:bg-blue-700">Order Refill</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            } />

            <Route path="/settings" element={
              <div className="p-10 bg-white rounded-[3rem] shadow-xl space-y-12 animate-in fade-in">
                <h2 className="text-4xl font-bold">Secure Account</h2>
                <section>
                  <h3 className="text-3xl font-bold mb-8 text-slate-800">Privacy & Help</h3>
                  <div className="space-y-6">
                    <div className="p-8 bg-slate-50 rounded-3xl flex items-center justify-between border-2 border-slate-100">
                      <div className="flex-1">
                        <p className="text-2xl font-bold">Clinician Alerts</p>
                        <p className="text-xl text-slate-600">Update doctor if I miss a dose.</p>
                      </div>
                      <div className="w-20 h-10 bg-blue-600 rounded-full flex items-center px-1">
                        <div className="w-8 h-8 bg-white rounded-full ml-auto shadow"></div>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="flex flex-col gap-6 pt-10 border-t border-slate-100">
                  <button onClick={handleLogout} className="flex items-center justify-center gap-4 bg-red-50 text-red-600 font-bold py-8 rounded-3xl text-2xl border-2 border-red-100 hover:bg-red-100">
                    <Power size={32} />
                    Sign Out Joyce
                  </button>
                  <p className="text-center text-slate-400 text-lg">MedAssist version 1.0.4</p>
                </div>
              </div>
            } />
          </Routes>
        </main>

        {activeMedication && (
          <MedicationVerification 
            med={activeMedication} 
            onCancel={() => setActiveMedication(null)}
            onConfirm={completeTake}
          />
        )}

        <nav className="fixed bottom-0 w-full bg-white border-t-2 border-slate-100 shadow-[0_-15px_40px_-15px_rgba(0,0,0,0.1)] flex justify-around items-center p-8 z-40 max-w-4xl left-1/2 -translate-x-1/2 md:rounded-t-[3rem]">
          <Link to="/" className="flex flex-col items-center p-2 text-blue-600">
            <LayoutDashboard size={44} />
            <span className="text-xl mt-2 font-extrabold tracking-tight">Today</span>
          </Link>
          <Link to="/calendar" className="flex flex-col items-center p-2 text-slate-400">
            <Calendar size={44} />
            <span className="text-xl mt-2 font-bold tracking-tight">Log</span>
          </Link>
          <Link to="/refills" className="flex flex-col items-center p-2 text-slate-400 relative">
            <ShoppingBag size={44} />
            <span className="text-xl mt-2 font-bold tracking-tight">Refills</span>
            <div className="absolute top-1 right-2 w-4 h-4 bg-orange-500 rounded-full border-4 border-white shadow-sm"></div>
          </Link>
          <Link to="/settings" className="flex flex-col items-center p-2 text-slate-400">
            <Settings size={44} />
            <span className="text-xl mt-2 font-bold tracking-tight">Safety</span>
          </Link>
        </nav>
      </div>
    </Router>
  );
};

export default App;
