'use client';

import { useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameDay,
  addMonths,
  subMonths
} from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'todo' | 'task' | 'plan' | 'milestone';
}

interface CalendarProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
}

export function Calendar({ events, onEventClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  
  const getEventsForDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return events.filter(e => e.date.startsWith(dateStr));
  };

  const eventColors: Record<string, string> = {
    todo: 'bg-teal-500',
    task: 'bg-blue-500', 
    plan: 'bg-orange-500',
    milestone: 'bg-purple-500'
  };

  return (
    <div className="calendar-container p-4">
      {/* Header with navigation */}
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          className="px-3 py-1 rounded hover:bg-gray-100"
        >
          ←
        </button>
        <h3 className="text-lg font-semibold" style={{ color: '#134E4A' }}>
          {format(currentDate, 'yyyy年M月', { locale: zhCN })}
        </h3>
        <button 
          onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          className="px-3 py-1 rounded hover:bg-gray-100"
        >
          →
        </button>
      </div>
      
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['日', '一', '二', '三', '四', '五', '六'].map(d => (
          <div key={d} className="text-center text-sm font-medium p-2 text-gray-600">
            {d}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map(day => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = format(day, 'M') === format(currentDate, 'M');
          const isToday = isSameDay(day, new Date());
          
          return (
            <div 
              key={day.toISOString()}
              className={`min-h-20 border p-1 ${
                isToday ? 'bg-teal-50 border-teal-300' : ''
              } ${!isCurrentMonth ? 'bg-gray-50' : ''}`}
            >
              <div className={`text-sm mb-1 ${isCurrentMonth ? 'text-gray-700' : 'text-gray-400'}`}>
                {format(day, 'd')}
              </div>
              {dayEvents.slice(0, 2).map(e => (
                <div
                  key={e.id}
                  onClick={() => onEventClick?.(e)}
                  className={`text-xs p-1 mb-1 rounded truncate cursor-pointer ${eventColors[e.type]} text-white`}
                >
                  {e.title}
                </div>
              ))}
              {dayEvents.length > 2 && (
                <div className="text-xs text-gray-500">+{dayEvents.length - 2}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
