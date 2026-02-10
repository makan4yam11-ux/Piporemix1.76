import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type ViewMode = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface ViewModeSelectorProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const modes: { id: ViewMode; label: string }[] = [
  { id: 'daily', label: 'Day' },
  { id: 'weekly', label: 'Week' },
  { id: 'monthly', label: 'Month' },
  { id: 'yearly', label: 'Year' },
];

export function ViewModeSelector({ viewMode, onViewModeChange }: ViewModeSelectorProps) {
  return (
    <div className="flex justify-center w-full">
      <div className="flex bg-amber-100/50 backdrop-blur-sm rounded-full p-1.5 border border-white/40 shadow-sm w-fit">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onViewModeChange(mode.id)}
          className={cn(
            "relative px-6 py-2 rounded-full text-sm font-bold transition-all duration-500",
            viewMode === mode.id ? "text-amber-900" : "text-amber-900/40 hover:text-amber-900/60"
          )}
        >
          {viewMode === mode.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-white rounded-full shadow-sm"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">{mode.label}</span>
        </button>
      ))}
      </div>
    </div>
  );
}
