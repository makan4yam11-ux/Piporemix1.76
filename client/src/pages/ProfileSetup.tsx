import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function ProfileSetup() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation() as any;
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [nickname, setNickname] = useState("");
  const [debouncedUsername, setDebouncedUsername] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUsername(username);
    }, 500);
    return () => clearTimeout(timer);
  }, [username]);

  const { data: availability, isLoading: isChecking } = useQuery({
    queryKey: ["/api/user/check-username", debouncedUsername],
    queryFn: async () => {
      if (!debouncedUsername || debouncedUsername.length < 3) return null;
      const res = await fetch(`/api/user/check-username?username=${debouncedUsername}`);
      return res.json();
    },
    enabled: debouncedUsername.length >= 3,
  });

  const setupMutation = useMutation({
    mutationFn: async (data: { username: string; nickname: string }) => {
      const res = await apiRequest("POST", "/api/user/setup", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/current"] });
      toast({
        title: "Setup Complete",
        description: "Welcome to Pipo's Room!",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Setup Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !nickname || availability?.available === false) return;
    setupMutation.mutate({ username, nickname });
  };

  const isUsernameValid = username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
  const canSubmit = isUsernameValid && nickname.trim().length > 0 && availability?.available === true && !setupMutation.isPending;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome!</CardTitle>
          <CardDescription className="text-center">
            Let's get your profile ready for Pipo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Choose a username for your account</label>
              <div className="relative">
                <Input
                  placeholder="e.g. user_123"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  className={availability?.available === false ? "border-destructive" : ""}
                />
                <div className="absolute right-3 top-2.5">
                  {isChecking && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  {!isChecking && availability?.available === true && isUsernameValid && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  {!isChecking && (availability?.available === false || (username.length > 0 && !isUsernameValid)) && <XCircle className="h-4 w-4 text-destructive" />}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                This must be unique and will be your system identity.
              </p>
              {availability?.available === false && (
                <p className="text-xs text-destructive">This username is already taken.</p>
              )}
              {username.length > 0 && !isUsernameValid && (
                <p className="text-xs text-destructive">Username can only contain letters, numbers, and underscores.</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Choose a name Pipo can call you</label>
              <Input
                placeholder="e.g. Buddy"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                This is your display name. Multiple people can have the same nickname.
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={!canSubmit}>
              {setupMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Start Journey
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
