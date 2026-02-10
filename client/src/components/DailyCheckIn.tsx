import { motion, AnimatePresence } from "framer-motion";
import { Star, Coins, CheckCircle2, Gift, Sparkles } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { WeeklyLogin } from "@shared/schema";
import { useState } from "react";

export default function DailyCheckIn() {
  const queryClient = useQueryClient();
  const [showConfetti, setShowConfetti] = useState(false);
  
  const { data: progress, isLoading } = useQuery<WeeklyLogin>({
    queryKey: ["/api/user/weekly-progress"],
  });

  const claimMutation = useMutation({
    mutationFn: async (rewardType: string) => {
      const res = await fetch("/api/user/claim-reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardType }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/weekly-progress"] });
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    },
  });

  if (isLoading || !progress) return null;

  const loginCount = progress.loginDays.length;
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  
  const row1 = [0, 1, 2, 3]; // Day 1-4
  const row2 = [4, 5, 6];    // Day 5-7

  const rewards = [
    { 
      type: 'boost2d',
      day: 2, 
      label: "20% Star Boost", 
      icon: Star, 
      color: "text-yellow-400", 
      bg: "bg-yellow-400/20",
      unlocked: loginCount >= 2,
      claimed: (progress.rewardsClaimed as any)?.boost2d 
    },
    { 
      type: 'coins6d',
      day: 6, 
      label: "10 Pipo Coins", 
      icon: Coins, 
      color: "text-amber-500", 
      bg: "bg-amber-500/20",
      unlocked: loginCount >= 6,
      claimed: (progress.rewardsClaimed as any)?.coins6d
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden"
    >
      <AnimatePresence>
        {showConfetti && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center"
          >
            <Sparkles className="w-24 h-24 text-yellow-400 animate-bounce" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight leading-none">WEEKLY QUEST</h2>
          <p className="text-white/50 text-xs font-bold mt-1 uppercase tracking-widest">Day {loginCount} of 7</p>
        </div>
        <div className="bg-white/20 p-2 rounded-2xl border border-white/10">
          <Gift className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* 2-Row Grid Layout */}
      <div className="space-y-3 mb-8">
        {/* Row 1: Day 1-4 */}
        <div className="flex gap-2 h-16">
          {row1.map((i) => (
            <div 
              key={i} 
              className={`rounded-2xl flex items-center justify-center border-2 transition-all relative ${
                i === 3 ? "flex-[1.5]" : "flex-1"
              } ${
                i < loginCount 
                ? "bg-indigo-500 border-indigo-400 shadow-lg shadow-indigo-500/30" 
                : "bg-white/5 border-white/10"
              }`}
            >
              {i < loginCount ? (
                <CheckCircle2 className="w-6 h-6 text-white" />
              ) : (
                <span className="text-white/20 font-black text-lg">{days[i]}</span>
              )}
              {i === 1 && (
                <div className="absolute -top-1 -right-1">
                  <Star className={`w-4 h-4 ${loginCount > 1 ? 'text-yellow-400 fill-yellow-400' : 'text-white/10'}`} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Row 2: Day 5-7 */}
        <div className="flex gap-2 h-16">
          {row2.map((i) => (
            <div 
              key={i} 
              className={`rounded-2xl flex items-center justify-center border-2 transition-all relative ${
                i === 6 ? "flex-[1.8]" : "flex-1"
              } ${
                i < loginCount 
                ? "bg-indigo-500 border-indigo-400 shadow-lg shadow-indigo-500/30" 
                : "bg-white/5 border-white/10"
              }`}
            >
              {i < loginCount ? (
                <CheckCircle2 className="w-6 h-6 text-white" />
              ) : (
                <span className="text-white/20 font-black text-lg">{days[i]}</span>
              )}
              {i === 5 && (
                <div className="absolute -top-1 -right-1">
                  <Coins className={`w-4 h-4 ${loginCount > 5 ? 'text-amber-500 fill-amber-500' : 'text-white/10'}`} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Rewards Section */}
      <div className="space-y-3">
        {rewards.map((reward, i) => (
          <motion.div 
            key={i}
            whileHover={reward.unlocked && !reward.claimed ? { scale: 1.02 } : {}}
            className={`flex items-center gap-4 p-4 rounded-3xl border-2 transition-all ${
              reward.claimed 
              ? "bg-white/5 border-white/10 opacity-50" 
              : reward.unlocked 
              ? "bg-white/20 border-white/30 shadow-xl" 
              : "bg-black/20 border-white/5 opacity-40"
            }`}
          >
            <div className={`p-3 rounded-2xl ${reward.bg} ${reward.color}`}>
              <reward.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-white font-black text-sm uppercase tracking-tight">{reward.label}</p>
              <p className="text-white/40 text-[10px] font-bold uppercase">Goal: Day {reward.day}</p>
            </div>
            
            {reward.claimed ? (
              <div className="text-white/30 font-black text-xs uppercase italic">Collected</div>
            ) : (
              <button
                disabled={!reward.unlocked || claimMutation.isPending}
                onClick={() => claimMutation.mutate(reward.type)}
                className={`px-6 py-2 rounded-xl font-black text-xs uppercase tracking-tighter transition-all ${
                  reward.unlocked 
                  ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-lg active:scale-90" 
                  : "bg-white/5 text-white/20 border border-white/10"
                }`}
              >
                {reward.unlocked ? "CLAIM!" : "LOCKED"}
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
