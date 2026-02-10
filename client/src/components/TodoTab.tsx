import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Todo } from "@shared/schema";
import { ArrowLeft, Sparkles, Heart, Sun, Star, Cloud, Music, Book, Palette, Plus, ListFilter, Pencil, Check, X, Trash2, Clock, Smile, Coffee, Pizza, Bike, Ghost, Moon, BookOpen } from "lucide-react";

const EMOJI_PICKER = ["🌤️", "🎈", "🌱", "💛", "🎮", "😴", "✨", "🍎", "🎨", "📚", "🥛", "🦷"];

const VIBE_TAGS = [
  { label: "Easy", emoji: "🌤️", value: "easy" },
  { label: "Fun", emoji: "🎈", value: "fun" },
  { label: "Important", emoji: "🌱", value: "important" },
  { label: "Kind", emoji: "💛", value: "kind" },
  { label: "Short", emoji: "😴", value: "short" }
];

const CATEGORIES = [
  { name: "Easy Things", emoji: "🌤️", color: "from-[#E0F2FE] to-[#F0F9FF]", hint: "Fun and quick 🎈" },
  { name: "Fun Things", emoji: "🎈", color: "from-[#FCE7F3] to-[#FDF2F8]", hint: "Feels fresh ✨" },
  { name: "Important Things", emoji: "🌱", color: "from-[#DCFCE7] to-[#F0FDF4]", hint: "Good for your body 💪" },
  { name: "Helping Others", emoji: "💛", color: "from-[#F3E8FF] to-[#FAF5FF]", hint: "Kind and helpful 💖" },
  { name: "Free Play", emoji: "🎮", color: "from-[#FEF3C7] to-[#FFFBEB]", hint: "Your time 🎮" }
];

const CATEGORY_MAP: Record<string, typeof CATEGORIES[0]> = CATEGORIES.reduce((acc, cat) => ({
  ...acc,
  [cat.name]: cat
}), {} as Record<string, typeof CATEGORIES[0]>);

const DEFAULT_CATEGORY = { name: "Just a thing", emoji: "✨", color: "from-white/40 to-white/20", hint: "Nice" };
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import ChatGPT_Image_Jan_13__2026__10_55_11_PM from "@assets/ChatGPT Image Jan 13, 2026, 10_55_11 PM.png";

const TASK_ICONS: Record<string, any> = {
  "Brush teeth": Sparkles,
  "Drink water": Heart,
  "Play outside": Sun,
  "Help someone": Heart,
  "Homework": Book,
  "Draw": Palette,
  "Listen to music": Music,
  "Rest": Cloud,
  "default": Star
};

const MOOD_HINTS: Record<string, string> = {
  "Brush teeth": "Fresh start",
  "Drink water": "Feels good",
  "Play outside": "Fun",
  "Help someone": "Kind",
  "Homework": "Short",
  "Draw": "Creative",
  "Listen to music": "Relaxing",
  "Rest": "Peaceful",
  "default": "Nice"
};

const PASTEL_COLORS = [
  "bg-pink-100/80",
  "bg-blue-100/80",
  "bg-purple-100/80",
  "bg-green-100/80",
  "bg-yellow-100/80",
  "bg-orange-100/80"
];

function TaskCard({ todo, isEditMode, onComplete, onDelete }: { 
  todo: Todo; 
  isEditMode: boolean; 
  onComplete: (todo: Todo) => void;
  onDelete: (id: string) => void;
}) {
  const categoryData = CATEGORY_MAP[todo.category || ""] || DEFAULT_CATEGORY;
  const [completed, setCompleted] = useState(false);

  return (
    <motion.div
      layout
      layoutId={todo.id}
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{ 
        scale: completed ? 1.02 : 1,
        opacity: 1, 
        y: 0,
      }}
      exit={{ 
        scale: 0.8, 
        opacity: 0, 
        transition: { duration: 0.3, ease: "anticipate" } 
      }}
      whileTap={{ scale: 0.98 }}
      transition={{
        layout: { 
          type: "spring", 
          stiffness: 120, 
          damping: 24,
          mass: 1.2,
          restDelta: 0.001
        },
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 }
      }}
      className={`w-full backdrop-blur-md px-[clamp(1rem,4vw,1.25rem)] py-[clamp(0.75rem,3vw,1rem)] rounded-[clamp(1rem,4vw,1.5rem)] flex items-center gap-[clamp(0.5rem,2vw,0.75rem)] border border-white/40 shadow-sm relative overflow-hidden group transition-all duration-1000 ${
        completed 
          ? "bg-transparent border-transparent" 
          : `bg-gradient-to-br ${categoryData.color}`
      }`}
    >
      <AnimatePresence>
        {completed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
          >
            <Star className="w-[20%] h-[20%] max-w-16 max-h-16 text-yellow-300 fill-yellow-300 drop-shadow-[0_0_15px_rgba(253,224,71,0.8)] opacity-100" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`flex items-center gap-[clamp(0.75rem,3vw,1rem)] flex-1 transition-opacity duration-1000 ${completed ? 'opacity-0' : 'opacity-100'}`}>
        <div className="avatar-responsive-md rounded-full bg-white flex items-center justify-center text-responsive-2xl flex-shrink-0 shadow-[inset_0_0_10px_rgba(255,255,255,0.8)] border border-white/50">
          {todo.emoji || "✨"}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-col mb-[0.25vh]">
            <h3 className="text-responsive-lg font-bold text-gray-800 truncate">
              {todo.title}
            </h3>
            <span className="text-gray-500/80 text-responsive-xs font-medium">
              {categoryData.hint}
            </span>
          </div>
        </div>

        {!isEditMode ? (
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={() => {
              setCompleted(true);
              setTimeout(() => onComplete(todo), 1000);
            }}
            className="avatar-responsive-sm rounded-full bg-white/40 flex items-center justify-center border-2 border-white/60 text-gray-600 shadow-md hover:bg-white/60 transition-colors touch-target flex-shrink-0"
          >
            <div className="w-[50%] h-[50%] rounded-full border-[3px] border-gray-400/50" />
          </motion.button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onDelete(todo.id)}
            className="avatar-responsive-sm rounded-[clamp(0.5rem,2vw,1rem)] bg-red-400/80 flex items-center justify-center text-white shadow-lg touch-target flex-shrink-0"
          >
            <Trash2 className="icon-responsive-md" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

export default function TodoTab() {
  const [, setLocation] = useLocation();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [filterMode, setFilterMode] = useState<"active" | "completed">("active");
  const [timeRange, setTimeRange] = useState<"daily" | "weekly" | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const [selectedEmoji, setSelectedEmoji] = useState("✨");
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [taskCategory, setTaskCategory] = useState<string | null>(null);

  const { data: todos, isLoading } = useQuery<Todo[]>({
    queryKey: ["/api/todos"],
  });

  // Log tasks when they load
  if (todos) {
    console.log('TodoTab loaded tasks count:', todos.length);
  }

  // Fetch emoji presets
  const { data: customizations } = useQuery<any[]>({
    queryKey: ["/api/todos/customizations"],
  });

  const handleAddTask = async () => {
    if (newTaskTitle.trim()) {
      // Find preset emoji
      const preset = customizations?.find(c => c.taskTitle.toLowerCase() === newTaskTitle.trim().toLowerCase());
      const emojiToUse = preset ? preset.emoji : selectedEmoji;

      createTodoMutation.mutate({
        title: newTaskTitle.trim(),
        emoji: emojiToUse,
        vibeTag: selectedVibe,
        category: taskCategory
      });
    }
  };

  const createTodoMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/todos", { 
        ...data,
        userId: "default-user",
        isCompleted: false 
      });
      
      // Save emoji preference if customized
      if (selectedEmoji !== "✨") {
        await apiRequest("POST", "/api/todos/customizations", {
          taskTitle: data.title,
          emoji: selectedEmoji
        });
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/todos/customizations"] });
      setNewTaskTitle("");
      setSelectedEmoji("✨");
      setSelectedVibe(null);
      setTaskCategory(null);
      setShowAddForm(false);
    },
  });

  const deleteTodoMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/todos/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
    },
  });

  const updateTodoMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Todo> }) => {
      const response = await apiRequest("PATCH", `/api/todos/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      setEditingTodoId(null);
      setEditTitle("");
      setEditDescription("");
    },
  });

  const handleComplete = (todo: Todo) => {
    if (isEditMode) return;
    updateTodoMutation.mutate({
      id: todo.id,
      updates: { isCompleted: true }
    });
    // Trigger star reward
    fetch("/api/stars/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType: "task_completed", amount: 1, metadata: { taskId: todo.id } })
    });
  };

  const handleStartEdit = (todo: Todo) => {
    setEditingTodoId(todo.id);
    setEditTitle(todo.title);
    setEditDescription(todo.description || "");
  };

  const handleSaveEdit = () => {
    if (editingTodoId && editTitle.trim()) {
      updateTodoMutation.mutate({
        id: editingTodoId,
        updates: { 
          title: editTitle.trim(),
          description: editDescription.trim() || null
        }
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingTodoId(null);
    setEditTitle("");
    setEditDescription("");
  };

  const handleDelete = (todoId: string) => {
    deleteTodoMutation.mutate(todoId);
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    setEditingTodoId(null);
    setEditTitle("");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={ChatGPT_Image_Jan_13__2026__10_55_11_PM} 
            alt="Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
        </div>
        <div className="relative z-10 flex-1 flex items-center justify-center p-6">
          <div className="animate-pulse space-y-3 w-full max-w-sm">
            <div className="h-16 bg-white/20 rounded-2xl w-full"></div>
            <div className="h-16 bg-white/20 rounded-2xl w-full"></div>
            <div className="h-16 bg-white/20 rounded-2xl w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  const activeTodos = (todos as Todo[])?.filter(t => !t.isCompleted) || [];
  const completedTodos = (todos as Todo[])?.filter(t => t.isCompleted) || [];
  const totalTodayTasks = (todos as Todo[])?.length || 0;
  const completedTodayCount = completedTodos.length;
  const progressPercentage = totalTodayTasks > 0 ? (completedTodayCount / totalTodayTasks) * 100 : 0;

  const filteredTodos = filterMode === "completed" 
    ? completedTodos 
    : activeTodos.filter((todo: Todo) => 
        selectedCategory === "All" || todo.category === selectedCategory
      );

  return (
    <div className="flex flex-col h-screen relative overflow-hidden">
      {/* Background - Same as Today Board */}
      <div className="absolute inset-0 z-0">
        <img 
          src={ChatGPT_Image_Jan_13__2026__10_55_11_PM} 
          alt="Background" 
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://cdn.pixabay.com/photo/2016/03/31/14/47/penguin-1292831_1280.png";
          }}
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
      </div>

      {/* Header Area - Responsive with safe areas */}
      <div className="relative z-10 px-[4vw] pt-[max(env(safe-area-inset-top,0px),2.5vh)] pb-[1.5vh] flex-shrink-0">
        <div className="flex items-center gap-[clamp(0.5rem,2vw,0.75rem)]">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setLocation('/menu')}
            className="avatar-responsive-sm rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white active:bg-white/30 transition-all border border-white/30 shadow-lg touch-target flex-shrink-0"
          >
            <ArrowLeft className="icon-responsive-md" />
          </motion.button>
          <div className="flex-1 min-w-0">
            <h1 className="text-responsive-lg font-bold text-white drop-shadow-lg truncate">
              Things you can do 🌱
            </h1>
            <p className="text-white/60 text-responsive-xs truncate">
              {isEditMode ? "Tap a task to edit it" : "Take it slow"}
            </p>
          </div>
        </div>

        {/* Progress Bar Section - Responsive */}
        <div className="mt-[2vh] flex flex-col items-center w-full">
          <div className="w-full max-w-[min(24rem,90vw)] h-[clamp(1rem,3.5vw,1.5rem)] bg-white/10 rounded-full overflow-hidden border-2 border-white/20 shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 shadow-[0_0_15px_rgba(129,140,248,0.6)]"
            />
          </div>
          <div className="mt-[1vh] flex items-center gap-[clamp(0.375rem,1.5vw,0.5rem)]">
            <span className="text-responsive-xs font-black text-white/80 uppercase tracking-widest">
              Little Steps
            </span>
            <span className="text-responsive-xs font-bold text-white/60 tracking-wider">
              {completedTodayCount}/{totalTodayTasks} Things
            </span>
          </div>
        </div>

        {/* Action Buttons Row - Responsive */}
        <div className="flex items-center gap-[clamp(0.375rem,1.5vw,0.5rem)] mt-[1.5vh] flex-wrap">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-[clamp(0.375rem,1.5vw,0.5rem)] bg-white/25 backdrop-blur-md px-[clamp(0.75rem,3vw,1rem)] py-[clamp(0.375rem,1.5vw,0.5rem)] rounded-full text-white text-responsive-sm font-medium border border-white/30 shadow-md touch-target"
          >
            <Plus className="icon-responsive-sm" />
            Add Task
          </motion.button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-[clamp(0.375rem,1.5vw,0.5rem)] px-[clamp(0.5rem,2vw,0.75rem)] py-[clamp(0.375rem,1.5vw,0.5rem)] rounded-full text-responsive-sm border transition-all touch-target ${
                  filterMode === "completed" 
                    ? "bg-indigo-500/80 text-white border-indigo-400/50 shadow-lg" 
                    : "bg-white/15 text-white/80 border-white/20"
                }`}
              >
                <ListFilter className="icon-responsive-sm" />
                {filterMode === "active" ? "All Tasks" : "Completed"}
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white/95 backdrop-blur-xl border-white/20 rounded-[2rem] p-3 min-w-[220px] shadow-2xl z-[100]">
              <DropdownMenuItem 
                onClick={() => setFilterMode("active")}
                className="flex items-center gap-3 rounded-2xl p-4 cursor-pointer hover:bg-indigo-50 focus:bg-indigo-50 mb-1"
              >
                <Clock className="w-6 h-6 text-indigo-500" />
                <span className="text-lg font-bold text-gray-700">Active Tasks</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setFilterMode("completed")}
                className="flex items-center gap-3 rounded-2xl p-4 cursor-pointer hover:bg-indigo-50 focus:bg-indigo-50"
              >
                <Check className="w-6 h-6 text-green-500" />
                <span className="text-lg font-bold text-gray-700">Completed Tasks</span>
              </DropdownMenuItem>

              {filterMode === "completed" && (
                <>
                  <DropdownMenuSeparator className="bg-gray-100 my-3" />
                  <div className="px-4 py-2 text-xs font-black text-gray-400 uppercase tracking-widest">Sort by Time</div>
                  <DropdownMenuItem onClick={() => setTimeRange("daily")} className="flex items-center gap-3 rounded-2xl p-4 cursor-pointer hover:bg-indigo-50">
                    <span className={`text-lg font-bold ${timeRange === "daily" ? "text-indigo-600" : "text-gray-500"}`}>Daily</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTimeRange("weekly")} className="flex items-center gap-3 rounded-2xl p-4 cursor-pointer hover:bg-indigo-50">
                    <span className={`text-lg font-bold ${timeRange === "weekly" ? "text-indigo-600" : "text-gray-500"}`}>Weekly</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTimeRange("all")} className="flex items-center gap-3 rounded-2xl p-4 cursor-pointer hover:bg-indigo-50">
                    <span className={`text-lg font-bold ${timeRange === "all" ? "text-indigo-600" : "text-gray-500"}`}>All Time</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-gray-100 my-3" />
                  <div className="px-4 py-2 text-xs font-black text-gray-400 uppercase tracking-widest">Category</div>
                  <div className="px-3 py-2 max-h-[300px] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-2">
                      {["All", ...CATEGORIES.map(c => c.name)].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`flex items-center justify-center px-4 py-5 rounded-2xl text-sm font-black transition-all border ${
                            selectedCategory === cat 
                              ? "bg-indigo-100 border-indigo-200 text-indigo-700 scale-105" 
                              : "bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setLocation('/history')}
            className="flex items-center gap-[clamp(0.375rem,1.5vw,0.5rem)] bg-white/15 backdrop-blur-md px-[clamp(0.5rem,2vw,0.75rem)] py-[clamp(0.375rem,1.5vw,0.5rem)] rounded-full text-white/80 text-responsive-sm border border-white/20 touch-target"
          >
            <BookOpen className="icon-responsive-sm" />
            My History
          </motion.button>
          
          <div className="flex-1" />
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleEditMode}
            className={`flex items-center gap-[clamp(0.375rem,1.5vw,0.5rem)] backdrop-blur-md px-[clamp(0.5rem,2vw,0.75rem)] py-[clamp(0.375rem,1.5vw,0.5rem)] rounded-full text-responsive-sm border transition-all touch-target ${
              isEditMode 
                ? "bg-indigo-500/80 text-white border-indigo-400/50 shadow-lg" 
                : "bg-white/15 text-white/80 border-white/20"
            }`}
          >
            <Pencil className="icon-responsive-sm" />
            {isEditMode ? "Done" : "Edit"}
          </motion.button>
        </div>

        {/* Add Task Form - Responsive */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-[1.5vh] bg-white/25 backdrop-blur-xl rounded-[clamp(1rem,4vw,1.5rem)] p-[clamp(0.75rem,3vw,1rem)] border border-white/30"
            >
              <div className="flex flex-col gap-[clamp(0.75rem,3vw,1rem)]">
                <div className="flex justify-center">
                  <div className="avatar-responsive-md bg-white/40 rounded-[clamp(0.75rem,3vw,1.5rem)] flex items-center justify-center text-responsive-2xl shadow-lg border border-white/50">
                    {selectedEmoji}
                  </div>
                </div>

                <div className="grid grid-cols-6 gap-[clamp(0.375rem,1.5vw,0.5rem)]">
                  {EMOJI_PICKER.map(e => (
                    <button
                      key={e}
                      onClick={() => setSelectedEmoji(e)}
                      className={`text-responsive-xl p-[clamp(0.375rem,1.5vw,0.5rem)] rounded-[clamp(0.5rem,2vw,0.75rem)] transition-all touch-target ${selectedEmoji === e ? "bg-white scale-110 shadow-md" : "hover:bg-white/20"}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="What should we do?"
                  className="bg-white/30 px-[clamp(0.75rem,3vw,1rem)] py-[clamp(0.5rem,2vw,0.75rem)] rounded-[clamp(0.5rem,2vw,0.75rem)] text-white placeholder-white/50 border border-white/30 text-responsive-sm focus:outline-none"
                />

                <div className="flex gap-[clamp(0.375rem,1.5vw,0.5rem)] overflow-x-auto pb-[0.5vh] scrollbar-hide">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.name}
                      onClick={() => setTaskCategory(cat.name)}
                      className={`flex-shrink-0 flex items-center gap-[clamp(0.25rem,1vw,0.5rem)] px-[clamp(0.5rem,2vw,0.75rem)] py-[clamp(0.375rem,1.5vw,0.5rem)] rounded-full text-responsive-xs font-bold transition-all border touch-target ${taskCategory === cat.name ? "bg-white/60 text-indigo-700 border-white" : "bg-white/10 text-white/70 border-white/10"}`}
                    >
                      <span>{cat.emoji}</span>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>

                <div className="flex gap-[clamp(0.375rem,1.5vw,0.5rem)] flex-wrap">
                  {VIBE_TAGS.map(vibe => (
                    <button
                      key={vibe.value}
                      onClick={() => setSelectedVibe(selectedVibe === vibe.label ? null : vibe.label)}
                      className={`flex items-center gap-[clamp(0.125rem,0.5vw,0.25rem)] px-[clamp(0.5rem,2vw,0.75rem)] py-[clamp(0.25rem,1vw,0.375rem)] rounded-full text-responsive-xs font-medium border transition-all touch-target ${selectedVibe === vibe.label ? "bg-indigo-400 text-white border-indigo-300" : "bg-white/10 text-white/60 border-white/10"}`}
                    >
                      <span>{vibe.emoji}</span>
                      <span>{vibe.label}</span>
                    </button>
                  ))}
                </div>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddTask}
                  disabled={!newTaskTitle.trim()}
                  className="bg-indigo-500/80 text-white py-[clamp(0.75rem,3vw,1rem)] rounded-[clamp(0.75rem,3vw,1rem)] font-black text-responsive-base shadow-xl border border-indigo-400/50 disabled:opacity-50 mt-[0.5vh] touch-target"
                >
                  Looks good ✨
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content - Responsive scrollable area */}
      <div className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden px-[4vw] pt-[1vh] pb-[max(env(safe-area-inset-bottom,0px),7rem)] min-h-0">
        <AnimatePresence mode="popLayout" initial={false}>
          {filteredTodos.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="text-5xl mb-4">✨</div>
              <p className="text-white/80 font-medium">
                {filterMode === "completed" ? "No completed tasks found" : "All done for now!"}
              </p>
              <p className="text-white/50 text-sm mt-1">
                {filterMode === "completed" ? "Keep it up!" : "You can rest"}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-[1.5vh]">
              {filteredTodos.map((todo) => (
                <TaskCard 
                  key={todo.id} 
                  todo={todo} 
                  isEditMode={isEditMode}
                  onComplete={handleComplete}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Fixed Bottom Anchor Message */}
      <div className="fixed bottom-6 left-0 right-0 z-20 flex justify-center pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/25 backdrop-blur-lg px-6 py-2.5 rounded-full border border-white/30 shadow-lg"
        >
          <span className="text-white/90 font-medium text-sm drop-shadow-sm">
            {isEditMode ? "Edit your tasks above" : "You're doing okay 💛"}
          </span>
        </motion.div>
      </div>
    </div>
  );
}
