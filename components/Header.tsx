
import React from 'react';
import { User } from 'lucide-react';

interface HeaderProps {
  name: string;
}

const Header: React.FC<HeaderProps> = ({ name }) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <header className="bg-white p-6 shadow-sm border-b border-gray-100 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{greeting}, {name}!</h1>
        <p className="text-lg text-gray-600 mt-1">You are doing a great job managing your health today.</p>
      </div>
      <div className="bg-blue-100 p-4 rounded-full">
        <User size={32} className="text-blue-600" />
      </div>
    </header>
  );
};

export default Header;
