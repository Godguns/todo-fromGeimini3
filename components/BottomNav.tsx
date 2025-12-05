import React from 'react';
import { Home, Calendar as CalendarIcon, Clock, Sparkles, User } from 'lucide-react';
import { ViewMode } from '../types';
import { THEME_TEXT } from '../constants';

interface BottomNavProps {
  currentView: ViewMode;
  onChangeView: (view: ViewMode) => void;
  onSmartAdd: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onChangeView, onSmartAdd }) => {
  const navItemClass = (active: boolean) => 
    `flex flex-col items-center justify-center w-full h-full space-y-1 ${active ? THEME_TEXT : 'text-gray-400'}`;

  return (
    <div className="h-16 bg-white border-t border-gray-200 flex items-center justify-between px-2 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
      <button 
        className={navItemClass(currentView === ViewMode.WIDGET)}
        onClick={() => onChangeView(ViewMode.WIDGET)}
      >
        <Home size={24} strokeWidth={2} />
      </button>

      <button 
        className={navItemClass(currentView === ViewMode.CALENDAR)}
        onClick={() => onChangeView(ViewMode.CALENDAR)}
      >
        <CalendarIcon size={24} strokeWidth={2} />
      </button>

      <button 
        className={`${navItemClass(false)} -mt-6`}
        onClick={onSmartAdd}
      >
        <div className="bg-teal-600 rounded-full p-4 shadow-lg text-white hover:bg-teal-700 transition-colors">
            <Sparkles size={24} />
        </div>
      </button>

      <button 
        className={navItemClass(currentView === ViewMode.LIST)}
        onClick={() => onChangeView(ViewMode.LIST)}
      >
        <Clock size={24} strokeWidth={2} />
      </button>

      <button 
        className={navItemClass(currentView === ViewMode.SETTINGS)}
        onClick={() => onChangeView(ViewMode.SETTINGS)}
      >
        <User size={24} strokeWidth={2} />
      </button>
    </div>
  );
};