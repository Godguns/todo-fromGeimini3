import React from 'react';
import { format, isSameDay, getDate } from 'date-fns';
import { CalendarDay, Task } from '../types';
import { LUNAR_MAPPING, THEME_TEXT, THEME_LIGHT_BG } from '../constants';

interface CalendarGridProps {
  days: CalendarDay[];
  tasks: Task[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onAddTask: (date: Date) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({ 
  days, 
  tasks, 
  selectedDate, 
  onSelectDate,
  onAddTask 
}) => {
  
  const getTasksForDay = (date: Date) => {
    return tasks.filter(t => isSameDay(new Date(t.date), date));
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar bg-white">
      <div className="grid grid-cols-7 border-b border-gray-100">
        {days.map((day, idx) => {
          const dayTasks = getTasksForDay(day.date);
          const isSelected = isSameDay(day.date, selectedDate);
          const isToday = day.isToday;
          
          return (
            <div 
              key={idx} 
              onClick={() => onSelectDate(day.date)}
              className={`
                min-h-[110px] border-r border-b border-gray-100 relative p-1 flex flex-col items-center cursor-pointer transition-colors
                ${!day.isCurrentMonth ? 'opacity-40' : ''}
                ${isSelected ? 'bg-teal-50/50' : 'hover:bg-gray-50'}
              `}
            >
              {/* Date Header */}
              <div className={`
                flex flex-col items-center justify-center w-full mt-1 mb-1 rounded-lg py-1
                ${isSelected ? `border border-teal-200 ${THEME_LIGHT_BG}` : ''}
              `}>
                <span className={`text-lg font-medium leading-none ${isToday ? THEME_TEXT : 'text-gray-800'}`}>
                  {getDate(day.date)}
                </span>
                <span className={`text-[10px] mt-0.5 leading-none ${isToday ? THEME_TEXT : 'text-gray-400'}`}>
                  {LUNAR_MAPPING[getDate(day.date)] || '初一'}
                </span>
              </div>

              {/* Tasks List (Truncated) */}
              <div className="w-full flex flex-col gap-1 px-0.5 overflow-hidden">
                {dayTasks.slice(0, 3).map(task => (
                  <div 
                    key={task.id} 
                    className={`
                      text-[10px] px-1 py-0.5 rounded truncate w-full
                      ${task.completed ? 'bg-gray-100 text-gray-400 line-through' : 'bg-gray-100 text-gray-700'}
                    `}
                  >
                    {task.title}
                  </div>
                ))}
                {dayTasks.length > 3 && (
                   <div className="text-[9px] text-gray-400 text-center">+{dayTasks.length - 3}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
