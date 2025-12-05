import React from 'react';
import { Task } from '../types';
import { format, isSameDay } from 'date-fns';
import { Plus } from 'lucide-react';
import { LUNAR_MAPPING } from '../constants';

interface WidgetViewProps {
  tasks: Task[];
}

export const WidgetView: React.FC<WidgetViewProps> = ({ tasks }) => {
  const today = new Date();
  const todayTasks = tasks.filter(t => isSameDay(new Date(t.date), today));

  return (
    <div className="flex-1 bg-[url('https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center p-6 flex flex-col justify-center items-center">
      
      {/* Widget Container */}
      <div className="w-full max-w-sm bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[400px]">
        
        {/* Widget Header */}
        <div className="bg-teal-600/10 p-5 flex justify-between items-start">
          <div>
            <h2 className="text-4xl font-light text-teal-900">{format(today, 'dd')}</h2>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-sm font-medium text-teal-700 uppercase">{format(today, 'EEEE')}</span>
               <span className="text-xs text-teal-600/70">{LUNAR_MAPPING[parseInt(format(today, 'd'))] || '初一'}</span>
            </div>
          </div>
          <div className="bg-white/50 p-2 rounded-full">
            <span className="text-xs font-bold text-teal-800">{todayTasks.length} 待办</span>
          </div>
        </div>

        {/* Task List in Widget */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {todayTasks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <p>今天没有安排</p>
              <p className="text-xs mt-1">享受生活吧!</p>
            </div>
          ) : (
            todayTasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 group">
                <div className={`w-1 h-8 rounded-full ${task.completed ? 'bg-gray-300' : 'bg-teal-500'}`}></div>
                <div className="flex-1">
                   <p className={`text-sm font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                     {task.title}
                   </p>
                   {task.time && <p className="text-xs text-gray-400">{task.time}</p>}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Button Widget Style */}
        <div className="p-4 border-t border-gray-100 bg-white/50">
           <button className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-teal-50 text-teal-600 text-sm font-medium hover:bg-teal-100 transition-colors">
             <Plus size={16} />
             添加新事项
           </button>
        </div>

      </div>

      <div className="mt-8 text-white/80 text-sm font-medium shadow-black drop-shadow-md">
        长按桌面空白处添加小组件
      </div>
    </div>
  );
};
