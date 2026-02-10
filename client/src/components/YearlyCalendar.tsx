import { 
  format, 
  startOfYear, 
  endOfYear, 
  eachMonthOfInterval,
  addYears,
  subYears,
  setMonth
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { getDateLocale } from "@/lib/dateLocale";
import { motion } from "framer-motion";

interface YearlyCalendarProps {
  selectedDate: Date;
  onMonthSelect: (date: Date) => void;
  onYearChange: (date: Date) => void;
}

export function YearlyCalendar({ selectedDate, onMonthSelect, onYearChange }: YearlyCalendarProps) {
  const { language } = useLanguage();
  const dateLocale = getDateLocale(language);

  const yearStart = startOfYear(selectedDate);
  const yearEnd = endOfYear(selectedDate);
  const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

  const getSeasonalEmoji = (month: number) => {
    if (month >= 2 && month <= 4) return "🌸"; // Spring
    if (month >= 5 && month <= 7) return "☀️"; // Summer
    if (month >= 8 && month <= 10) return "🍂"; // Autumn
    return "❄️"; // Winter
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-[40px] shadow-sm border border-amber-100/50 overflow-hidden p-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-black text-amber-950">
          {format(selectedDate, "yyyy", { locale: dateLocale })}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full hover:bg-amber-50 text-amber-900"
            onClick={() => onYearChange(subYears(selectedDate, 1))}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full hover:bg-amber-50 text-amber-900"
            onClick={() => onYearChange(addYears(selectedDate, 1))}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 flex-1">
        {months.map((month, idx) => (
          <motion.button
            whileTap={{ scale: 0.95 }}
            key={idx}
            onClick={() => onMonthSelect(setMonth(selectedDate, month.getMonth()))}
            className="p-4 rounded-[32px] bg-amber-50/30 border border-amber-100/50 flex flex-col items-center justify-center gap-2 hover:bg-amber-100/50 transition-all"
          >
            <span className="text-3xl">{getSeasonalEmoji(month.getMonth())}</span>
            <span className="text-sm font-black text-amber-950 uppercase tracking-widest">
              {format(month, "MMM", { locale: dateLocale })}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
