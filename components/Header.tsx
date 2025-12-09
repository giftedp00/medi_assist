
import React from 'react';
import { User, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  name: string;
}

const Header: React.FC<HeaderProps> = ({ name }) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <header className="bg-white p-8 shadow-sm border-b-2 border-slate-50 flex items-center justify-between animate-in slide-in-from-top duration-500">
      <div className="flex items-center gap-6">
        <div className="bg-blue-600 p-5 rounded-[2rem] shadow-lg">
          <User size={48} className="text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">{greeting}, {name}</h1>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xl mt-1">
            <ShieldCheck size={24} />
            <span>MedAssist is Active</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
