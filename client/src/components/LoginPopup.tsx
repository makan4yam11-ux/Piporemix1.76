import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export function LoginPopup({ forceShow = false }: { forceShow?: boolean }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (forceShow) {
      setShowLogin(true);
      return;
    }
    if (!isLoading && !isAuthenticated) {
      setShowLogin(true);
    }
  }, [isLoading, isAuthenticated, forceShow]);

  const handleLogin = () => {
    localStorage.setItem("pipo_login_shown", "true");
    window.location.href = "/api/login";
  };

  const handleDismiss = () => {
    setShowLogin(false);
    localStorage.setItem("pipo_login_shown", "true");
  };

  if (isLoading || isAuthenticated) {
    return null;
  }

  return (
    <Dialog open={showLogin} onOpenChange={setShowLogin}>
      <DialogContent className="sm:max-w-[360px] w-[90%] rounded-2xl p-0 overflow-hidden border-none shadow-2xl animate-in fade-in zoom-in duration-200 bg-[#acfaf66e]">
        <VisuallyHidden>
          <DialogTitle>Welcome to Pipo</DialogTitle>
          <DialogDescription>Sign in to continue using the app</DialogDescription>
        </VisuallyHidden>
        <div className="relative">
          <div className="w-full aspect-[4/3] bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center p-8">
            <div className="text-white text-center">
              <div className="text-5xl mb-3">🐧</div>
              <h2 className="text-2xl font-black tracking-tight">Welcome to Pipo!</h2>
              <p className="text-white/80 text-sm mt-2">Your personal journal companion</p>
            </div>
          </div>
        </div>
        <div className="p-6 bg-transparent text-[#ffffff]">
          <h3 className="text-xl font-bold text-foreground mb-2">Sign in to continue</h3>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            Log in to save your journals, sync across devices, and unlock all features.
          </p>
          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleLogin} 
              className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-lg shadow-indigo-200"
            >
              Sign in with Replit
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleDismiss} 
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent px-4 py-2 w-full h-10 font-medium hover:text-foreground bg-[#ffffff] text-[#000000]"
            >
              Continue as guest
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
