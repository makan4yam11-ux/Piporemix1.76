import { useState, useEffect } from "react";
import { useLocation, Switch, Route } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SpeechLanguageProvider } from "@/contexts/SpeechLanguageContext";
import { FixedTimeProvider } from "@/contexts/FixedTimeContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import LoadingPage from "@/components/LoadingPage";
import TodayBoard from "@/components/TodayBoard";
import MainMenu from "@/components/MainMenu";
import { LoginPopup } from "@/components/LoginPopup";
import Home from "@/pages/Home";
import Payment from "@/pages/Payment";
import PaymentSuccess from "@/pages/PaymentSuccess";
import PaymentCancel from "@/pages/PaymentCancel";
import History from "@/pages/History";
import NotFound from "@/pages/not-found";

import ProfileSetup from "@/pages/ProfileSetup";
import AuthPage from "@/pages/AuthPage";
import StarSky from "@/pages/StarSky";

function AuthRedirect() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation("/");
  }, [setLocation]);
  return null;
}

function Router() {
  const { data: user, isLoading, refetch } = useQuery<User>({ 
    queryKey: ["/api/user/current"],
    retry: false
  });
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user && window.location.pathname !== "/auth") {
      setLocation("/auth");
    }
  }, [user, isLoading, setLocation]);

  // Listen for guest mode login and refetch user
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "pipo-guest-mode") {
        refetch();
      }
    };
    
    // Check more frequently initially, then slow down
    let checkCount = 0;
    const interval = setInterval(() => {
      const guestMode = localStorage.getItem("pipo-guest-mode");
      if (guestMode) {
        refetch();
        localStorage.removeItem("pipo-guest-mode");
      }
      checkCount++;
      if (checkCount > 20) { // After 10 seconds, clear interval if still running
         clearInterval(interval);
      }
    }, 500);

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [refetch]);

  if (isLoading) return <LoadingPage onLoadingComplete={() => {}} />;

  if (!user) {
    return (
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route path="/:rest*">
          {() => null}
        </Route>
      </Switch>
    );
  }

  const isGuest = user?.username === "pipo_guest";
  const needsSetup = user && !isGuest && !user.setupComplete;

  return (
    <Switch>
      <Route path="/auth" component={AuthRedirect} />
      {needsSetup ? (
        <Route path="/:rest*" component={ProfileSetup} />
      ) : (
        <>
          <Route path="/" component={TodayBoard}/>
          <Route path="/menu" component={MainMenu}/>
          <Route path="/chat" component={() => <Home initialTab="chat" />}/>
          <Route path="/reminders" component={() => <Home initialTab="reminders" />}/>
          <Route path="/calendar" component={() => <Home initialTab="calendar" />}/>
          <Route path="/todos" component={() => <Home initialTab="todos" />}/>
          <Route path="/journal" component={() => <Home initialTab="journal" />}/>
          <Route path="/account" component={() => <Home initialTab="account" />}/>
          <Route path="/stars" component={StarSky}/>
          <Route path="/payment" component={Payment}/>
          <Route path="/payment/success" component={PaymentSuccess}/>
          <Route path="/payment/cancel" component={PaymentCancel}/>
          <Route path="/history" component={History}/>
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <SpeechLanguageProvider>
            <FixedTimeProvider>
              <TooltipProvider>
                <Toaster />
                <AnimatePresence mode="wait">
                  {!isLoadingComplete ? (
                    <LoadingPage key="loader" onLoadingComplete={() => setIsLoadingComplete(true)} />
                  ) : (
                    <motion.div
                      key="content"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1, ease: "easeInOut" }}
                    >
                      <Router />
                    </motion.div>
                  )}
                </AnimatePresence>
              </TooltipProvider>
            </FixedTimeProvider>
          </SpeechLanguageProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
