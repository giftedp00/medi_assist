
import React, { useState, useMemo, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Calendar, LayoutDashboard, Settings, ShoppingBag, Bell, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Medication, AdherenceLog, Consents, UserPreferences } from './types';
import { INITIAL_MEDICATIONS, INITIAL_CONSENTS, INITIAL_PREFERENCES } from './constants';
import Header from './components/Header';
import MedCard from './components/MedCard';
import MedicationVerification from './components/MedicationVerification';
import { generateMedicationImage } from './services/imageService';

const App: React.FC = () => {
  const [meds, setMeds] = useState<Medication[]>(INITIAL_MEDICATIONS);
  const [logs, setLogs] = useState<AdherenceLog[]>([]);
  const [consents] = useState<Consents>(INITIAL_CONSENTS);
  const [activeMedication, setActiveMedication] = useState<Medication | null>(null);
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});

  // Generate unique container images for the patient
  useEffect(() => {
    const generateImages = async () => {
      const newImages: Record<string, string> = {};
      for (const med of meds) {
        const generated = await generateMedicationImage(med.name, med.containerDescription);
        if (generated) {
          newImages[med.id] = generated;
        }
      }
      setGeneratedImages(prev => ({ ...prev, ...newImages }));
    };

    generateImages();
  }, [meds]);

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

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col pb-28">
        <Header name="Joyce" />
        
        <main className="flex-1 max-w-4xl mx-auto w-full p-4 lg:p-8">
          <Routes>
            <Route path="/" element={
              <div className="space-y-8">
                {refillsNeeded.length > 0 && (
                  <div className="bg-orange-50 border-2 border-orange-200 p-6 rounded-3xl flex items-center gap-4 animate-in slide-in-from-top duration-500">
                    <div className="p-3 bg-orange-100 rounded-2xl">
                      <ShoppingBag className="text-orange-600" size={32} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xl font-bold text-orange-900">Pharmacy Pickup Alert</p>
                      <p className="text-lg text-orange-800">Your {refillsNeeded[0].name} is ready for pickup soon.</p>
                    </div>
                    <Link to="/refills" className="bg-orange-600 text-white p-3 rounded-2xl">
                      <ChevronRight size={24} />
                    </Link>
                  </div>
                )}

                <div className="flex justify-between items-center px-2">
                  <h2 className="text-3xl font-bold text-slate-900">Today's Schedule</h2>
                  <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-2xl text-green-700 font-bold border border-green-200">
                    <CheckCircle2 size={24} />
                    <span>{logs.length} / {meds.length} Done</span>
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
                  <div className="mt-8 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                      <Bell size={24} className="text-blue-500" />
                      Activity History
                    </h3>
                    <div className="space-y-4">
                      {logs.slice(0, 3).map(log => {
                        const m = meds.find(m => m.id === log.medicationId);
                        return (
                          <div key={log.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                            <div className="flex flex-col">
                                <span className="text-xl font-bold text-slate-900">{m?.name}</span>
                                <span className="text-slate-500 font-medium">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <div className="flex items-center gap-2 text-green-700 font-bold bg-green-100 px-4 py-2 rounded-xl">
                                <CheckCircle2 size={20} />
                                <span>Confirmed</span>
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
              <div className="p-8 bg-white rounded-3xl shadow-md space-y-8">
                <h2 className="text-3xl font-bold">Health History</h2>
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                  <p className="text-xl text-blue-900 leading-relaxed">You have taken <strong>100%</strong> of your doses this week! Keep up the amazing work, Joyce.</p>
                </div>
                <div className="grid grid-cols-7 gap-3 mt-8">
                  {Array.from({length: 31}).map((_, i) => (
                    <div key={i} className={`aspect-square rounded-2xl flex items-center justify-center border-2 ${i < 5 ? 'bg-green-50 border-green-200 text-green-700 font-bold' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                      {i + 1}
                      {i < 5 && <CheckCircle2 size={16} className="ml-1" />}
                    </div>
                  ))}
                </div>
              </div>
            } />

            <Route path="/refills" element={
              <div className="p-8 bg-white rounded-3xl shadow-md space-y-8">
                <h2 className="text-3xl font-bold">Pharmacy Pickups</h2>
                <div className="space-y-6">
                  {meds.map(med => {
                    const isDue = new Date(med.refillDate) <= new Date(new Date().setDate(new Date().getDate() + 7));
                    return (
                      <div key={med.id} className={`p-8 border-2 rounded-3xl flex flex-col gap-6 ${isDue ? 'border-orange-300 bg-orange-50' : 'border-slate-100 bg-slate-50 opacity-75'}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-3xl font-bold text-slate-900">{med.name}</h4>
                            <p className="text-xl text-slate-600 font-medium">Refill due: <span className={isDue ? 'text-orange-700 font-bold' : ''}>{new Date(med.refillDate).toLocaleDateString()}</span></p>
                          </div>
                          {isDue && (
                            <span className="bg-orange-600 text-white px-4 py-2 rounded-xl font-bold text-lg animate-pulse">Action Required</span>
                          )}
                        </div>
                        <div className="flex gap-4">
                          <button className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-2xl text-xl shadow-lg hover:bg-blue-700">Request Pickup</button>
                          <button className="bg-white text-slate-700 border-2 border-slate-200 font-bold py-4 px-8 rounded-2xl text-xl hover:bg-slate-100">Call</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            } />

            <Route path="/settings" element={
              <div className="p-8 bg-white rounded-3xl shadow-md space-y-10">
                <h2 className="text-3xl font-bold">Safe Guard Profile</h2>
                <section>
                  <h3 className="text-2xl font-bold mb-6 text-slate-800">Consents & Security</h3>
                  <div className="space-y-6">
                    <div className="p-6 bg-slate-50 rounded-2xl flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xl font-bold">Camera Verification</p>
                        <p className="text-slate-600">Checking containers visually for safety.</p>
                      </div>
                      <div className="w-16 h-8 bg-blue-600 rounded-full flex items-center px-1">
                        <div className="w-6 h-6 bg-white rounded-full ml-auto shadow"></div>
                      </div>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xl font-bold">Caregiver Alerts</p>
                        <p className="text-slate-600">Notify authorized clinician on missed doses.</p>
                      </div>
                      <div className="w-16 h-8 bg-blue-600 rounded-full flex items-center px-1">
                        <div className="w-6 h-6 bg-white rounded-full ml-auto shadow"></div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="pt-8 border-t border-slate-100">
                  <h3 className="text-2xl font-bold mb-4 text-slate-800">Your Data</h3>
                  <p className="text-lg text-slate-500 mb-6">MedAssist uses secure local storage. No health images leave your device without explicit one-time consent.</p>
                  <div className="flex flex-col gap-4">
                    <button className="bg-slate-100 text-slate-700 font-bold py-4 rounded-2xl text-xl hover:bg-slate-200">Download My Health Log</button>
                    <button className="text-red-600 font-bold text-xl py-4 border-2 border-red-50 rounded-2xl hover:bg-red-50">Delete My Logs & Data</button>
                  </div>
                </section>
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

        <nav className="fixed bottom-0 w-full bg-white border-t border-slate-200 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] flex justify-around items-center p-6 z-40 max-w-4xl left-1/2 -translate-x-1/2 md:rounded-t-3xl">
          <Link to="/" className="flex flex-col items-center p-2 text-blue-600">
            <LayoutDashboard size={36} />
            <span className="text-lg mt-1 font-bold">Today</span>
          </Link>
          <Link to="/calendar" className="flex flex-col items-center p-2 text-slate-400">
            <Calendar size={36} />
            <span className="text-lg mt-1 font-bold">History</span>
          </Link>
          <Link to="/refills" className="flex flex-col items-center p-2 text-slate-400 relative">
            <ShoppingBag size={36} />
            <span className="text-lg mt-1 font-bold">Refills</span>
            <div className="absolute top-1 right-2 w-3 h-3 bg-orange-500 rounded-full border-2 border-white"></div>
          </Link>
          <Link to="/settings" className="flex flex-col items-center p-2 text-slate-400">
            <Settings size={36} />
            <span className="text-lg mt-1 font-bold">Safe</span>
          </Link>
        </nav>
      </div>
    </Router>
  );
};

export default App;
