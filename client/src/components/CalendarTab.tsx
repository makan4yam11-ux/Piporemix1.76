import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarEvent } from "@shared/schema";
import PipoMascot from "./PipoMascot";
import { 
  format, 
  addDays, 
  startOfToday,
  isSameDay,
  startOfWeek,
  eachDayOfInterval,
  parseISO
} from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { getDateLocale } from "@/lib/dateLocale";
import { ViewModeSelector } from "./ViewModeSelector";
import { MonthlyCalendar } from "./MonthlyCalendar";
import { YearlyCalendar } from "./YearlyCalendar";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";

type ViewMode = 'daily' | 'weekly' | 'monthly' | 'yearly';

export default function CalendarTab() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const dateLocale = getDateLocale(language);
  
  const storageKey = `pipo_calendar_${user?.email || 'default'}`;
  
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved).currentView || 'daily';
      } catch (e) {
        return 'daily';
      }
    }
    return 'daily';
  });

  const [selectedDay, setSelectedDay] = useState<Date>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return parseISO(JSON.parse(saved).selectedDate);
      } catch (e) {
        return startOfToday();
      }
    }
    return startOfToday();
  });

  useEffect(() => {
    const state = {
      selectedDate: selectedDay.toISOString(),
      currentView: viewMode,
      lastOpened: new Date().toISOString()
    };
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [selectedDay, viewMode, storageKey]);
  
  const { data: events } = useQuery<CalendarEvent[]>({
    queryKey: ["/api/calendar/events"],
  });

  const { data: reminders } = useQuery<any[]>({
    queryKey: ["/api/reminders"],
  });

  const itemsForDate = (date: Date) => {
    const dayEvents = events?.filter(event => isSameDay(new Date(event.startTime), date)) || [];
    const dayReminders = reminders?.filter(rem => isSameDay(new Date(rem.dueDate), date)) || [];
    return [...dayEvents, ...dayReminders];
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDay(date);
    setViewMode('daily');
  };

  const handleMonthSelect = (date: Date) => {
    setSelectedDay(date);
    setViewMode('monthly');
  };

  return (
    <div className="pb-24 min-h-screen flex flex-col bg-[#FDFBF7]">
      <div className="px-6 pt-14 pb-6 flex flex-col gap-6">
        <ViewModeSelector viewMode={viewMode} onViewModeChange={setViewMode} />
      </div>

      <div className="flex-1 px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="h-full"
          >
            {viewMode === 'daily' && <DayView selectedDay={selectedDay} itemsForDate={itemsForDate} locale={dateLocale} />}
            {viewMode === 'weekly' && <WeekView today={selectedDay} itemsForDate={itemsForDate} locale={dateLocale} onDateSelect={handleDateSelect} />}
            {viewMode === 'monthly' && <MonthlyCalendar selectedDate={selectedDay} onDateSelect={handleDateSelect} onMonthChange={setSelectedDay} />}
            {viewMode === 'yearly' && <YearlyCalendar selectedDate={selectedDay} onMonthSelect={handleMonthSelect} onYearChange={setSelectedDay} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function DayView({ selectedDay, itemsForDate, locale }: { selectedDay: Date, itemsForDate: (d: Date) => any[], locale: any }) {
  const items = itemsForDate(selectedDay);
  
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-black text-amber-950 mb-2">
          {format(selectedDay, "EEEE", { locale })}
        </h1>
        <p className="text-xl text-amber-800/60 font-medium">
          {format(selectedDay, "d MMMM", { locale })}
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-amber-900/40 px-2">
          Things Today
        </h2>
        {items.length > 0 ? (
          <div className="space-y-4">
            {items.slice(0, 5).map((item, idx) => (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                key={idx}
                className="bg-white rounded-[32px] p-6 shadow-sm border border-amber-100/50 flex items-center gap-6"
              >
                <span className="text-5xl">{item.emoji || "✨"}</span>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-amber-950">{item.title}</h3>
                  <div className="mt-2 flex gap-2">
                    <span className="px-3 py-1 bg-amber-50 rounded-full text-[10px] font-bold uppercase tracking-wider text-amber-700/60 border border-amber-100/50">
                      {item.vibeTag || "fun"}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <PipoMascot size="large" expression="neutral" className="opacity-20 mb-6 mx-auto" />
            <p className="text-amber-900/30 font-bold italic text-lg">Just a peaceful day...</p>
          </div>
        )}
      </div>
    </div>
  );
}

function WeekView({ today, itemsForDate, locale, onDateSelect }: { today: Date, itemsForDate: (d: Date) => any[], locale: any, onDateSelect: (d: Date) => void }) {
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: addDays(weekStart, 6)
  });

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4">
        {weekDays.map((day, idx) => {
          const items = itemsForDate(day);
          const isTodayDay = isSameDay(day, today);
          
          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              key={idx}
              onClick={() => onDateSelect(day)}
              className={`
                p-4 rounded-[32px] border transition-all cursor-pointer active:scale-95
                ${isTodayDay 
                  ? "bg-amber-100 border-amber-200 shadow-md ring-4 ring-amber-50" 
                  : "bg-white border-amber-50 shadow-sm"}
              `}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className={`text-xs font-bold uppercase tracking-wider ${isTodayDay ? "text-amber-900" : "text-amber-900/40"}`}>
                    {format(day, "EEE", { locale })}
                  </p>
                  <p className={`text-2xl font-black ${isTodayDay ? "text-amber-950" : "text-amber-900/80"}`}>
                    {format(day, "d")}
                  </p>
                </div>
                {isTodayDay && <span className="px-2 py-1 bg-white rounded-full text-[8px] font-black uppercase tracking-tighter text-amber-900">Today</span>}
              </div>
              <div className="flex gap-1 overflow-hidden">
                {items.slice(0, 2).map((item, i) => (
                  <span key={i} className="text-lg">{item.emoji || "✨"}</span>
                ))}
                {items.length > 2 && <span className="text-xs text-amber-900/30 font-black self-end">+{items.length - 2}</span>}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
