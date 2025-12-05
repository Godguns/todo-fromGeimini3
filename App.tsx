import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  addMonths, 
  subMonths, 
  format, 
  isSameMonth, 
  isToday 
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Search, MoreHorizontal, Sun, ChevronLeft, ChevronRight, Mic } from 'lucide-react';
import { CalendarGrid } from './components/CalendarGrid';
import { BottomNav } from './components/BottomNav';
import { TaskModal } from './components/TaskModal';
import { WidgetView } from './components/WidgetView';
import { Task, CalendarDay, ViewMode, WEEKDAYS } from './types';
import { LUNAR_MAPPING } from './constants';
import { parseTaskFromText } from './services/geminiService';

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<ViewMode>(ViewMode.CALENDAR);
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('tasks');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Audio for alarm - usage Ref to persist instance
  const alarmAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Audio once
  useEffect(() => {
    alarmAudioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
  }, []);

  // Unlock Audio Context on first interaction to allow autoplay later
  useEffect(() => {
    const unlockAudio = () => {
      if (alarmAudioRef.current) {
        alarmAudioRef.current.play().then(() => {
          alarmAudioRef.current?.pause();
          alarmAudioRef.current!.currentTime = 0;
        }).catch(() => { /* Ignore errors if already unlocked or failed */ });
      }
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };
    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  // Save tasks
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Alarm Checker
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentTime = format(now, 'HH:mm');
      const currentDateStr = format(now, 'yyyy-MM-dd');

      tasks.forEach(task => {
        // We add a simple property check to avoid re-triggering (in a real app, use a dedicated 'alarmTriggered' flag)
        if (task.hasAlarm && !task.completed && task.date === currentDateStr && task.time === currentTime) {
           if (Notification.permission === 'granted') {
             new Notification('日程提醒', { body: task.title });
           }
           alarmAudioRef.current?.play().catch(e => console.log('Audio autoplay blocked', e));
        }
      });
    };

    const interval = setInterval(checkAlarms, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [tasks]);

  // Request Notification Permission on mount (or preferably on a button click in settings)
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Generate Calendar Days
  const days = useMemo<CalendarDay[]>(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

    return dateRange.map(date => ({
      date,
      isCurrentMonth: isSameMonth(date, monthStart),
      isToday: isToday(date),
      lunar: LUNAR_MAPPING[date.getDate()] || '初一'
    }));
  }, [currentDate]);

  const handleAddTask = (taskData: { title: string, date: string, time: string, hasAlarm: boolean }) => {
    const newTask: Task = {
      id: Date.now().toString(),
      completed: false,
      ...taskData
    };
    setTasks(prev => [...prev, newTask]);
  };

  const handleSmartAdd = async () => {
    const text = prompt("你想做什么？(例如: 明天下午3点开会)");
    if (!text) return;

    setIsProcessing(true);
    const result = await parseTaskFromText(text, format(new Date(), 'yyyy-MM-dd'));
    setIsProcessing(false);

    if (result) {
      handleAddTask({
        title: result.title,
        date: result.date,
        time: result.time || '',
        hasAlarm: result.hasAlarm
      });
      alert(`已添加: ${result.title} 到 ${result.date}`);
    } else {
      alert("无法理解您的请求，请手动添加。");
      setIsModalOpen(true);
    }
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Render Logic
  if (view === ViewMode.WIDGET) {
    return (
      <div className="fixed inset-0 flex flex-col bg-gray-900">
         <WidgetView tasks={tasks} />
         <BottomNav currentView={view} onChangeView={setView} onSmartAdd={handleSmartAdd} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-white text-gray-900 font-sans">
      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between bg-white z-10 border-b border-gray-50 flex-shrink-0">
        <div className="flex items-center gap-2">
           <h1 className="text-xl font-medium text-gray-700">日程概览</h1>
           <span className="text-xl font-normal text-gray-500">{format(currentDate, 'MM月')}</span>
        </div>
        <div className="flex items-center gap-4 text-gray-500">
          <button className="active:opacity-50 transition-opacity"><Sun size={22} className="text-teal-500" /></button>
          <button className="active:opacity-50 transition-opacity"><Search size={22} /></button>
          <button className="active:opacity-50 transition-opacity"><MoreHorizontal size={22} /></button>
        </div>
      </header>

      {/* Weekday Header */}
      <div className="grid grid-cols-7 border-b border-gray-100 pb-2 pt-2 bg-white flex-shrink-0">
        {WEEKDAYS.map((day, i) => (
          <div key={i} className={`text-center text-sm font-medium ${i >= 5 ? 'text-teal-600' : 'text-gray-400'}`}>
            {day}
          </div>
        ))}
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        {view === ViewMode.CALENDAR && (
          <CalendarGrid 
            days={days} 
            tasks={tasks}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onAddTask={() => setIsModalOpen(true)}
          />
        )}

        {view === ViewMode.LIST && (
           <div className="flex-1 overflow-y-auto p-4 pb-24">
              <h2 className="text-lg font-bold mb-4">所有待办</h2>
              <div className="space-y-3">
                {tasks.length === 0 ? (
                    <div className="text-center text-gray-400 mt-10">
                        <p>暂无待办事项</p>
                    </div>
                ) : (
                    tasks.map(task => (
                        <div key={task.id} className="bg-gray-50 p-4 rounded-xl flex items-center justify-between shadow-sm active:scale-[0.99] transition-transform">
                        <div>
                            <div className={`font-medium text-lg ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>{task.title}</div>
                            <div className="text-xs text-gray-500 mt-1 flex gap-2">
                                <span>{task.date}</span>
                                {task.time && <span>{task.time}</span>}
                            </div>
                        </div>
                        <button 
                            onClick={() => setTasks(tasks.filter(t => t.id !== task.id))}
                            className="text-gray-400 p-2 hover:bg-gray-200 rounded-full"
                        >
                            <MoreHorizontal size={20} />
                        </button>
                        </div>
                    ))
                )}
              </div>
           </div>
        )}
      </div>
       
       {/* Month Navigation Overlay */}
       {view === ViewMode.CALENDAR && (
          <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 flex gap-4 bg-white/90 backdrop-blur rounded-full shadow-lg p-2 border border-gray-100 z-10">
             <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full active:bg-gray-200"><ChevronLeft size={20} className="text-gray-600" /></button>
             <button onClick={() => setCurrentDate(new Date())} className="text-sm font-medium text-teal-600 px-3">今天</button>
             <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full active:bg-gray-200"><ChevronRight size={20} className="text-gray-600" /></button>
          </div>
       )}

      {/* Loading Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3">
             <div className="animate-spin rounded-full h-5 w-5 border-2 border-teal-500 border-t-transparent"></div>
             <span className="font-medium text-gray-700">AI 正在思考...</span>
          </div>
        </div>
      )}

      {/* FAB (Floating Action Button) */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 right-6 bg-teal-600 text-white w-14 h-14 rounded-full shadow-lg shadow-teal-600/40 flex items-center justify-center active:scale-90 transition-all z-20"
      >
          <MoreHorizontal size={28} className="rotate-90" /> 
          <div className="absolute top-3 right-3 w-2 h-2 bg-red-400 rounded-full border-2 border-teal-600"></div>
      </button>

      <BottomNav currentView={view} onChangeView={setView} onSmartAdd={handleSmartAdd} />
      
      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleAddTask}
        initialDate={selectedDate}
      />
    </div>
  );
}