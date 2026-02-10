import { User } from "@shared/schema";
import PipoMascot from "./PipoMascot";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Flame, Calendar, Trophy, Settings, LogOut, Palette, RefreshCcw, Sparkles, Crown, Camera, Upload, AlertCircle, BookOpen } from "lucide-react";
import { LanguageSelector } from "./LanguageSelector";
import { useTranslation } from "@/contexts/LanguageContext";
import { useFixedTime } from "@/contexts/FixedTimeContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoginPopup } from "./LoginPopup";
import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
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

interface AccountTabProps {
  user?: User & { profileImageUrl?: string; username?: string };
}

export default function AccountTab({ user }: AccountTabProps) {
  const t = useTranslation();
  const [, setLocation] = useLocation();
  const { isFixedTimeMode, setFixedTimeMode } = useFixedTime();
  const { colors, themeMode, updateColors, setThemeMode, resetColors } = useTheme();
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showGuestPfpAlert, setShowGuestPfpAlert] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const isGuest = user?.username === "pipo_guest";

  const uploadProfilePictureMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("profilePicture", file);
      const res = await fetch("/api/user/profile-picture", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to upload");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/current"] });
      toast({
        title: t.account.success,
        description: t.account.pfpUpdated,
      });
    },
    onError: (error: Error) => {
      toast({
        title: t.account.error,
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadProfilePictureMutation.mutate(file);
    }
  };

  const handlePfpClick = () => {
    if (isGuest) {
      setShowGuestPfpAlert(true);
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("pipo_popups_shown");
    window.location.reload(); 
  };

  const getUserInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="h-full overflow-y-auto pb-20 no-scrollbar bg-[#FDFBF7]" data-testid="account-tab">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 pt-12 pb-7 text-white">
        <div className="flex items-center gap-3.5">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center penguin-float shadow-md border border-white/20 overflow-hidden">
            <PipoMascot size="medium" expression="happy" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-0.5 drop-shadow-sm" data-testid="account-title">{t.account.title}</h1>
            <p className="text-white/95 text-sm">{t.account.subtitle}</p>
          </div>
        </div>
      </div>

        <div className="p-5 space-y-6">
          <LoginPopup forceShow={showLoginPopup} />
          {/* Sign In / Sign Out Section */}
          <Card className="shadow-md border-border bg-card overflow-hidden">
            <CardContent className="p-0">
              {isGuest || !user?.email ? (
                <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <Sparkles className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-indigo-900">
                        {isGuest ? t.account.guestAccount : t.account.syncWithGoogle}
                      </p>
                      <p className="text-[10px] text-indigo-700">
                        {isGuest ? t.account.guestDesc : t.account.syncDesc}
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setLocation("/auth")}
                    className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                  >
                    {t.guest.button}
                  </Button>
                </div>
              ) : (
                <div className="p-4 bg-green-50 border-b border-green-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm overflow-hidden">
                      {user.profileImageUrl ? (
                        <img src={user.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <Crown className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-green-900">{t.account.signedIn}</p>
                      <p className="text-[10px] text-green-700 truncate max-w-[150px]">{user.email}</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => window.location.href = "/api/logout"}
                    variant="ghost"
                    size="sm"
                    className="h-8 text-[10px] font-bold text-green-700 hover:bg-green-100/50"
                  >
                    {t.account.signOut}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Profile Card */}
          <Card className="shadow-md border-border bg-card">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <div 
                className="w-24 h-24 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg overflow-hidden relative group cursor-pointer"
                onClick={handlePfpClick}
              >
                {user?.profileImageUrl ? (
                  <img 
                    src={`${user.profileImageUrl}?v=${Date.now()}`} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <span className="text-3xl text-white font-bold" data-testid="user-initials-large">
                      {getUserInitials(user?.name)}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-1" data-testid="user-name">
                {user?.name || t.common.user}
              </h2>
              <p className="text-sm text-muted-foreground" data-testid="join-date">
                {t.account.journalingSince} {user?.createdAt ? format(new Date(user.createdAt), "MMMM yyyy") : ""}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="shadow-sm hover:shadow-md transition-shadow border-border bg-card">
            <CardContent className="pt-5 text-center">
              <div className="flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mx-auto mb-3">
                <Flame className="w-7 h-7 text-primary" />
              </div>
              <div className="text-xs text-muted-foreground font-medium">{t.account.journalEntries}</div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow border-border bg-card">
            <CardContent className="pt-5 text-center">
              <div className="flex items-center justify-center w-14 h-14 bg-accent/10 rounded-2xl mx-auto mb-3">
                <Calendar className="w-7 h-7 text-accent" />
              </div>
              <div className="text-xs text-muted-foreground font-medium">{t.account.daysSpent}</div>
            </CardContent>
          </Card>
        </div>

        {/* Settings */}
        <Card className="shadow-md border-border bg-card">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-muted-foreground" />
              {t.account.settings}
            </h3>
            <div className="space-y-3">
              {/* Profile Picture Upload */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={handlePfpClick}
                disabled={uploadProfilePictureMutation.isPending}
                className="w-full h-11 flex items-center justify-between px-3.5 bg-muted/50 rounded-xl hover:bg-muted transition-colors border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                    {user?.profileImageUrl ? (
                      <img 
                        src={`${user.profileImageUrl}?v=${Date.now()}`} 
                        alt="Profile" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <Camera className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <span className="text-sm text-foreground font-medium">
                    {uploadProfilePictureMutation.isPending ? t.account.uploading : t.account.changePfp}
                  </span>
                </div>
                <Upload className="w-4 h-4 text-muted-foreground" />
              </Button>

              <Button
                variant="ghost"
                onClick={() => setLocation('/history')}
                className="w-full h-11 flex items-center justify-between px-3.5 bg-muted/50 rounded-xl hover:bg-muted transition-colors border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm text-foreground font-medium">My History</span>
                </div>
                <span className="text-xs text-muted-foreground">View your journey</span>
              </Button>
              <div className="flex items-center justify-between p-3.5 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                <span className="text-sm text-foreground font-medium">{t.account.language}</span>
                <LanguageSelector />
              </div>
              <div className="flex items-center justify-between p-3.5 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                <div className="flex-1">
                  <div className="text-sm text-foreground font-medium mb-1">{t.account.darkMode}</div>
                  <div className="text-xs text-muted-foreground">{t.account.switchDark}</div>
                </div>
                <Switch 
                  checked={themeMode === "dark"}
                  onCheckedChange={(checked) => setThemeMode(checked ? "dark" : "light")}
                  className="ml-3 data-[state=unchecked]:bg-black data-[state=checked]:bg-white"
                />
              </div>
              <div className="flex items-center justify-between p-3.5 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                <span className="text-sm text-foreground font-medium">{t.account.pipoCheckins}</span>
                <Badge variant="outline" className="shadow-sm border-border text-foreground">{t.account.daily}</Badge>
              </div>
              <div className="flex items-center justify-between p-3.5 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                <span className="text-sm text-foreground font-medium">{t.account.voiceRecording}</span>
                <Badge variant="outline" className="shadow-sm border-border text-foreground">{t.common.enabled}</Badge>
              </div>
              <div className="flex items-center justify-between p-3.5 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                <span className="text-sm text-foreground font-medium">{t.account.calendarSync}</span>
                <Badge variant="outline" className="shadow-sm border-border text-foreground">{t.account.google}</Badge>
              </div>
              <div className="flex items-center justify-between p-3.5 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                <div className="flex-1">
                  <div className="text-sm text-foreground font-medium mb-1">{t.account.fixedTimeMode}</div>
                  <div className="text-xs text-muted-foreground">{t.account.fixedTimeModeDesc}</div>
                </div>
                <Switch 
                  checked={isFixedTimeMode}
                  onCheckedChange={setFixedTimeMode}
                  className="ml-3"
                />
              </div>

              {/* Colour Palette Section */}
              <div className="pt-4 border-t border-border/50">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-primary" />
                  {t.account.themeColors}
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-transparent hover:border-primary/30 transition-all group">
                    <div className="flex flex-col">
                      <Label className="text-sm font-medium mb-0.5 group-hover:text-primary transition-colors">{t.account.primaryColor}</Label>
                      <span className="text-xs text-muted-foreground">{t.account.mainTheme}</span>
                    </div>
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-border shadow-sm hover:scale-110 transition-transform cursor-pointer">
                      <Input 
                        type="color" 
                        value={colors.primary} 
                        onChange={(e) => updateColors({ primary: e.target.value })}
                        className="absolute inset-0 w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4 cursor-pointer p-0 border-none bg-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-transparent hover:border-accent/30 transition-all group">
                    <div className="flex flex-col">
                      <Label className="text-sm font-medium mb-0.5 group-hover:text-accent transition-colors">{t.account.accentColor}</Label>
                      <span className="text-xs text-muted-foreground">{t.account.highlights}</span>
                    </div>
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-border shadow-sm hover:scale-110 transition-transform cursor-pointer">
                      <Input 
                        type="color" 
                        value={colors.accent} 
                        onChange={(e) => updateColors({ accent: e.target.value })}
                        className="absolute inset-0 w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4 cursor-pointer p-0 border-none bg-transparent"
                      />
                    </div>
                  </div>

                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={resetColors}
                    className="w-full text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 h-8 mt-2"
                  >
                    <RefreshCcw className="w-3 h-3" />
                    {t.account.resetDefault}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button 
          className="w-full h-12 rounded-xl flex items-center justify-center gap-2 font-bold bg-[#d90000] text-white hover:bg-[#b30000]"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          {t.account.logout}
        </Button>

        {/* Pipo Message */}
        <Card className="bg-gradient-to-br from-secondary/30 to-secondary/10 border-border shadow-md bg-card">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <PipoMascot size="small" expression="happy" className="flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-foreground font-semibold mb-2">
                  {t.account.pipoNoteTitle}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t.account.pipoNoteMessage}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showGuestPfpAlert} onOpenChange={setShowGuestPfpAlert}>
        <AlertDialogContent className="fixed top-[50%] z-50 grid translate-y-[-50%] gap-4 border p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg rounded-2xl border-indigo-100 sm:max-w-[425px] w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] left-1/2 -translate-x-1/2 bg-[#ffffff]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-indigo-900">
              <AlertCircle className="h-5 w-5 text-indigo-600" />
              {t.account.customizeProfile}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-indigo-600">
              {t.account.customizePfpDesc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-indigo-100 text-indigo-700">{t.account.notNow}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => setLocation("/auth")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
            >
              {t.guest.button}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
