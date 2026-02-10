import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { StarEvent, StarProgress } from "@shared/schema";
import { ArrowLeft, Star } from "lucide-react";
import { useLocation } from "wouter";
import { useMemo } from "react";

export default function StarSky() {
  const [, setLocation] = useLocation();
  const { data: progress } = useQuery<StarProgress>({
    queryKey: ["/api/stars/progress"],
  });

  const { data: events = [] } = useQuery<StarEvent[]>({
    queryKey: ["/api/stars/events"],
  });

  const totalStars = progress?.totalStars || 0;

  const stars = useMemo(() => {
    return Array.from({ length: totalStars }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 4, // Larger stars for better visualization
      delay: Math.random() * 5,
      duration: 2 + Math.random() * 4,
      color: i % 5 === 0 ? '#FEF3C7' : i % 3 === 0 ? '#E0E7FF' : '#FFFFFF', // Variation in star colors
      glow: i % 4 === 0,
    }));
  }, [totalStars]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020617] via-[#0f172a] to-[#1e1b4b] relative overflow-hidden flex flex-col items-center">
      {/* Background Nebula Effect */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[120px]" />
      </div>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setLocation("/menu")}
        className="absolute top-6 left-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 z-50 shadow-lg"
      >
        <ArrowLeft size={24} />
      </motion.button>

      {/* The Starry Sky */}
      <div className="absolute inset-0 z-0">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute flex items-center justify-center"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
              ease: "easeInOut"
            }}
          >
            <Star 
              size={star.size} 
              fill={star.color} 
              color={star.color}
              className={star.glow ? "drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" : ""}
            />
          </motion.div>
        ))}
      </div>

      {/* Floating UI Elements */}
      <div className="relative z-10 w-full max-w-lg px-6 pt-24 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2 mb-12"
        >
          <h1 className="text-white text-4xl font-black tracking-tighter uppercase italic drop-shadow-lg">
            Starry Sky
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-transparent via-yellow-400 to-transparent mx-auto rounded-full" />
          <p className="text-indigo-200/60 text-xs font-medium uppercase tracking-[0.2em]">
            Your Journey in the Cosmos
          </p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col items-center shadow-2xl relative overflow-hidden group"
        >
          {/* Decorative Corner Sparkles */}
          <div className="absolute top-2 left-2 text-yellow-400/20 group-hover:text-yellow-400/40 transition-colors">✨</div>
          <div className="absolute bottom-2 right-2 text-yellow-400/20 group-hover:text-yellow-400/40 transition-colors">✨</div>

          <div className="relative mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="w-32 h-32 rounded-full border border-dashed border-white/20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            />
            <div className="text-5xl relative z-10 filter drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]">
              ⭐
            </div>
          </div>
          
          <div className="text-center">
            <span className="text-white text-5xl font-black block mb-1">
              {totalStars}
            </span>
            <span className="text-indigo-200/40 text-[10px] font-bold uppercase tracking-widest">
              Stars Collected
            </span>
          </div>
        </motion.div>

        {/* Milestone Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <p className="text-white/60 text-sm font-medium px-8 leading-relaxed">
            {totalStars === 0 
              ? "Your sky is waiting for its first light. Complete a mission to earn your first star!"
              : totalStars < 10 
              ? "A beautiful start to your constellation. Keep going!"
              : "Your sky is shining brighter every day. You're doing amazing!"}
          </p>
        </motion.div>
      </div>

      {/* Bottom Gradient for readability if content extends */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#1e1b4b] to-transparent pointer-events-none" />
    </div>
  );
}
