import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PipoMascot from "./PipoMascot";

interface LoadingPageProps {
  onLoadingComplete: () => void;
}

type LoadingPhase = "intro" | "loading" | "transition" | "outro";

function RoadIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 24C4 24 8 20 16 20C24 20 28 24 28 24" stroke="#C5B8A5" strokeWidth="4" strokeLinecap="round"/>
      <path d="M6 20C6 20 10 16 16 16C22 16 26 20 26 20" stroke="#D4C9B8" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="10" cy="22" r="2" fill="#A89F8C"/>
      <circle cx="16" cy="18" r="1.5" fill="#A89F8C"/>
      <circle cx="22" cy="22" r="2" fill="#A89F8C"/>
      <path d="M8 14L10 12M14 10L16 8M22 14L24 12" stroke="#B8E0D2" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function HouseIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 6L6 18H10V32H30V18H34L20 6Z" fill="#F5E6D3"/>
      <path d="M20 6L6 18H10V32H30V18H34L20 6Z" stroke="#D4A574" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M20 4L4 18" stroke="#E8D4BE" strokeWidth="3" strokeLinecap="round"/>
      <path d="M20 4L36 18" stroke="#E8D4BE" strokeWidth="3" strokeLinecap="round"/>
      <rect x="16" y="22" width="8" height="10" rx="1" fill="#8D6E63"/>
      <circle cx="22" cy="27" r="1" fill="#FFD54F"/>
      <rect x="12" y="14" width="5" height="5" rx="1" fill="#B8E0D2" stroke="#8ECFBC" strokeWidth="1"/>
      <rect x="23" y="14" width="5" height="5" rx="1" fill="#B8E0D2" stroke="#8ECFBC" strokeWidth="1"/>
      <path d="M18 5L18 2" stroke="#D4A574" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 2H20" stroke="#D4A574" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="28" cy="10" r="3" fill="#FFE082"/>
      <path d="M8 32H32" stroke="#C5B8A5" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function RunningPipo({ className }: { className?: string }) {
  return (
    <motion.div 
      className={className}
      animate={{ 
        y: [0, -2, 0, -2, 0],
        rotate: [-2, 2, -2, 2, -2]
      }}
      transition={{ 
        duration: 0.4, 
        repeat: Infinity, 
        ease: "easeInOut"
      }}
    >
      <PipoMascot size="small" isRunning={true} />
    </motion.div>
  );
}

const gentleTips = [
  "Take a breath, you're doing okay.",
  "There's no rush.",
  "Little steps are enough.",
  "You can take your time.",
  "It's okay to start small.",
  "We'll get there together.",
];

export default function LoadingPage({ onLoadingComplete }: LoadingPageProps) {
  const [phase, setPhase] = useState<LoadingPhase>("intro");
  const [progress, setProgress] = useState(0);
  const [textIndex, setTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [tipIndex, setTipIndex] = useState(0);
  const [tipVisible, setTipVisible] = useState(true);
  
  const introTexts = ["hi.", "i'm pipo.", "let's start today together."];

  useEffect(() => {
    if (phase === "intro") {
      let charIndex = 0;
      const text = introTexts[textIndex];
      const typingInterval = setInterval(() => {
        setCurrentText(text.slice(0, charIndex + 1));
        charIndex++;
        if (charIndex === text.length) {
          clearInterval(typingInterval);
          setTimeout(() => {
            if (textIndex < introTexts.length - 1) {
              setTextIndex(prev => prev + 1);
              setCurrentText("");
            } else {
              setTimeout(() => setPhase("loading"), 1000);
            }
          }, 1500);
        }
      }, 100);
      return () => clearInterval(typingInterval);
    }
  }, [phase, textIndex]);

  useEffect(() => {
    if (phase === "loading") {
      const interval = setInterval(() => {
        setProgress(prev => {
          const next = prev + 0.5;
          if (next >= 100) {
            clearInterval(interval);
            setTimeout(() => setPhase("transition"), 500);
            return 100;
          }
          return next;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === "loading" && progress < 100) {
      const tipRotationInterval = setInterval(() => {
        setTipVisible(false);
        setTimeout(() => {
          setTipIndex(prev => (prev + 1) % gentleTips.length);
          setTipVisible(true);
        }, 300);
      }, 6000);
      return () => clearInterval(tipRotationInterval);
    }
  }, [phase, progress]);

  useEffect(() => {
    if (phase === "transition") {
      const timer = setTimeout(() => {
        setPhase("outro");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === "outro") {
      const timer = setTimeout(() => {
        onLoadingComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [phase, onLoadingComplete]);

  const pipoPosition = Math.min(progress, 100);

  return (
    <AnimatePresence mode="wait">
      {phase !== "outro" && (
        <motion.div 
          key="loading-container"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FDF6E3] overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          <AnimatePresence mode="wait">
            {phase === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="flex flex-col items-center justify-center gap-2"
          >
            <div className="mb-4">
              <PipoMascot size="large" isIdle={true} className="opacity-90" />
            </div>
            
            <h1 className="font-bold text-[#5D4037] lowercase tracking-tight mb-4 text-[30px]">PIPO</h1>
            
            <div className="h-8">
              <p className="text-2xl text-[#8D6E63] font-medium text-center">
                {currentText}
              </p>
            </div>
          </motion.div>
        )}

        {phase === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-sm px-6 flex flex-col items-center justify-center"
          >
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[#8D6E63] text-lg font-medium mb-32 text-center"
            >
              On my way home...
            </motion.p>
            
            <div className="w-full relative">
              <div className="absolute -left-2 bottom-1/2 translate-y-1/2 z-10">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <RoadIcon />
                </motion.div>
              </div>
              
              <div className="absolute -right-3 bottom-1/2 translate-y-1/2 z-10">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <HouseIcon />
                </motion.div>
              </div>
              
              <div className="relative mx-8">
                <div 
                  className="absolute z-20 pointer-events-none"
                  style={{ 
                    left: `calc(${pipoPosition}% - 20px)`,
                    bottom: "calc(100% + 4px)",
                    transition: "left 0.1s linear"
                  }}
                >
                  <RunningPipo />
                </div>
                
                <div className="w-full h-5 bg-[#E8DFD0] rounded-full overflow-hidden border-2 border-[#D4C9B8] shadow-inner relative">
                  <div 
                    className="absolute inset-0 opacity-30"
                    style={{
                      backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 8px, #C5B8A5 8px, #C5B8A5 10px)"
                    }}
                  />
                  
                  <motion.div
                    className="h-full rounded-full relative overflow-hidden"
                    style={{ 
                      width: `${progress}%`,
                      background: "linear-gradient(90deg, #C5B8A5 0%, #A89F8C 50%, #8D8478 100%)"
                    }}
                    transition={{ ease: "linear" }}
                  >
                    <div 
                      className="absolute inset-0 opacity-40"
                      style={{
                        backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 12px, rgba(255,255,255,0.3) 12px, rgba(255,255,255,0.3) 14px)"
                      }}
                    />
                  </motion.div>
                </div>
              </div>
            </div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.5 }}
              className="text-[#A89F8C] text-xs mt-4 font-medium"
            >
              {Math.round(progress)}%
            </motion.p>
            
            <div className="h-8 mt-6 flex items-center justify-center">
              <motion.p
                key={tipIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: tipVisible ? 0.7 : 0 }}
                transition={{ duration: 0.3 }}
                className="text-[#8D7B6A] text-sm text-center font-medium"
              >
                {gentleTips[tipIndex]}
              </motion.p>
            </div>
          </motion.div>
        )}

        {phase === "transition" && (
          <motion.div
            key="transition"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8 } }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            >
              <PipoMascot size="large" isIdle={true} />
            </motion.div>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-[#5D4037] text-xl font-medium"
            >
              Home sweet home!
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
