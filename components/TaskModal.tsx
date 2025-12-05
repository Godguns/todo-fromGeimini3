import React, { useState } from 'react';
import { X, Clock, Bell } from 'lucide-react';
import { format } from 'date-fns';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: { title: string, date: string, time: string, hasAlarm: boolean }) => void;
  initialDate: Date;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSubmit, initialDate }) => {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [hasAlarm, setHasAlarm] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onSubmit({
      title,
      date: format(initialDate, 'yyyy-MM-dd'),
      time: time,
      hasAlarm
    });
    setTitle('');
    setTime('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-[fadeIn_0.2s_ease-out]">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">新建日程</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
             <input 
              autoFocus
              type="text" 
              placeholder="做什么？" 
              className="w-full text-xl text-gray-800 placeholder:text-gray-300 border-none focus:ring-0 p-0"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
             <span className="font-medium text-teal-600">{format(initialDate, 'MM月dd日')}</span>
          </div>

          <div className="flex gap-3">
            <div className={`flex-1 flex items-center gap-2 p-3 rounded-lg border ${time ? 'border-teal-500 bg-teal-50' : 'border-gray-200'}`}>
              <Clock size={18} className="text-gray-400" />
              <input 
                type="time" 
                className="bg-transparent border-none focus:ring-0 text-sm w-full p-0 text-gray-700"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
            
            <button 
              type="button"
              onClick={() => setHasAlarm(!hasAlarm)}
              className={`p-3 rounded-lg border flex items-center justify-center gap-2 transition-colors ${hasAlarm ? 'border-teal-500 bg-teal-50 text-teal-600' : 'border-gray-200 text-gray-400'}`}
            >
              <Bell size={18} />
              <span className="text-sm">提醒</span>
            </button>
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              className="w-full bg-teal-600 text-white py-3 rounded-xl font-medium shadow-lg shadow-teal-600/30 active:scale-95 transition-transform"
            >
              完成
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
