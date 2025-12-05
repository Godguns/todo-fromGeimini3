export interface Task {
  id: string;
  title: string;
  date: string; // ISO Date string YYYY-MM-DD
  time?: string; // HH:mm
  completed: boolean;
  color?: string; // Tailwind color class for tag
  hasAlarm: boolean;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  lunar: string; // Simulated lunar text e.g., "初一"
}

export enum ViewMode {
  CALENDAR = 'calendar',
  LIST = 'list',
  WIDGET = 'widget',
  SETTINGS = 'settings'
}

export const WEEKDAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
