import { MessageCircle, Bell, Calendar, ListChecks, User, BookOpen, Home, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Reminder, Todo } from "@shared/schema";
import { useTranslation } from "@/contexts/LanguageContext";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: "chat" | "reminders" | "calendar" | "todos" | "journal" | "account") => void;
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const t = useTranslation();
  const [, setLocation] = useLocation();
  const { data: reminders } = useQuery<Reminder[]>({
    queryKey: ["/api/reminders"],
  });

  const { data: todos } = useQuery<Todo[]>({
    queryKey: ["/api/todos"],
  });

  const activeRemindersCount = reminders?.filter(r => !r.isCompleted).length || 0;
  const activeTodosCount = todos?.filter(t => !t.isCompleted).length || 0;

  const tabs = [
    {
      id: "chat" as const,
      icon: MessageCircle,
      badge: null,
    },
    {
      id: "reminders" as const,
      icon: Bell,
      badge: activeRemindersCount > 0 ? activeRemindersCount : null,
    },
    {
      id: "calendar" as const,
      icon: Calendar,
      badge: null,
    },
    {
      id: "todos" as const,
      icon: ListChecks,
      badge: activeTodosCount > 0 ? activeTodosCount : null,
    },
    {
      id: "journal" as const,
      icon: BookOpen,
      badge: null,
    },
  ];

  const isActive = (tabId: string) => activeTab === tabId;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-2 pb-4" data-testid="bottom-navigation">
      <div 
        className="flex items-center justify-between py-2 px-3 rounded-2xl border border-white/20"
        style={{ 
          background: 'rgba(255,255,255,0.95)', 
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          height: '60px'
        }}
      >
        {tabs.slice(0, 3).map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.id);
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="btn-press flex items-center justify-center rounded-2xl transition-all duration-150 px-3 py-2 text-[#242424]"
              style={active ? { background: 'rgba(99,102,241,0.15)' } : {}}
              data-testid={`tab-${tab.id}`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${active ? 'text-indigo-600' : ''}`} />
                {tab.badge && (
                  <div className="absolute -top-2 -right-2 min-w-[16px] h-[16px] bg-gradient-to-br from-pink-500 to-rose-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold shadow-md px-1">
                    {tab.badge > 9 ? "9+" : tab.badge}
                  </div>
                )}
              </div>
            </button>
          );
        })}
        
        <button
          onClick={() => setLocation("/menu")}
          className="btn-press flex items-center justify-center p-2 rounded-2xl transition-all duration-150 hover:text-indigo-600 text-[#242424]"
          data-testid="tab-home"
        >
          <Home className="w-6 h-6" />
        </button>
        
        {tabs.slice(3).map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.id);
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="btn-press flex items-center justify-center rounded-2xl transition-all duration-150 px-3 py-2 text-[#242424]"
              style={active ? { background: 'rgba(99,102,241,0.15)' } : {}}
              data-testid={`tab-${tab.id}`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${active ? 'text-indigo-600' : ''}`} />
                {tab.badge && (
                  <div className="absolute -top-2 -right-2 min-w-[16px] h-[16px] bg-gradient-to-br from-pink-500 to-rose-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold shadow-md px-1">
                    {tab.badge > 9 ? "9+" : tab.badge}
                  </div>
                )}
              </div>
            </button>
          );
        })}

        <button
          onClick={() => onTabChange("account")}
          className="btn-press flex items-center justify-center rounded-2xl transition-all duration-150 px-3 py-2 text-[#242424]"
          style={isActive("account") ? { background: 'rgba(99,102,241,0.15)' } : {}}
          data-testid="tab-account"
        >
          <Settings className={`w-5 h-5 transition-transform ${isActive("account") ? 'text-indigo-600' : ''}`} />
        </button>
      </div>
    </div>
  );
}
