import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogIn, UserPlus, Ghost, Box, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showGuestAlert, setShowGuestAlert] = useState(false);

  const authMutation = useMutation({
    mutationFn: async (type: 'login' | 'register' | 'guest') => {
      if (type === 'register' && password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const endpoint = type === 'guest' ? '/api/auth/guest' : `/api/auth/${isLogin ? 'login' : 'register'}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: type === 'guest' ? undefined : JSON.stringify({ username, password })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Auth failed');
      }
      return res.json();
    },
    onSuccess: async (_, variables) => {
      if (variables === 'guest') {
        localStorage.setItem("pipo-guest-mode", Date.now().toString());
      } else {
        localStorage.removeItem("pipo-guest-mode");
      }
      await queryClient.invalidateQueries({ queryKey: ["/api/user/current"] });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-indigo-500">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">🐧</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-indigo-900">Welcome to Pipo</CardTitle>
          <CardDescription>Your friendly productivity penguin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input 
              placeholder="Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border-indigo-100 focus:border-indigo-300"
            />
            <div className="relative">
              <Input 
                type={showPassword ? "text" : "password"}
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-indigo-100 focus:border-indigo-300 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {!isLogin && (
              <Input 
                type={showPassword ? "text" : "password"}
                placeholder="Confirm Password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border-indigo-100 focus:border-indigo-300"
              />
            )}

            <Button 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-2"
              onClick={() => authMutation.mutate(isLogin ? 'login' : 'register')}
              disabled={authMutation.isPending}
            >
              {isLogin ? <LogIn className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
              {isLogin ? "Sign In" : "Create Account"}
            </Button>
          </div>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-indigo-100" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-indigo-400 font-medium">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="border-indigo-100 text-indigo-700 hover:bg-indigo-50"
              onClick={() => window.location.href = '/api/login'}
            >
              <Box className="mr-2 h-4 w-4" />
              Replit
            </Button>
            <Button 
              variant="outline"
              className="border-indigo-100 text-indigo-700 hover:bg-indigo-50"
              onClick={() => setShowGuestAlert(true)}
            >
              <Ghost className="mr-2 h-4 w-4" />
              Guest
            </Button>
          </div>

          <div className="text-center pt-2">
            <button 
              className="text-sm text-indigo-600 hover:underline font-medium"
              onClick={() => {
                setIsLogin(!isLogin);
                setConfirmPassword("");
              }}
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showGuestAlert} onOpenChange={setShowGuestAlert}>
        <AlertDialogContent className="fixed top-[50%] z-50 grid translate-y-[-50%] gap-4 border p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg rounded-2xl border-indigo-100 sm:max-w-[425px] w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] left-1/2 -translate-x-1/2 bg-[#ffffff]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-indigo-900">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Guest Mode Notice
            </AlertDialogTitle>
            <AlertDialogDescription className="text-indigo-600">
              In guest mode, your data (chat history, tasks, reminders) will be <span className="underline">deleted</span> when you log out. 
              Create an account to save your progress!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-indigo-100 text-indigo-700">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => authMutation.mutate('guest')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
            >
              Continue as Guest
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
