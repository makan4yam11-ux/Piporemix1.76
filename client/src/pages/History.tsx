import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Todo } from "@shared/schema";
import { ArrowLeft, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { format, isToday, isYesterday, startOfWeek, isThisWeek, parseISO } from "date-fns";
import ChatGPT_Image_Jan_13__2026__10_55_11_PM from "@assets/ChatGPT Image Jan 13, 2026, 10_55_11 PM.png";

interface GroupedTasks {
  label: string;
  tasks: Todo[];
}

function groupTasksByTime(tasks: Todo[]): GroupedTasks[] {
  const groups: Record<string, Todo[]> = {};
  
  tasks.forEach(task => {
    const date = new Date(task.createdAt);
    let label: string;
    
    if (isToday(date)) {
      label = "Today";
    } else if (isYesterday(date)) {
      label = "Yesterday";
    } else if (isThisWeek(date, { weekStartsOn: 1 })) {
      label = format(date, "EEEE");
    } else {
      label = format(date, "MMMM d");
    }
    
    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(task);
  });
  
  const sortedLabels = Object.keys(groups).sort((a, b) => {
    const getLatestDate = (label: string) => {
      const tasks = groups[label];
      return Math.max(...tasks.map(t => new Date(t.createdAt).getTime()));
    };
    return getLatestDate(b) - getLatestDate(a);
  });
  
  return sortedLabels.map(label => ({
    label,
    tasks: groups[label].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }));
}

function HistoryCard({ task }: { task: Todo }) {
  const pastelColors = [
    "bg-rose-100/70",
    "bg-sky-100/70", 
    "bg-amber-100/70",
    "bg-emerald-100/70",
    "bg-violet-100/70",
    "bg-orange-100/70",
  ];
  
  const colorIndex = task.title.length % pastelColors.length;
  const bgColor = pastelColors[colorIndex];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${bgColor} rounded-2xl px-4 py-3 flex items-center gap-3 border border-white/50 shadow-sm`}
    >
      <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center text-xl flex-shrink-0 shadow-inner">
        {task.emoji || "✨"}
      </div>
      <span className="text-gray-700 font-medium text-sm truncate">
        {task.title}
      </span>
    </motion.div>
  );
}

export default function History() {
  const [, setLocation] = useLocation();
  
  const { data: todos, isLoading } = useQuery<Todo[]>({
    queryKey: ["/api/todos"],
  });
  
  const completedTasks = todos?.filter(t => t.isCompleted) || [];
  const groupedTasks = groupTasksByTime(completedTasks);
  
  if (isLoading) {
    return (
      <div className="flex flex-col h-screen relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={ChatGPT_Image_Jan_13__2026__10_55_11_PM} 
            alt="Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/40 via-purple-900/30 to-pink-900/20" />
        </div>
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="animate-pulse space-y-3 w-full max-w-sm px-6">
            <div className="h-14 bg-white/20 rounded-2xl w-full"></div>
            <div className="h-14 bg-white/20 rounded-2xl w-full"></div>
            <div className="h-14 bg-white/20 rounded-2xl w-full"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src={ChatGPT_Image_Jan_13__2026__10_55_11_PM} 
          alt="Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/40 via-purple-900/30 to-pink-900/20" />
      </div>
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="px-5 pt-[max(env(safe-area-inset-top,0px),3vh)] pb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setLocation('/todos')}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white active:bg-white/30 transition-all border border-white/30 shadow-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white drop-shadow-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Your Journey
              </h1>
              <p className="text-white/70 text-xs">
                Things you've done
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-5 pb-8 no-scrollbar">
          <p className="text-white/40 text-xs text-center mb-6 italic">
            This is just your story. Nothing here is bad.
          </p>
          
          {completedTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-4">
                <span className="text-4xl">👣</span>
              </div>
              <p className="text-white/60 text-center text-sm font-medium">
                Your story is just beginning
              </p>
              <p className="text-white/40 text-center text-xs mt-1">
                Complete some activities to see them here
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedTasks.map((group, groupIndex) => (
                <motion.div
                  key={group.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: groupIndex * 0.1 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-white/80 text-sm font-semibold">
                      {group.label === "Today" && "🌤️ "}
                      {group.label === "Yesterday" && "🌙 "}
                      {group.label}
                    </span>
                    <div className="flex-1 h-px bg-white/20" />
                  </div>
                  
                  <div className="space-y-2">
                    {group.tasks.map((task, taskIndex) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: groupIndex * 0.1 + taskIndex * 0.05 }}
                      >
                        <HistoryCard task={task} />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          <p className="text-white/30 text-xs text-center mt-8 italic">
            You can always keep going
          </p>
        </div>
      </div>
    </div>
  );
}
