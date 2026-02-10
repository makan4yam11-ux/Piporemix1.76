import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Reminder } from "@shared/schema";
import PipoMascot from "./PipoMascot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, isToday, isTomorrow, addDays, isAfter } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Label } from "@/components/ui/label";

const REMINDER_EMOJIS = ["🌱", "💧", "📚", "🌙", "🦷", "🎒", "🪴", "🍎", "✨", "🌸", "🎵"];

const PASTEL_COLORS = [
  "bg-amber-50",
  "bg-rose-50", 
  "bg-sky-50",
  "bg-emerald-50",
  "bg-violet-50",
  "bg-orange-50",
  "bg-teal-50",
  "bg-pink-50",
];

function extractEmojiAndText(text: string): { emoji: string; cleanText: string } {
  for (const knownEmoji of REMINDER_EMOJIS) {
    if (text.startsWith(knownEmoji)) {
      return {
        emoji: knownEmoji,
        cleanText: text.slice(knownEmoji.length).trim()
      };
    }
  }
  return { emoji: "🌱", cleanText: text };
}

function getGentleTimeHint(date: Date): string {
  const hours = date.getHours();
  if (isToday(date)) {
    if (hours < 12) return "Morning";
    if (hours < 17) return "After school";
    return "Before bed";
  }
  return "Sometime soon";
}

export default function RemindersTab() {
  const [isAddingReminder, setIsAddingReminder] = useState(false);
  const [acknowledgedReminder, setAcknowledgedReminder] = useState<Reminder | null>(null);
  const [showSparkle, setShowSparkle] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    emoji: "🌱",
    date: format(new Date(), "yyyy-MM-dd"),
    timeOfDay: "after school"
  });

  const { data: reminders, isLoading } = useQuery<Reminder[]>({
    queryKey: ["/api/reminders"],
  });

  const createReminderMutation = useMutation({
    mutationFn: async (reminderData: any) => {
      const timeMap: Record<string, string> = {
        morning: "09:00",
        "after school": "15:30",
        "before bed": "20:30"
      };
      const dueDate = new Date(`${reminderData.date}T${timeMap[reminderData.timeOfDay] || "12:00"}`);
      const response = await apiRequest("POST", "/api/reminders", {
        title: `${reminderData.emoji} ${reminderData.title}`,
        description: "",
        dueDate,
        isCompleted: false
      });
      const reminder = await response.json();

      // Trigger star reward for creating reminder
      fetch("/api/stars/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventType: "reminder_created", amount: 1, metadata: { reminderId: reminder.id } })
      });

      return reminder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      setIsAddingReminder(false);
      resetForm();
    },
  });

  const deleteReminderMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/reminders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
    },
  });

  const resetForm = () => {
    setForm({
      title: "",
      emoji: "🌱",
      date: format(new Date(), "yyyy-MM-dd"),
      timeOfDay: "after school"
    });
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    createReminderMutation.mutate(form);
  };

  const handleReminderTap = (reminder: Reminder) => {
    setShowSparkle(reminder.id);
    setTimeout(() => {
      setShowSparkle(null);
      setAcknowledgedReminder(reminder);
    }, 600);
  };

  const handleAcknowledge = () => {
    if (acknowledgedReminder) {
      deleteReminderMutation.mutate(acknowledgedReminder.id);
    }
    setAcknowledgedReminder(null);
  };

  if (isLoading) {
    return (
      <div className="flex-1 min-h-screen bg-[#FFF9F0] p-6 pt-16">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-amber-100 rounded-xl w-2/3"></div>
          <div className="h-4 bg-amber-100 rounded-lg w-1/2"></div>
        </div>
      </div>
    );
  }

  const activeReminders = reminders?.filter(r => {
    const dueDate = new Date(r.dueDate);
    return !r.isCompleted && isAfter(addDays(dueDate, 1), new Date());
  }) || [];

  return (
    <div 
      className="pb-20 min-h-screen flex flex-col overflow-auto bg-[#FFF9F0]"
      data-testid="reminders-tab"
    >
      <div className="px-6 pt-14 pb-6 flex-shrink-0 bg-amber-50/50 rounded-b-[32px] mb-4">
        <h1 className="text-2xl font-bold text-amber-900/80 mb-1">
          Little Reminders
        </h1>
        <p className="text-sm text-amber-800/60 font-medium">
          Just helpful nudges
        </p>
      </div>

      <div className="flex-1 px-5 pb-8">
        {activeReminders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-32 h-32 bg-amber-100/30 rounded-full flex items-center justify-center mb-8">
              <PipoMascot size="large" expression="neutral" />
            </div>
            <p className="text-xl text-amber-900/70 font-bold mb-2">
              No reminders right now.
            </p>
            <p className="text-base text-amber-800/50">
              That's okay.
            </p>
            <Button
              onClick={() => {
                resetForm();
                setIsAddingReminder(true);
              }}
              className="mt-8 rounded-full px-8 py-6 h-auto bg-amber-200/50 hover:bg-amber-200/70 text-amber-900 font-bold shadow-none border-none text-lg transition-all"
            >
              Add a reminder
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {activeReminders.map((reminder, index) => {
              const { emoji, cleanText: title } = extractEmojiAndText(reminder.title);
              const pastelColor = PASTEL_COLORS[index % PASTEL_COLORS.length];
              const timeHint = getGentleTimeHint(new Date(reminder.dueDate));

              return (
                <div
                  key={reminder.id}
                  onClick={() => handleReminderTap(reminder)}
                  className={`relative ${pastelColor} rounded-[32px] p-6 cursor-pointer shadow-sm hover:shadow-md transition-all active:scale-[0.98]`}
                >
                  {showSparkle === reminder.id && (
                    <div className="absolute top-4 right-4 animate-bounce">
                      <span className="text-2xl">✨</span>
                    </div>
                  )}
                  
                  <div className="flex flex-col items-center text-center gap-3">
                    <span className="text-5xl mb-1">{emoji}</span>
                    <p className="text-xl text-gray-800 font-bold leading-relaxed">
                      {title}
                    </p>
                    <p className="text-base text-gray-500/80 italic font-medium">
                      “{timeHint}”
                    </p>
                  </div>
                </div>
              );
            })}

            <div className="pt-6 flex justify-center">
              <Button
                onClick={() => {
                  resetForm();
                  setIsAddingReminder(true);
                }}
                className="rounded-full px-8 py-3 h-auto bg-white/80 hover:bg-white text-amber-900/80 font-bold shadow-sm border-none"
              >
                + Add a reminder
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!acknowledgedReminder} onOpenChange={() => setAcknowledgedReminder(null)}>
        <DialogContent className="w-[85%] max-w-[320px] rounded-[32px] p-8 border-none shadow-xl bg-white">
          <VisuallyHidden>
            <DialogTitle>Got it!</DialogTitle>
            <DialogDescription>A gentle reminder acknowledgment</DialogDescription>
          </VisuallyHidden>
          <div className="flex flex-col items-center text-center gap-6 py-2">
            <span className="text-6xl">✨</span>
            <p className="text-2xl text-amber-900 font-black">
              Got it 🌱
            </p>
            <div className="flex flex-col gap-3 w-full pt-4">
              <Button
                onClick={handleAcknowledge}
                className="w-full rounded-full py-4 h-auto bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold shadow-none border-none text-lg"
              >
                Okay 💛
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddingReminder} onOpenChange={setIsAddingReminder}>
        <DialogContent className="w-[90%] max-w-[360px] rounded-[32px] p-8 border-none shadow-2xl bg-[#FFFBF5]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-amber-900 text-center mb-2">
              New Reminder
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label className="text-base font-bold text-amber-800/70">Pick an emoji</Label>
              <div className="flex flex-wrap gap-2 justify-center">
                {REMINDER_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setForm({ ...form, emoji })}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all ${
                      form.emoji === emoji 
                        ? "bg-amber-200 scale-110 shadow-sm" 
                        : "bg-white border border-amber-100 hover:bg-amber-50"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-bold text-amber-800/70">What to remember?</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Brush teeth"
                className="rounded-2xl border-amber-100 h-14 bg-white text-lg px-5 shadow-sm focus:ring-amber-200 font-medium"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-bold text-amber-800/70">When?</Label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { value: "morning", label: "🌅 Morning" },
                  { value: "after school", label: "🎒 After school" },
                  { value: "before bed", label: "🦷 Before bed" }
                ].map((time) => (
                  <button
                    key={time.value}
                    onClick={() => setForm({ ...form, timeOfDay: time.value })}
                    className={`py-4 px-6 rounded-2xl text-lg font-bold transition-all text-left flex items-center justify-between ${
                      form.timeOfDay === time.value
                        ? "bg-amber-200 text-amber-900 shadow-sm"
                        : "bg-white border border-amber-50 text-amber-800/60 hover:bg-amber-50"
                    }`}
                  >
                    {time.label}
                    {form.timeOfDay === time.value && <span className="text-xl">✨</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={!form.title.trim() || createReminderMutation.isPending}
              className="w-full rounded-full py-4 h-auto bg-amber-300 hover:bg-amber-400 text-amber-900 font-black shadow-sm border-none disabled:opacity-50 text-lg"
            >
              Save 🌱
            </Button>
            <Button
              variant="ghost"
              onClick={() => setIsAddingReminder(false)}
              className="w-full rounded-full py-3 h-auto text-amber-600/60 hover:text-amber-700 hover:bg-transparent font-bold"
            >
              Maybe later
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}