import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { AspectRatio } from './ui/aspect-ratio';
import BottomNavigation from './BottomNavigation';
import { MENU_BUTTON_LAYOUT } from './MainMenuLayout';
import { ShoppingCart, CalendarCheck, Sun, Moon, Star } from 'lucide-react';
import { useStarProgress } from '../hooks/use-star-progress';

function CheckInButton({ onClick }: { onClick: () => void }) {
  const t = useTranslation();
  return (
    <motion.button
      className="absolute bottom-[15%] right-[5%] z-40 bg-indigo-500 text-white p-[clamp(0.75rem,3vw,1rem)] rounded-full shadow-2xl flex items-center justify-center border-4 border-white/50 active:scale-95 transition-all touch-target"
      whileHover={{ scale: 1.1, rotate: 5 }}
      onClick={onClick}
      aria-label={t.account.dailyCheckIn}
    >
      <CalendarCheck className="icon-responsive-lg" />
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute -top-[5%] -right-[5%] w-[20%] h-[20%] min-w-[0.75rem] min-h-[0.75rem] bg-green-400 rounded-full border-2 border-white"
      />
    </motion.button>
  );
}

import DailyCheckIn from './DailyCheckIn';

function CheckInModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const t = useTranslation();
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-[4vw] safe-area-all">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-[min(28rem,95vw)] z-10">
            <DailyCheckIn />
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={onClose}
              className="mt-4 w-full bg-white/20 backdrop-blur-md border border-white/30 text-white py-3 rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-all"
            >
              {t.account.close}
            </motion.button>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

function ShopButton() {
  const [, setLocation] = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const t = useTranslation();

  return (
    <motion.button
      className="absolute top-[3%] right-[3%] z-20 bg-gradient-to-br from-[#FFD700] to-[#FFA500] p-[clamp(0.75rem,3vw,1rem)] rounded-[clamp(1rem,4vw,2rem)] shadow-[0_10px_20px_rgba(255,165,0,0.2),inset_0_2px_4px_rgba(255,255,255,0.4)] border-2 border-[#E6D5B8] flex items-center justify-center min-w-[clamp(5rem,20vw,6.25rem)] min-h-[clamp(4.5rem,18vw,5.625rem)] active:scale-95 transition-all touch-target safe-area-top"
      onClick={() => setLocation('/payment')}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ 
        scale: 1.05,
        boxShadow: "0 12px 24px rgba(255,215,0,0.3)"
      }}
      aria-label={t.mainMenu.shop}
    >
      {/* Royal Sparkle Effect on Hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-yellow-200 text-sm"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: Math.random(),
                }}
              >
                ✨
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10">
        <svg 
          width="48" 
          height="48" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="white" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="drop-shadow-sm"
        >
          {/* Treasure Chest Icon */}
          <path d="M4 11h16v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8z" />
          <path d="M4 11V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
          <path d="M12 11v4" />
          <path d="M8 11v2" />
          <path d="M16 11v2" />
        </svg>
      </div>
      
      {/* Tap Effect: Royal Burst */}
      <motion.div
        className="absolute inset-0 rounded-[2rem] bg-white pointer-events-none"
        initial={{ opacity: 0 }}
        whileTap={{ opacity: [0, 0.2, 0] }}
        transition={{ duration: 0.4 }}
      />
    </motion.button>
  );
}

function TodosButton() {
  const [, setLocation] = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const t = useTranslation();
  const layout = MENU_BUTTON_LAYOUT.todos;

  return (
    <motion.button
      className="absolute cursor-pointer bg-transparent border-0 outline-none focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 rounded overflow-hidden"
      style={{ left: layout.left, top: layout.top, width: layout.width, height: layout.height }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      animate={isHovered ? {
        rotate: [0, -4, 4, -4, 4, -2, 2, 0],
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
      } : { rotate: 0 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setLocation('/todos')}
      aria-label={t.nav.todos}
      tabIndex={0}
    />
  );
}

function CalendarButton() {
  const [, setLocation] = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const t = useTranslation();
  const layout = MENU_BUTTON_LAYOUT.calendar;

  return (
    <motion.button
      className="absolute cursor-pointer bg-transparent border-0 outline-none focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 rounded overflow-hidden"
      style={{ left: layout.left, top: layout.top, width: layout.width, height: layout.height }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      animate={isHovered ? {
        rotate: [0, -4, 4, -4, 4, -2, 2, 0],
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
      } : { rotate: 0 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setLocation('/calendar')}
      aria-label={t.nav.calendar}
      tabIndex={0}
    />
  );
}

function RemindersButton() {
  const [, setLocation] = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const t = useTranslation();
  const layout = MENU_BUTTON_LAYOUT.reminders;

  return (
    <motion.button
      className="absolute cursor-pointer bg-transparent border-0 outline-none focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 rounded overflow-hidden touch-target"
      style={{ left: layout.left, top: layout.top, width: layout.width, height: layout.height }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      animate={isHovered ? {
        rotate: [0, -4, 4, -4, 4, -2, 2, 0],
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
      } : { rotate: 0 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setLocation('/reminders')}
      aria-label={t.nav.reminders}
      tabIndex={0}
    />
  );
}

function JournalButton() {
  const [, setLocation] = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const t = useTranslation();
  const layout = MENU_BUTTON_LAYOUT.journal;

  return (
    <motion.button
      className="absolute cursor-pointer bg-transparent border-0 outline-none focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 rounded overflow-hidden"
      style={{ left: layout.left, top: layout.top, width: layout.width, height: layout.height }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      animate={isHovered ? {
        rotate: [0, -4, 4, -4, 4, -2, 2, 0],
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
      } : { rotate: 0 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setLocation('/journal')}
      aria-label={t.nav.journal}
      tabIndex={0}
    />
  );
}

function AccountButton() {
  const [, setLocation] = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const t = useTranslation();
  const layout = MENU_BUTTON_LAYOUT.account;

  return (
    <motion.button
      className="absolute cursor-pointer bg-transparent border-0 outline-none focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 rounded overflow-hidden"
      style={{ left: layout.left, top: layout.top, width: layout.width, height: layout.height }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      animate={isHovered ? {
        rotate: [0, -4, 4, -4, 4, -2, 2, 0],
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
      } : { rotate: 0 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setLocation('/account')}
      aria-label={t.nav.account}
      tabIndex={0}
    />
  );
}

function MenuButton() {
  const [, setLocation] = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const [isNight, setIsNight] = useState(false);
  const t = useTranslation();

  useEffect(() => {
    const hour = new Date().getHours();
    setIsNight(hour < 6 || hour >= 18);
  }, []);

  const Icon = isNight ? Moon : Sun;

  return (
    <motion.button
      className="absolute top-[3%] left-[3%] z-20 bg-[#FDF6E3] border-2 border-[#E6D5B8] p-[clamp(0.75rem,3vw,1rem)] rounded-[clamp(1rem,4vw,2rem)] shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_10px_20px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center min-w-[clamp(10rem,45vw,13.75rem)] min-h-[clamp(4.5rem,18vw,5.625rem)] active:scale-95 transition-all touch-target safe-area-top"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      animate={{
        boxShadow: [
          "0 10px 20px rgba(0,0,0,0.1), 0 0 0px rgba(253,246,227,0)",
          "0 10px 20px rgba(0,0,0,0.1), 0 0 20px rgba(253,246,227,0.4)",
          "0 10px 20px rgba(0,0,0,0.1), 0 0 0px rgba(253,246,227,0)"
        ]
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setLocation('/')}
      aria-label={t.account.todayBoard}
      tabIndex={0}
    >
      <div className="absolute -top-[10%] -right-[8%]">
        <Icon className={`icon-responsive-lg ${isNight ? 'text-indigo-400' : 'text-amber-400'} drop-shadow-md`} />
      </div>
      <div className="flex flex-col items-center gap-[0.25vh]">
        <div className="text-center">
          <h2 className="font-bold text-[#8B7E66] mb-[0.25vh] font-serif tracking-tight text-responsive-xl">
            {t.account.todayBoard}
          </h2>
          <p className="font-medium text-[#A69984] tracking-tight italic opacity-80 text-responsive-xs">
            {t.account.todayBegins}
          </p>
        </div>
      </div>
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -bottom-[10%] -left-[8%] text-yellow-400 pointer-events-none text-responsive-xl"
          >
            ✨
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function ChatButton() {
  const [, setLocation] = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const t = useTranslation();
  const layout = MENU_BUTTON_LAYOUT.chat;

  return (
    <motion.button
      className="absolute cursor-pointer bg-transparent border-0 outline-none focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 rounded overflow-hidden"
      style={{ left: layout.left, top: layout.top, width: layout.width, height: layout.height }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      animate={isHovered ? {
        rotate: [0, -4, 4, -4, 4, -2, 2, 0],
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
      } : { rotate: 0 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setLocation('/chat')}
      aria-label={t.nav.chat}
      tabIndex={0}
    />
  );
}

function MissionsPanel() {
  const { missions } = useStarProgress();
  if (!missions || missions.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="absolute top-[18%] right-[3%] z-20 bg-[#FDF6E3] p-4 rounded-2xl border-2 border-[#E6D5B8] w-[clamp(9rem,22vw,13rem)] shadow-lg"
    >
      <div className="flex items-center gap-2 mb-2">
        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
        <h3 className="text-[#8B7E66] font-bold text-[10px] uppercase tracking-wider">Today's Missions</h3>
      </div>
      <div className="space-y-1.5">
        {missions.map((m: any) => (
          <div key={m.id} className="flex items-center justify-between gap-2">
            <span className={`text-[9px] font-medium leading-tight transition-colors ${m.isCompleted ? 'text-green-600' : 'text-[#A69984]'}`}>
              {m.title}
            </span>
            <div className={`shrink-0 w-3.5 h-3.5 rounded-full flex items-center justify-center border ${m.isCompleted ? 'bg-green-500 border-green-500 text-[7px]' : 'border-[#E6D5B8] text-[7px] text-[#A69984]'}`}>
              {m.isCompleted ? '⭐' : `${m.currentCount}`}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function MainMenu() {
  const [, setLocation] = useLocation();
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);

  const handleTabChange = (tab: string) => {
    setLocation(`/${tab}`);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* Background Image filling whole screen */}
      <div className="absolute inset-0">
        <img 
          src="/assets/main-menu-new.png" 
          alt="Pipo's Room" 
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center center' }}
        />
        
        {/* Clickable Hotspots/Buttons directly on top of the full-screen image */}
        {/* 1. 📝 TOMBOL TODOS */}
        <TodosButton />

        {/* 2. 📅 TOMBOL CALENDAR */}
        <CalendarButton />

        {/* 3. 🔔 TOMBOL REMINDERS */}
        <RemindersButton />

        {/* 4. 📔 TOMBOL JOURNAL */}
        <JournalButton />

        {/* 5. 👤 TOMBOL ACCOUNT */}
        <AccountButton />

        {/* 6. ☰ TOMBOL MENU */}
        <MenuButton />

        {/* 7. 💬 TOMBOL CHAT */}
        <ChatButton />

        {/* 8. 🛒 TOMBOL SHOP */}
        <ShopButton />

        {/* 9. ⭐ TOMBOL STAR SKY */}
        <motion.button
          className="absolute top-[3%] left-[45%] z-20 bg-white/20 backdrop-blur-md p-[clamp(0.75rem,3vw,1rem)] rounded-full border-2 border-white/30 flex items-center justify-center active:scale-95 transition-all touch-target"
          onClick={() => setLocation('/stars')}
          whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.4)" }}
        >
          <Star className="text-yellow-400 fill-yellow-400 w-8 h-8" />
        </motion.button>

        {/* 10. Missions Panel */}
        <MissionsPanel />
      </div>

      {/* Daily Check-in Button */}
      <CheckInButton onClick={() => setIsCheckInOpen(true)} />

      {/* Check-in Modal */}
      <CheckInModal isOpen={isCheckInOpen} onClose={() => setIsCheckInOpen(false)} />

      <div className="absolute bottom-0 left-0 right-0 pb-safe z-50">
        <BottomNavigation activeTab="" onTabChange={handleTabChange} />
      </div>
    </div>
  );
}
