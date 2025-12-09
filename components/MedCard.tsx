
import React from 'react';
import { Medication } from '../types';
import { Pill, Clock, AlertCircle, Loader2 } from 'lucide-react';

interface MedCardProps {
  med: Medication;
  onTake: (id: string) => void;
}

const MedCard: React.FC<MedCardProps> = ({ med, onTake }) => {
  return (
    <div className="bg-white border-2 border-gray-100 rounded-3xl p-6 shadow-md hover:border-blue-300 transition-colors flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-2xl">
            <Pill className="text-blue-600" size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{med.name}</h3>
            <p className="text-lg text-gray-600">{med.dose} • {med.form}</p>
          </div>
        </div>
        <div className="bg-orange-50 px-4 py-2 rounded-xl flex items-center gap-2">
          <Clock className="text-orange-600" size={20} />
          <span className="text-orange-800 font-bold">{med.times[0]}</span>
        </div>
      </div>

      <div className="mb-4 rounded-2xl overflow-hidden h-48 w-full bg-slate-50 border border-slate-100 flex items-center justify-center relative">
        {med.imageUrl ? (
          <img 
            src={med.imageUrl} 
            alt={`Container for ${med.name}`} 
            className="w-full h-full object-cover animate-in fade-in duration-700"
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-slate-300" size={32} />
            <span className="text-slate-400 font-medium">Generating visual...</span>
          </div>
        )}
      </div>

      <div className="flex-1 bg-gray-50 p-4 rounded-2xl mb-6">
        <p className="text-gray-700 flex items-center gap-2">
          <AlertCircle size={20} className="text-gray-400 shrink-0" />
          <span className="font-semibold">{med.containerDescription}</span>
        </p>
      </div>

      <button 
        onClick={() => onTake(med.id)}
        className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-blue-700 transition-all text-xl active:scale-95"
      >
        I took my {med.name}
      </button>
    </div>
  );
};

export default MedCard;
