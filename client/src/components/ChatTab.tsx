import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { ChatMessage, User } from "@shared/schema";
import PipoMascot from "./PipoMascot";
import { Button } from "@/components/ui/button";
import { useTranslation, useLanguage } from "@/contexts/LanguageContext";
import { Lock, Send, Heart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useLocation } from "wouter";

interface ChatTabProps {
  user?: User;
}

const REASSURANCE_MESSAGES = [
  "You can change this later",
  "Nothing here is wrong",
  "You don't have to finish",
  "Take your time",
  "There's no rush",
  "Just be yourself",
  "It's okay to pause",
  "You're doing great",
];

function getReassuranceMessage(): string {
  return REASSURANCE_MESSAGES[Math.floor(Math.random() * REASSURANCE_MESSAGES.length)];
}

export default function ChatTab({ user }: ChatTabProps) {
  const t = useTranslation();
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const [isTyping, setIsTyping] = useState(false);
  const [showGuestPopup, setShowGuestPopup] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [reassurance] = useState(getReassuranceMessage());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isGuest = user?.username?.startsWith("pipo_guest_");

  const selectedDate = new Date();

  const { data: messages, isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/messages", selectedDate.toISOString().split('T')[0]],
    queryFn: async () => {
      const response = await fetch(`/api/chat/messages?date=${selectedDate.toISOString().split('T')[0]}`);
      if (!response.ok) throw new Error("Failed to fetch messages");
      return response.json();
    }
  });

  const [mood, setMood] = useState<string>(() => {
    const saved = localStorage.getItem(`pipo_mood_${user?.email || 'default'}`);
    return saved || 'calm';
  });

  useEffect(() => {
    localStorage.setItem(`pipo_mood_${user?.email || 'default'}`, mood);
  }, [mood, user?.email]);

  const pipoResponses: Record<string, string[]> = {
    happy: [
      "That sounds really nice.",
      "I can feel the good energy.",
      "That must feel great.",
      "I can feel your smile.",
      "I'm glad you shared that.",
      "That warmth is lovely."
    ],
    sad: [
      "That sounds a little heavy.",
      "I'm here with you.",
      "You don't have to rush.",
      "It's okay to feel that way.",
      "I'm listening.",
      "Take all the time you need."
    ],
    calm: [
      "This feels peaceful.",
      "I like being here with you.",
      "Thanks for telling me.",
      "I hear you.",
      "You can keep going if you want."
    ],
    unsure: [
      "It's okay not to know yet.",
      "We can take it slowly.",
      "There's no right answer.",
      "That's okay.",
      "I'm here with you."
    ],
    tired: [
      "It's okay to rest.",
      "I'm here while you recharge.",
      "Rest is important too.",
      "No rush at all.",
      "Take it easy."
    ],
    angry: [
      "That sounds frustrating.",
      "It's okay to feel that way.",
      "I'm listening.",
      "I'm listening to your heart.",
      "It's okay to let it out gently.",
      "I hear you."
    ],
    neutral: [
      "Thanks for telling me.",
      "I hear you.",
      "You can keep going if you want.",
      "I'm here.",
      "That's okay."
    ]
  };

  const getPipoReply = (currentMood: string) => {
    const pool = pipoResponses[currentMood] || pipoResponses.neutral;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (isGuest) {
        setShowGuestPopup(true);
        throw new Error("GUEST_RESTRICTION_ERROR");
      }

      // 1. Create User Message locally
      const userMsg = await apiRequest("POST", "/api/chat/messages", {
        content: content.trim(),
        isFromPipo: false,
        messageType: "text",
        globalLanguage: language,
      });
      const userMsgData = await userMsg.json();

      // 2. Generate Rule-Based Pipo Response
      const pipoReply = getPipoReply(mood);

      // Trigger star reward for chat/mood check (once per day handled by server)
      fetch("/api/stars/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventType: "mood_check_completed", amount: 1 })
      });

      // 3. Create Pipo Message locally after natural delay (900ms for human-like feel)
      await new Promise(resolve => setTimeout(resolve, 900));

      const pipoMsg = await apiRequest("POST", "/api/chat/messages", {
        content: pipoReply,
        isFromPipo: true,
        messageType: "text",
        globalLanguage: language,
      });

      return { userMessage: userMsgData, pipoMessage: await pipoMsg.json() };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages", selectedDate.toISOString().split('T')[0]] });
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    const trimmedContent = textInput.trim();
    if (!trimmedContent) return;
    
    setTextInput("");
    setIsTyping(true);
    try {
      await sendMessageMutation.mutateAsync(trimmedContent);
    } catch (error: any) {
      console.error("Chat error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <div 
        className="flex-1 min-h-screen p-6 pt-16"
        style={{
          background: "linear-gradient(180deg, #fef7ed 0%, #ecfdf5 50%, #fdf4ff 100%)"
        }}
      >
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-amber-100/50 rounded-xl w-2/3 mx-auto"></div>
          <div className="h-4 bg-amber-100/30 rounded-lg w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col h-full"
      style={{
        background: "#F7F4EF"
      }}
      data-testid="chat-tab"
    >
      <div className="px-4 pt-4 pb-2 text-center flex-shrink-0" data-testid="chat-header">
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 bg-amber-100/50 rounded-full flex items-center justify-center breathing-glow">
            <PipoMascot size="small" expression={mood === 'happy' ? 'happy' : 'neutral'} />
          </div>
          <div className="flex gap-1.5 mt-1 flex-wrap justify-center">
            {['happy', 'calm', 'neutral', 'sad', 'tired', 'angry', 'unsure'].map((m) => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition-all ${
                  mood === m ? 'bg-amber-200 ring-2 ring-amber-400 scale-110' : 'bg-white/50 opacity-50 hover:opacity-100'
                }`}
                title={m}
              >
                {m === 'happy' ? '😊' : m === 'calm' ? '🧘' : m === 'neutral' ? '😐' : m === 'sad' ? '😢' : m === 'tired' ? '😴' : m === 'angry' ? '😤' : '🤔'}
              </button>
            ))}
          </div>
          <p className="text-sm font-medium text-amber-800/70">
            {t.chat.greeting}
          </p>
        </div>
      </div>

      <div 
        className="flex-1 px-5 pb-48 space-y-5 overflow-y-auto" 
        data-testid="chat-container"
      >
        {(!messages || messages.length === 0) && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-amber-700/50 italic text-sm">
              {t.chat.placeholder}
            </p>
          </div>
        )}

        {messages?.map((message, index) => (
          <div 
            key={message.id} 
            className={`flex items-end gap-3 ${!message.isFromPipo ? 'justify-end' : 'justify-start'}`}
            style={{
              animation: `fadeSlideIn 0.4s ease-out ${index * 0.05}s both`
            }}
            data-testid={`message-${message.isFromPipo ? 'pipo' : 'user'}`}
          >
            {message.isFromPipo && (
              <div className="w-8 h-8 bg-amber-100/60 rounded-full flex items-center justify-center flex-shrink-0">
                <PipoMascot size="small" expression="happy" />
              </div>
            )}
            
            <div 
              className={`px-5 py-3.5 max-w-[75%] rounded-3xl ${
                message.isFromPipo 
                  ? 'rounded-bl-lg' 
                  : 'rounded-br-lg'
              }`}
              style={{ 
                background: message.isFromPipo ? '#EAF6F2' : '#FFF3E6',
                color: message.isFromPipo ? '#2F4F4F' : '#4A3B2F',
                boxShadow: message.isFromPipo 
                  ? '0 2px 12px rgba(0, 0, 0, 0.06)' 
                  : '0 2px 12px rgba(0, 0, 0, 0.08)'
              }}
            >
              <p 
                className="leading-relaxed" 
                style={{ 
                  fontSize: '16px', 
                  fontWeight: 500, 
                  lineHeight: 1.5,
                  letterSpacing: '0.3px'
                }}
                data-testid="message-content"
              >
                {message.content}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-end gap-3 justify-start">
            <div className="w-8 h-8 bg-amber-100/60 rounded-full flex items-center justify-center flex-shrink-0">
              <PipoMascot size="small" expression="neutral" />
            </div>
            <div 
              className="px-5 py-4 rounded-3xl rounded-bl-lg"
              style={{ background: '#EAF6F2', boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)" }}
            >
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-amber-400/60 rounded-full animate-pulse" style={{ animationDelay: "0s", animationDuration: "1.5s" }}></div>
                <div className="w-2 h-2 bg-amber-400/60 rounded-full animate-pulse" style={{ animationDelay: "0.3s", animationDuration: "1.5s" }}></div>
                <div className="w-2 h-2 bg-amber-400/60 rounded-full animate-pulse" style={{ animationDelay: "0.6s", animationDuration: "1.5s" }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-20 left-0 right-0 px-4 pb-4" data-testid="voice-input-area">
        <p className="text-center text-xs text-amber-700/40 italic mb-3">
          {reassurance}
        </p>
        
        <div 
          className="rounded-full p-2 flex items-center gap-2"
          style={{
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)"
          }}
        >
          <textarea
            ref={inputRef}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t.chat.placeholder}
            className="flex-1 px-4 py-3 bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-700 placeholder:text-amber-400/60 resize-none text-base"
            style={{ minHeight: "44px", maxHeight: "100px" }}
            rows={1}
            disabled={sendMessageMutation.isPending}
            data-testid="text-input"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!textInput.trim() || sendMessageMutation.isPending}
            className="w-11 h-11 rounded-full bg-amber-200/80 hover:bg-amber-300/80 text-amber-700 shadow-none border-none soft-tap disabled:opacity-40"
            data-testid="button-send-text"
          >
            <Heart className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <Dialog open={showGuestPopup} onOpenChange={setShowGuestPopup}>
        <DialogContent 
          className="w-[85%] max-w-[340px] rounded-3xl p-6 border-none"
          style={{
            background: "linear-gradient(135deg, #fef7ed 0%, #ecfdf5 50%, #fdf4ff 100%)"
          }}
        >
          <DialogHeader className="items-center text-center">
            <div className="w-16 h-16 bg-amber-100/60 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-amber-700/60" />
            </div>
            <DialogTitle className="text-xl font-medium text-amber-800/80 mb-2">
              Pipo wants to know you!
            </DialogTitle>
            <DialogDescription className="text-amber-700/60 text-sm">
              To chat with Pipo and save your memories, please sign up or login first.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 mt-6">
            <Button 
              onClick={() => setLocation("/auth")}
              className="w-full rounded-full py-3 h-auto bg-amber-200/80 hover:bg-amber-300/80 text-amber-800 font-medium shadow-none border-none"
            >
              Sign Up / Login
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setShowGuestPopup(false)}
              className="w-full rounded-full py-3 h-auto text-amber-600/60 hover:text-amber-700 hover:bg-transparent font-medium"
            >
              Maybe later
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
