import { useState } from "react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  startOfWeek,
  endOfWeek
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { getDateLocale } from "@/lib/dateLocale";
import { motion } from "framer-motion";

interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  emoji?: string;
}

interface MonthlyCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onMonthChange: (date: Date) => void;
}

export function MonthlyCalendar({ selectedDate, onDateSelect, onMonthChange }: MonthlyCalendarProps) {
  const { language } = useLanguage();
  const dateLocale = getDateLocale(language);

  const { data: events = [] } = useQuery<CalendarEvent[]>({
    queryKey: ["/api/calendar/events"],
  });

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getItemsForDay = (day: Date) => {
    return events.filter(event => isSameDay(new Date(event.startTime), day));
  };

  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="flex flex-col h-full bg-white rounded-[40px] shadow-sm border border-amber-100/50 overflow-hidden">
      <div className="px-6 py-4 flex items-center justify-between border-b border-amber-50">
        <h2 className="text-xl font-black text-amber-950">
          {format(selectedDate, "MMMM yyyy", { locale: dateLocale })}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full hover:bg-amber-50 text-amber-900"
            onClick={() => onMonthChange(subMonths(selectedDate, 1))}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full hover:bg-amber-50 text-amber-900"
            onClick={() => onMonthChange(addMonths(selectedDate, 1))}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </div>

      <div className="flex-1 p-4">
        <div className="grid grid-cols-7 mb-4">
          {weekDays.map((day, idx) => (
            <div key={idx} className="text-center text-[10px] font-black text-amber-900/30 uppercase tracking-widest">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, idx) => {
            const isCurrentMonth = isSameMonth(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const items = getItemsForDay(day);

            return (
              <motion.button
                whileTap={{ scale: 0.95 }}
                key={idx}
                onClick={() => onDateSelect(day)}
                className={`
                  aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all
                  ${!isCurrentMonth ? 'opacity-20' : 'opacity-100'}
                  ${isToday ? 'bg-amber-100 text-amber-950 font-bold' : 'hover:bg-amber-50 text-amber-900/60'}
                `}
              >
                <span className="text-sm font-bold">{format(day, 'd')}</span>
                <div className="flex gap-0.5">
                  {items.slice(0, 3).map((item, i) => (
                    <div key={i} className="w-1 h-1 rounded-full bg-amber-400" />
                  ))}
                  {items.length === 0 && <div className="w-1 h-1" />}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
