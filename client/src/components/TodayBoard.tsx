import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Bell, Heart, Star, Sparkles, Sun, MessageCircle } from "lucide-react";
import { Reminder, Todo } from "@shared/schema";
import { useStarProgress } from "../hooks/use-star-progress";
import ChatGPT_Image_Jan_13__2026__10_55_11_PM from "@assets/ChatGPT Image Jan 13, 2026, 10_55_11 PM.png";

export default function TodayBoard() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: reminders = [] } = useQuery<Reminder[]>({ 
    queryKey: ["/api/reminders"] 
  });
  const { data: todos = [] } = useQuery<Todo[]>({ 
    queryKey: ["/api/todos"] 
  });

  const completeTodoMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: true })
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
    }
  });

  const completeReminderMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/reminders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: true })
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
    }
  });

  const todayItems = [
    ...reminders.filter(r => !r.isCompleted).map(r => ({ 
      id: `r-${r.id}`, 
      rawId: Number(r.id),
      text: r.title, 
      subtitle: "That helped.",
      icon: Bell, 
      type: 'reminder' as const 
    })),
    ...todos.filter(t => !t.isCompleted).map(t => ({ 
      id: `t-${t.id}`, 
      rawId: Number(t.id),
      text: t.title, 
      subtitle: "Nice.",
      icon: CheckCircle2, 
      type: 'todo' as const 
    })),
    ...(reminders.length === 0 && todos.length === 0 ? [{
      id: 'demo-1',
      rawId: 0,
      text: "Drink water",
      subtitle: "Stay hydrated!",
      icon: Heart,
      type: 'todo' as const
    }] : [])
  ].slice(0, 1);

  const handleComplete = (item: typeof todayItems[0]) => {
    if (item.type === 'todo') {
      completeTodoMutation.mutate(item.rawId);
    } else {
      completeReminderMutation.mutate(item.rawId);
    }
    fetch("/api/stars/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        eventType: item.type === 'todo' ? "task_completed" : "reminder_completed", 
        amount: 1, 
        metadata: { id: item.rawId } 
      })
    });
  };

  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());

  const quickSuggestions = [
    { id: 's1', text: "Brush teeth", subtitle: "Feeling fresh.", icon: Sparkles, type: 'todo' as const, emoji: "🦷", category: "Easy Things", vibeTag: "Easy", color: "bg-[#B8E0D2] text-[#2D4A3E]" }, // Mint
    { id: 's2', text: "Drink water", subtitle: "Stay hydrated!", icon: Heart, type: 'todo' as const, emoji: "🥛", category: "Important Things", vibeTag: "Important", color: "bg-[#F7D9C4] text-[#5D4E37]" }, // Peach
    { id: 's3', text: "Play outside", subtitle: "Sun is out!", icon: Sun, type: 'todo' as const, emoji: "🌤️", category: "Fun Things", vibeTag: "Fun", color: "bg-[#C5D5FB] text-[#2D3A5E]" }, // soft blue
    { id: 's4', text: "Read a book", subtitle: "Story time!", icon: MessageCircle, type: 'todo' as const, emoji: "📚", category: "Fun Things", vibeTag: "Fun", color: "bg-[#E0BBE4] text-[#4A2D4E]" }, // Lavender
  ];

  const handleToggleSuggestion = (id: string) => {
    setSelectedSuggestions(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const addQuickTodoMutation = useMutation({
    mutationFn: async (suggestions: typeof quickSuggestions) => {
      const userRes = await fetch('/api/user/current');
      const currentUser = await userRes.json();
      const userId = currentUser?.id || "default-user";

      const promises = suggestions.map(s => 
        fetch(`/api/todos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            title: s.text,
            isCompleted: false,
            emoji: s.emoji,
            category: s.category,
            vibeTag: s.vibeTag,
            userId: userId,
            priority: "medium"
          })
        })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      setLocation('/todos');
    }
  });

  const handleVisitSpace = () => {
    if (selectedSuggestions.size > 0) {
      const selectedItems = quickSuggestions.filter(s => selectedSuggestions.has(s.id));
      addQuickTodoMutation.mutate(selectedItems);
    } else {
      setLocation('/menu');
    }
  };

  const { progress: starProgress, missions = [] } = useStarProgress();

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden relative font-sans">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src={ChatGPT_Image_Jan_13__2026__10_55_11_PM} 
          alt="Background" 
          className="w-full h-full object-cover opacity-60 grayscale-[0.2]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-8 pb-4 shrink-0">
        <h1 className="text-2xl font-black text-white tracking-tight drop-shadow-md">Today Board</h1>
        <div className="bg-white/10 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/20 text-white font-bold flex items-center gap-1.5 shadow-lg">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm">{starProgress?.totalStars || 0}</span>
        </div>
      </header>


      {/* Main Content (Non-Scrollable for compactness) */}
      <main className="relative z-10 flex-1 px-6 space-y-6 pb-6 overflow-y-auto flex flex-col justify-start pt-4">
        {/* Missions Section */}
        {missions.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 pl-1 text-center">Today's Missions</h3>
            <div className="flex flex-col gap-4">
              {missions.map((m: any) => (
                <div key={m.id} className="bg-white/10 backdrop-blur-2xl px-6 py-4 rounded-3xl border border-white/20 flex items-center justify-between shadow-lg">
                  <p className="text-sm font-bold text-white truncate">{m.title}</p>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${m.isCompleted ? 'bg-green-500/40 border-green-400 text-white' : 'bg-white/5 border-white/20 text-white/40'}`}>
                    {m.isCompleted ? <span className="text-sm">✨</span> : <span className="text-xs font-black">{m.currentCount}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Section */}
        <div className="space-y-2">
          <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50 pl-1 text-center">Gentle Suggestion</h3>
          <AnimatePresence mode="wait">
            {todayItems.length > 0 ? (
              todayItems.map((item) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  onClick={() => handleComplete(item)}
                  className="w-full bg-gradient-to-br from-amber-400 to-orange-500 p-3.5 rounded-3xl flex items-center gap-3 shadow-xl active:scale-[0.98] transition-all border border-white/20"
                >
                  <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-white shrink-0">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <h2 className="text-sm font-black text-amber-950 truncate leading-none mb-0.5">{item.text}</h2>
                    <p className="text-[9px] font-bold text-amber-900/60 uppercase tracking-widest">{item.subtitle}</p>
                  </div>
                </motion.button>
              ))
            ) : (
              <div className="text-center py-2 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-xs font-bold text-white">All done for now! 🌈</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Suggestions */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 pl-1 text-center">Quick Picks</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickSuggestions.slice(0, 4).map((s) => (
              <button
                key={s.id}
                onClick={() => handleToggleSuggestion(s.id)}
                className={`flex items-center gap-3 p-4 rounded-3xl border-2 transition-all active:scale-[0.98] shadow-md ${
                  selectedSuggestions.has(s.id)
                    ? "bg-white border-white scale-[1.02] shadow-xl"
                    : `${s.color} border-transparent`
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  selectedSuggestions.has(s.id) ? "bg-indigo-100 text-indigo-600" : "bg-white/30 text-inherit"
                }`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className={`text-xs font-black truncate leading-tight ${
                    selectedSuggestions.has(s.id) ? "text-black" : "text-inherit"
                  }`}>{s.text}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 px-6 pt-2 pb-8 shrink-0 flex flex-col items-center">
        <div className="mb-2">
          <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.3em]">You can come back later~</span>
        </div>
        <button
          onClick={handleVisitSpace}
          className="w-full bg-white text-black py-3.5 rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all"
        >
          {selectedSuggestions.size > 0 ? "Let's Start!" : "Visit Space"}
        </button>
      </footer>
    </div>
  );
}
