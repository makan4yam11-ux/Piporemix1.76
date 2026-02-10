import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { User } from "@shared/schema";
import BottomNavigation from "@/components/BottomNavigation";
import ChatTab from "@/components/ChatTab";
import RemindersTab from "@/components/RemindersTab";
import CalendarTab from "@/components/CalendarTab";
import TodoTab from "@/components/TodoTab";
import AccountTab from "@/components/AccountTab";
import { PhotoJournal } from "@/components/PhotoJournal";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Calendar } from "lucide-react";

import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation } from "@/i18n/translations";

type TabType = "chat" | "reminders" | "calendar" | "todos" | "journal" | "account";

interface HomeProps {
  initialTab?: TabType;
}

export default function Home({ initialTab = "chat" }: HomeProps = {}) {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const t = getTranslation(language);
  
  const { data: user, isLoading } = useQuery<User & { profileImageUrl?: string; username?: string }>({
    queryKey: ["/api/auth/user"],
  });

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [transitioning, setTransitioning] = useState(false);
  const [nextTab, setNextTab] = useState<TabType | null>(null);
  const [showPromo, setShowPromo] = useState(false);
  const [showUpdateLog, setShowUpdateLog] = useState(false);

  const handleTabChange = (tab: TabType) => {
    if (tab === activeTab) return;
    setTransitioning(true);
    setNextTab(tab);
    setTimeout(() => {
      setActiveTab(tab);
      window.scrollTo(0, 0);
      setTransitioning(false);
      setNextTab(null);
    }, 300);
  };

  // Start sequence after loading - show popups only once after login
  useEffect(() => {
    if (!isLoading) {
      // Check localStorage to see if popups were already shown in this session
      const hasShownPopups = sessionStorage.getItem("pipo_popups_shown");
      
      if (!hasShownPopups) {
        // Mark as shown immediately to prevent re-showing on navigation
        sessionStorage.setItem("pipo_popups_shown", "true");
        
        // Small delay to ensure the app is ready and doesn't interfere with loading transition
        const timer = setTimeout(() => {
          // Show promo popup
          setShowPromo(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoading]);

  const handleDismissPromo = () => {
    setShowPromo(false);
    // Show update log after promo is dismissed
    setTimeout(() => setShowUpdateLog(true), 300);
  };

  const handleDismissUpdateLog = () => {
    setShowUpdateLog(false);
  };

  const renderTabContent = (tab: TabType, isHidden: boolean) => {
    const isGuest = user?.username === "pipo_guest";
    
    let content;
    switch (tab) {
      case "chat":
        content = isGuest ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-indigo-50/30">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6 animate-bounce-slow">
              <span className="text-5xl">🐧</span>
            </div>
            <h3 className="text-xl font-bold text-indigo-900 mb-2">{t.guest.greeting}</h3>
            <p className="text-indigo-600 mb-8 max-w-[280px]">
              {t.guest.description}
            </p>
            <Button 
              onClick={() => setLocation("/auth")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-8 h-12 shadow-lg shadow-indigo-200 font-bold"
            >
              {t.guest.button}
            </Button>
          </div>
        ) : <ChatTab user={user} />;
        break;
      case "reminders":
        content = <RemindersTab />;
        break;
      case "calendar":
        content = <CalendarTab />;
        break;
      case "journal":
        content = <PhotoJournal />;
        break;
      case "todos":
        content = <TodoTab />;
        break;
      case "account":
        content = <AccountTab user={user} />;
        break;
      default:
        content = <ChatTab user={user} />;
    }

    return (
      <div className={`flex-1 overflow-hidden flex flex-col bg-background page ${isHidden ? 'hidden' : ''}`}>
        {content}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-background shadow-2xl rounded-t-3xl min-h-screen relative overflow-hidden">
        <div className="flex items-center justify-center h-screen bg-background">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-background shadow-2xl h-screen flex flex-col relative overflow-hidden" data-testid="main-app-container">
      {renderTabContent(activeTab, transitioning)}
      {nextTab && renderTabContent(nextTab, !transitioning)}
      <BottomNavigation activeTab={nextTab || activeTab} onTabChange={handleTabChange} />
      <div className="absolute top-0 left-0 right-0 h-4 bg-background z-[60] pointer-events-none" />
      {/* Promotion Popup */}
      <Dialog open={showPromo} onOpenChange={setShowPromo}>
        <DialogContent className="sm:max-w-[360px] w-[90%] rounded-2xl p-0 overflow-hidden border-none bg-card shadow-2xl animate-in fade-in zoom-in duration-200">
          <VisuallyHidden>
            <DialogTitle>Special Offer</DialogTitle>
            <DialogDescription>Premium Penguin Plan promotion</DialogDescription>
          </VisuallyHidden>
          <div className="relative">
            <div 
              className="w-full aspect-[4/3] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-8 cursor-pointer active:scale-[0.98] transition-transform"
              onClick={() => {
                handleDismissPromo();
                setLocation("/payment");
              }}
            >
              <div className="text-white text-center">
                <div className="text-4xl mb-2">✨</div>
                <h2 className="text-2xl font-black tracking-tight">{t.promo.offer}</h2>
              </div>
            </div>
            <button 
              onClick={handleDismissPromo}
              className="absolute top-3 right-3 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 bg-[#6172b8bd]">
            <h3 className="text-xl font-bold mb-2 text-[#ffffff]">{t.promo.title}</h3>
            <p className="text-sm leading-relaxed mb-6 text-[#ffffff]">
              {t.promo.description}
            </p>
            <div className="flex flex-col gap-2">
              <Button 
                onClick={() => {
                  handleDismissPromo();
                  setLocation("/payment");
                }} 
                className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-lg shadow-indigo-200"
              >
                {t.promo.checkItOut}
              </Button>
              <Button 
                variant="ghost" 
                onClick={handleDismissPromo} 
                className="w-full h-10 text-muted-foreground font-medium hover:text-foreground bg-[#ffffff]"
              >
                {t.promo.maybeLater}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Update Log Popup */}
      <Dialog open={showUpdateLog} onOpenChange={setShowUpdateLog}>
        <DialogContent className="fixed left-[50%] top-[50%] z-50 grid max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg sm:max-w-[360px] w-[90%] rounded-2xl p-6 border-none shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200 bg-[#3527a1]">
          <VisuallyHidden>
            <DialogTitle>What's New</DialogTitle>
            <DialogDescription>Latest updates and features</DialogDescription>
          </VisuallyHidden>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-[#ffffff]">{t.whatsNew.title}</h3>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold">v2.0</Badge>
          </div>
          
          <div className="space-y-6 mb-8">
            <div className="flex gap-4">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-[#ffffff]">{t.whatsNew.calendarView}</p>
                <p className="text-xs leading-relaxed text-[#ffffff]">{t.whatsNew.calendarViewDesc}</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <div className="w-5 h-5 rounded-full border-2 border-current border-t-transparent animate-spin-slow" />
              </div>
              <div>
                <p className="font-bold text-sm text-[#ffffff]">{t.whatsNew.autoTime}</p>
                <p className="text-xs leading-relaxed text-[#ffffff]">{t.whatsNew.autoTimeDesc}</p>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleDismissUpdateLog} 
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 px-4 py-2 w-full h-12 rounded-xl bg-primary hover:bg-primary/90 font-bold text-base shadow-xl text-[#ffffff]"
          >
            {t.whatsNew.gotIt}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
