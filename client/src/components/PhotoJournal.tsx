import { useState, useRef, useEffect, useMemo } from "react";
import { format, addDays, startOfDay, startOfWeek, startOfMonth, endOfWeek, endOfMonth, isSameDay, isWithinInterval } from "date-fns";
import { ChevronLeft, ChevronRight, ChevronDown, Image as ImageIcon, X, Trash2, Plus, Calendar as CalendarIcon, Smile, Meh, Frown, Lightbulb, Lock, Unlock, EyeOff, Mic, Square, Laugh, Annoyed, Pencil, Filter, LayoutGrid } from "lucide-react";
import { Button } from "./ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { motion, AnimatePresence } from "framer-motion";

interface JournalEntry {
  id: string;
  content: string;
  photos?: string;
  voiceNotes?: string;
  mood?: string;
  tags?: string;
  isHidden?: boolean;
  createdAt: string;
}

interface NewEntryData {
  content: string;
  photos?: string;
  voiceNotes?: string;
  mood?: string;
  tags?: string;
  isHidden?: boolean;
  createdAt?: string;
}

const PROMPTS = [
  "What's one small thing that made you smile today?",
  "How are you feeling right now, and why?",
  "What was the biggest challenge you faced today?",
  "Write down one thing you're grateful for.",
  "What would you like to accomplish tomorrow?"
];

const MOODS = [
  { id: 'happy', icon: Smile, color: 'text-green-500', bg: 'bg-green-50', dotColor: '#FBBF24' },
  { id: 'neutral', icon: Meh, color: 'text-blue-500', bg: 'bg-blue-50', dotColor: '#A78BFA' },
  { id: 'sad', icon: Frown, color: 'text-orange-500', bg: 'bg-orange-50', dotColor: '#FB923C' },
];

const TAGS = ['Personal', 'Work', 'Ideas', 'Health'];
const TIME_PERIODS = ['Daily', 'Weekly', 'Monthly'] as const;
type TimePeriod = typeof TIME_PERIODS[number];

function getEntryTitle(content: string): string {
  const firstLine = content.split('\n')[0].trim();
  if (firstLine.length > 35) {
    return firstLine.substring(0, 35) + '...';
  }
  return firstLine || "Untitled";
}

function getEntryPreview(content: string): string {
  const lines = content.split('\n');
  const preview = lines.length > 1 ? lines.slice(1).join(' ').trim() : '';
  if (preview.length > 50) {
    return preview.substring(0, 50) + '...';
  }
  return preview;
}

export function PhotoJournal() {
  const t = useTranslation();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [content, setContent] = useState(() => {
    const dateKey = format(startOfDay(new Date()), "yyyy-MM-dd");
    return localStorage.getItem(`journal_draft_${dateKey}`) || "";
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [voiceNotes, setVoiceNotes] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showMoodLanding, setShowMoodLanding] = useState(true);
  const [pressedMood, setPressedMood] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedEnergy, setSelectedEnergy] = useState<string | null>(null);
  // Intro state management
  const [showIntro, setShowIntro] = useState(true);
  const [introPhase, setIntroPhase] = useState<'typing1' | 'pause' | 'deleting' | 'typing2' | 'pause2' | 'typing3' | 'fadeout'>('typing1');
  const [introText, setIntroText] = useState("");
  const [canSkip, setCanSkip] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showOutro, setShowOutro] = useState(false);
  const [outroPhase, setOutroPhase] = useState<'typing1' | 'pause' | 'typing2' | 'fadeout'>('typing1');
  const [outroText, setOutroText] = useState("");
  
  const firstSentence = "welcome to your journal";
  const secondSentence = "this space is ";
  const underlinedPart = "just for you.";
  const thirdSentence = "Before we write anything,";
  const outroSentence1 = "Thanks for telling me.";
  const outroSentence2 = "You can always tell me more in your journal.";

  // Update last visit time when leaving journal
  useEffect(() => {
    return () => {
      localStorage.setItem('journal_last_visit', Date.now().toString());
    };
  }, []);

  // Enable skip after 1 second
  useEffect(() => {
    if (showIntro) {
      const skipTimer = setTimeout(() => setCanSkip(true), 1000);
      return () => clearTimeout(skipTimer);
    }
  }, [showIntro]);

  // Handle skip on click
  const handleSkipIntro = () => {
    if (canSkip) {
      setIsFadingOut(true);
      setTimeout(() => {
        setShowIntro(false);
        localStorage.setItem('journal_last_visit', Date.now().toString());
      }, 500);
    }
  };

  // Main intro animation effect
  useEffect(() => {
    if (!showIntro || isFadingOut) return;

    let timer: NodeJS.Timeout;
    
    if (introPhase === 'typing1') {
      // Type first sentence character by character
      let i = 0;
      timer = setInterval(() => {
        setIntroText(firstSentence.slice(0, i + 1));
        i++;
        if (i >= firstSentence.length) {
          clearInterval(timer);
          setIntroPhase('pause');
        }
      }, 80);
    } else if (introPhase === 'pause') {
      // Pause for 1 second with blinking cursor
      timer = setTimeout(() => setIntroPhase('deleting'), 1000);
    } else if (introPhase === 'deleting') {
      // Delete characters one by one
      let currentText = firstSentence;
      timer = setInterval(() => {
        currentText = currentText.slice(0, -1);
        setIntroText(currentText);
        if (currentText.length === 0) {
          clearInterval(timer);
          setIntroPhase('typing2');
        }
      }, 40);
    } else if (introPhase === 'typing2') {
      // Type second sentence
      const fullSecond = secondSentence + underlinedPart;
      let i = 0;
      timer = setInterval(() => {
        setIntroText(fullSecond.slice(0, i + 1));
        i++;
        if (i >= fullSecond.length) {
          clearInterval(timer);
          setIntroPhase('pause2');
        }
      }, 80);
    } else if (introPhase === 'pause2') {
      // Pause before third sentence
      timer = setTimeout(() => {
        setIntroText("");
        setIntroPhase('typing3');
      }, 1200);
    } else if (introPhase === 'typing3') {
      // Type third sentence: "Before we write anything."
      let i = 0;
      timer = setInterval(() => {
        setIntroText(thirdSentence.slice(0, i + 1));
        i++;
        if (i >= thirdSentence.length) {
          clearInterval(timer);
          setIntroPhase('fadeout');
        }
      }, 80);
    } else if (introPhase === 'fadeout') {
      // Fade out after showing third sentence
      timer = setTimeout(() => {
        setIsFadingOut(true);
        setTimeout(() => {
          setShowIntro(false);
          localStorage.setItem('journal_last_visit', Date.now().toString());
        }, 1000);
      }, 1500);
    }

    return () => {
      clearInterval(timer);
      clearTimeout(timer);
    };
  }, [showIntro, introPhase, isFadingOut]);

  // Outro animation effect
  useEffect(() => {
    if (!showOutro) return;

    let timer: NodeJS.Timeout;
    
    if (outroPhase === 'typing1') {
      let i = 0;
      timer = setInterval(() => {
        setOutroText(outroSentence1.slice(0, i + 1));
        i++;
        if (i >= outroSentence1.length) {
          clearInterval(timer);
          setOutroPhase('pause');
        }
      }, 70);
    } else if (outroPhase === 'pause') {
      timer = setTimeout(() => setOutroPhase('typing2'), 800);
    } else if (outroPhase === 'typing2') {
      let i = 0;
      timer = setInterval(() => {
        setOutroText(outroSentence1 + "\n" + outroSentence2.slice(0, i + 1));
        i++;
        if (i >= outroSentence2.length) {
          clearInterval(timer);
          setOutroPhase('fadeout');
        }
      }, 50);
    } else if (outroPhase === 'fadeout') {
      timer = setTimeout(() => {
        setShowOutro(false);
        setIsEditing(true);
      }, 1800);
    }

    return () => {
      clearInterval(timer);
      clearTimeout(timer);
    };
  }, [showOutro, outroPhase]);

  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('Daily');
  const [showFilters, setShowFilters] = useState(false);
  const [isLocked, setIsLocked] = useState(() => localStorage.getItem("journal_is_locked") === "true");
  const [storedPasscode, setStoredPasscode] = useState(() => localStorage.getItem("journal_passcode") || "");

  const handleToggleLock = () => {
    if (!storedPasscode) {
      const newPasscode = window.prompt("Masukkan PIN baru untuk mengunci jurnal:");
      if (newPasscode) {
        localStorage.setItem("journal_passcode", newPasscode);
        setStoredPasscode(newPasscode);
        setIsLocked(true);
        localStorage.setItem("journal_is_locked", "true");
        toast({ description: "PIN berhasil disetel dan jurnal dikunci" });
      }
    } else {
      if (isLocked) {
        const input = window.prompt("Masukkan PIN untuk membuka kunci:");
        if (input === storedPasscode) {
          setIsLocked(false);
          localStorage.setItem("journal_is_locked", "false");
          toast({ description: "Jurnal dibuka" });
        } else if (input !== null) {
          toast({ variant: "destructive", description: "PIN salah" });
        }
      } else {
        setIsLocked(true);
        localStorage.setItem("journal_is_locked", "true");
        toast({ description: "Jurnal dikunci" });
      }
    }
  };
  const [isHidden, setIsHidden] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const [filterMood, setFilterMood] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [isPromptDismissed, setIsPromptDismissed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const dateKey = format(startOfDay(currentDate), "yyyy-MM-dd");
    if (isEditing && content.trim()) {
      localStorage.setItem(`journal_draft_${dateKey}`, content);
    }
  }, [content, currentDate, isEditing]);

  useEffect(() => {
    setCurrentPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
  }, [isEditing]);

  const { data: entries } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal/entries"],
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const moodFromUrl = params.get('mood');
    if (moodFromUrl) {
      // Set the mood text directly into the content if needed, 
      // or just use it to select the mood category.
      // feelings = Happy, Excited, Sleepy, Okay, Blessed, Thoughtful
      const mappedMood = 
        moodFromUrl === 'Happy' || moodFromUrl === 'Excited' || moodFromUrl === 'Blessed' ? 'happy' :
        moodFromUrl === 'Sleepy' || moodFromUrl === 'Thoughtful' ? 'neutral' : 
        moodFromUrl === 'Okay' ? 'neutral' : 'happy';
      
      setSelectedMood(mappedMood);
      
      // If we want the specific emoji/label in the text:
      const emojiMap: Record<string, string> = {
        'Happy': '😊',
        'Excited': '🥳',
        'Sleepy': '😴',
        'Okay': '😕',
        'Blessed': '😇',
        'Thoughtful': '🤔'
      };
      const emoji = emojiMap[moodFromUrl] || '';
      if (emoji) {
        setContent(prev => {
          const prefix = `Feeling: ${emoji} ${moodFromUrl}\n\n`;
          return prev.includes(prefix) ? prev : prefix + prev;
        });
      }

      setIsEditing(true);
      setShowMoodLanding(false);
      
      // Clean up the URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const filteredEntries = useMemo(() => {
    let result = (entries || []).filter(entry => {
      if (isLocked && entry.isHidden) return false;
      if (filterMood && entry.mood !== filterMood) return false;
      if (filterTags.length > 0) {
        const entryTags = entry.tags ? JSON.parse(entry.tags) : [];
        if (!filterTags.every(tag => entryTags.includes(tag))) return false;
      }
      return true;
    });

    if (timePeriod === 'Daily') {
      result = result.filter(entry => isSameDay(new Date(entry.createdAt), currentDate));
    } else if (timePeriod === 'Weekly') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
      result = result.filter(entry => {
        const entryDate = new Date(entry.createdAt);
        return isWithinInterval(entryDate, { start: weekStart, end: weekEnd });
      });
    } else if (timePeriod === 'Monthly') {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      result = result.filter(entry => {
        const entryDate = new Date(entry.createdAt);
        return isWithinInterval(entryDate, { start: monthStart, end: monthEnd });
      });
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [entries, isLocked, filterMood, filterTags, timePeriod, currentDate]);

  const groupedEntries = useMemo(() => {
    return filteredEntries.reduce((groups, entry) => {
      const dateKey = format(new Date(entry.createdAt), "EEE, d MMM");
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(entry);
      return groups;
    }, {} as Record<string, JournalEntry[]>);
  }, [filteredEntries]);

  const stats = useMemo(() => {
    const totalEntries = filteredEntries.length;
    const moodCounts = filteredEntries.reduce((acc, entry) => {
      if (entry.mood) acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const tagCounts = filteredEntries.reduce((acc, entry) => {
      const tags = entry.tags ? JSON.parse(entry.tags) : [];
      tags.forEach((tag: string) => {
        if (!tag.startsWith('Energy:')) acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);
    return { totalEntries, moodCounts, tagCounts };
  }, [filteredEntries]);

  const createEntryMutation = useMutation({
    mutationFn: async (data: NewEntryData) => {
      const response = await fetch("/api/journal/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create journal entry");
      const entry = await response.json();

      // Trigger star reward
      const lineCount = data.content.split('\n').filter(line => line.trim().length > 0).length;
      const isExtended = lineCount >= 3 || !!data.voiceNotes;
      const starsEarned = isExtended ? 2 : 1;
      
      await fetch("/api/stars/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          eventType: isExtended ? "extended_journal_entry" : "journal_entry_created", 
          amount: starsEarned,
          metadata: { entryId: entry.id }
        })
      });

      return entry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal/entries"] });
      const dateKey = format(startOfDay(currentDate), "yyyy-MM-dd");
      localStorage.removeItem(`journal_draft_${dateKey}`);
      setIsEditing(false);
      setContent("");
      setPhotos([]);
      setVoiceNotes([]);
      setSelectedMood(null);
      setSelectedTags([]);
      setIsHidden(false);
      setIsPromptDismissed(false);
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async (entryId: string) => {
      const response = await fetch(`/api/journal/entries/${entryId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete journal entry");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal/entries"] });
      toast({ description: "Entri berhasil dihapus" });
    },
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("photo", file);
      const response = await fetch("/api/upload/photo", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to upload photo");
      return response.json();
    },
    onSuccess: (data) => {
      setPhotos(prev => [...prev, data.path]);
    },
  });

  const uploadVoiceMutation = useMutation({
    mutationFn: async (blob: Blob) => {
      const formData = new FormData();
      formData.append("voice", blob, "recording.webm");
      const response = await fetch("/api/upload/voice", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to upload voice note");
      return response.json();
    },
    onSuccess: (data) => {
      setVoiceNotes(prev => [...prev, data.path]);
    },
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        uploadVoiceMutation.mutate(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      toast({ variant: "destructive", description: "Tidak dapat mengakses mikrofon" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadPhotoMutation.mutate(file);
  };

  const handleSave = () => {
    if (content.trim()) {
      const now = new Date();
      const combinedDate = new Date(currentDate);
      combinedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
      const finalTags = [...selectedTags];
      if (selectedEnergy) finalTags.push(`Energy: ${selectedEnergy}`);
      createEntryMutation.mutate({
        content,
        photos: photos.length > 0 ? JSON.stringify(photos) : undefined,
        voiceNotes: voiceNotes.length > 0 ? JSON.stringify(voiceNotes) : undefined,
        mood: selectedMood || undefined,
        tags: finalTags.length > 0 ? JSON.stringify(finalTags) : undefined,
        isHidden,
        createdAt: combinedDate.toISOString(),
      });
    }
  };

  const handleEdit = (entry: JournalEntry) => {
    setIsEditing(true);
    setContent(entry.content);
    setPhotos(entry.photos ? JSON.parse(entry.photos) : []);
    setVoiceNotes(entry.voiceNotes ? JSON.parse(entry.voiceNotes) : []);
    setSelectedMood(entry.mood || null);
    setSelectedTags(entry.tags ? JSON.parse(entry.tags) : []);
    setIsHidden(entry.isHidden || false);
  };

  const handleDelete = (entryId: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus entri ini?")) {
      deleteEntryMutation.mutate(entryId);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const navigatePeriod = (direction: 'prev' | 'next') => {
    const delta = direction === 'next' ? 1 : -1;
    if (timePeriod === 'Daily') setCurrentDate(addDays(currentDate, delta));
    else if (timePeriod === 'Weekly') setCurrentDate(addDays(currentDate, delta * 7));
    else setCurrentDate(addDays(currentDate, delta * 30));
  };

  const getPeriodLabel = () => {
    if (timePeriod === 'Daily') return format(currentDate, "EEE, d MMM");
    if (timePeriod === 'Weekly') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(start, "d MMM")} - ${format(end, "d MMM")}`;
    }
    return format(currentDate, "MMMM yyyy");
  };

  const getMoodDotColor = (mood?: string) => {
    if (!mood) return '#E5E7EB';
    const moodItem = MOODS.find(m => m.id === mood);
    return moodItem?.dotColor || '#E5E7EB';
  };

  const MOOD_LANDING_ITEMS = [
    { id: 'awful', emoji: '😢', color: '#64748b', label: 'awful', delay: 0 },
    { id: 'fugly', emoji: '😔', color: '#3b82f6', label: 'fugly', delay: 0.3 },
    { id: 'meh', emoji: '😐', color: '#a855f7', label: 'meh', delay: 0.6 },
    { id: 'good', emoji: '🙂', color: '#22c55e', label: 'good', delay: 0.9 },
    { id: 'rad', emoji: '😄', color: '#f59e0b', label: 'rad', delay: 1.2 },
  ];

  const handleMoodSelect = (moodId: string) => {
    setPressedMood(moodId);
    const today = format(new Date(), "yyyy-MM-dd");
    localStorage.setItem(`mood_recorded_${today}`, 'true');
    setSelectedMood(moodId === 'rad' || moodId === 'good' ? 'happy' : moodId === 'meh' ? 'neutral' : 'sad');
    
    setTimeout(() => {
      setShowMoodLanding(false);
      setShowOutro(true);
      setOutroPhase('typing1');
      setOutroText("");
      setPressedMood(null);
    }, 2000);
  };

    // Intro screen - shown before any other content
    if (showIntro) {
      // Render text with underline for "just for you." during typing2 phase
      const renderIntroText = () => {
        if (introPhase === 'typing2' || (introPhase === 'pause2' && introText === secondSentence + underlinedPart)) {
          // Check if we've started typing the underlined part
          if (introText.length > secondSentence.length) {
            const normalPart = introText.slice(0, secondSentence.length);
            const underlinedTyped = introText.slice(secondSentence.length);
            return (
              <>
                {normalPart}
                <span className="underline decoration-2 underline-offset-4">{underlinedTyped}</span>
              </>
            );
          }
          return introText;
        }
        return introText;
      };

    return (
      <motion.div 
        className="flex-1 flex items-center justify-center p-[4vw] cursor-pointer select-none"
        style={{ backgroundColor: '#FDF8F3' }}
        onClick={handleSkipIntro}
        initial={{ opacity: 0 }}
        animate={{ opacity: isFadingOut ? 0 : 1 }}
        transition={{ duration: isFadingOut ? 0.5 : 0.5 }}
      >
        <div className="text-center">
          <p className="text-responsive-xl font-medium tracking-wide" style={{ color: '#5D4E37' }}>
            {renderIntroText()}
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.53, repeat: Infinity, repeatType: "reverse" }}
              className="inline-block w-[0.15rem] h-[1.2em] ml-[0.25rem] align-middle"
              style={{ backgroundColor: '#8B7355' }}
            />
          </p>
        </div>
      </motion.div>
    );
  }

  if (showOutro) {
    const outroLines = outroText.split("\n");
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: outroPhase === 'fadeout' ? 0 : 1 }}
        transition={{ duration: outroPhase === 'fadeout' ? 1.2 : 0.8 }}
        className="flex-1 flex items-center justify-center p-[4vw]"
        style={{ backgroundColor: '#FDF8F3' }}
      >
        <div className="text-center max-w-[min(24rem,85vw)]">
          <p className="text-responsive-lg font-medium tracking-wide leading-relaxed whitespace-pre-line" style={{ color: '#5D4E37' }}>
            {outroLines[0]}
            {outroLines[1] && (
              <>
                <br />
                <span className="text-responsive-base">{outroLines[1]}</span>
              </>
            )}
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.53, repeat: Infinity, repeatType: "reverse" }}
              className="inline-block w-[0.15rem] h-[1.2em] ml-[0.25rem] align-middle"
              style={{ backgroundColor: '#8B7355' }}
            />
          </p>
        </div>
      </motion.div>
    );
  }

  if (showMoodLanding && !isEditing) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="flex-1 flex flex-col items-center justify-center p-[4vw] overflow-hidden safe-area-all"
        style={{ backgroundColor: '#FDF8F3' }}
      >
        <div className="w-full max-w-[min(28rem,90vw)] flex flex-col items-center justify-center space-y-[clamp(2rem,8vw,4rem)]">
          <div className="text-center space-y-[clamp(0.5rem,2vw,1rem)]">
            <h1 className="text-responsive-3xl font-black tracking-tighter uppercase" style={{ color: '#5D4E37' }}>How's your day?</h1>
            <p className="text-responsive-sm font-medium max-w-[20rem] mx-auto" style={{ color: '#8B7355' }}>
              Just pick what feels closest.
            </p>
          </div>
          
          <div className="grid grid-cols-5 gap-[clamp(0.5rem,2.5vw,1.25rem)] w-full">
            {MOOD_LANDING_ITEMS.map((m) => (
              <motion.button
                key={m.id}
                onClick={() => handleMoodSelect(m.id)}
                disabled={pressedMood !== null}
                className="flex flex-col items-center gap-[clamp(0.5rem,2vw,1rem)] group touch-target disabled:pointer-events-none"
                initial={{ opacity: 0, y: 10 }}
                animate={{ 
                  opacity: pressedMood === m.id ? 1 : pressedMood !== null ? 0.4 : 1, 
                  y: 0,
                  scale: pressedMood === m.id ? 0.92 : 1
                }}
                transition={{ 
                  delay: pressedMood !== null ? 0 : m.delay * 0.15, 
                  duration: pressedMood !== null ? 0.4 : 0.6,
                  ease: "easeOut"
                }}
              >
                <motion.div 
                  className="w-full aspect-square rounded-[clamp(1rem,4vw,1.5rem)] border-2 flex items-center justify-center shadow-sm transition-shadow overflow-hidden"
                  style={{ borderColor: '#B8E0D2', backgroundColor: 'rgba(255,255,255,0.8)' }}
                  animate={pressedMood === m.id ? {
                    scale: [1, 0.95, 1.02, 1],
                    boxShadow: [`0 0 0 0 #B8E0D240`, `0 0 20px 8px #B8E0D260`, `0 0 30px 12px #B8E0D240`, `0 0 40px 16px #B8E0D220`]
                  } : { 
                    y: [0, -3, 0, 2, 0],
                    rotate: [-1, 1, -0.5, 0.5, 0]
                  }}
                  transition={pressedMood === m.id ? {
                    duration: 0.8,
                    ease: "easeInOut"
                  } : { 
                    duration: 4 + m.delay,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: m.delay
                  }}
                >
                  <span className="text-[clamp(1.5rem,6vw,2.5rem)]">{m.emoji}</span>
                </motion.div>
                <span className="text-responsive-xs font-bold lowercase tracking-wide truncate w-full text-center" style={{ color: '#8B7355' }}>{m.label}</span>
              </motion.button>
            ))}
          </div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="text-responsive-xs font-medium text-center"
            style={{ color: '#8B7355' }}
          >
            You can change this anytime in your journal.
          </motion.p>
        </div>
      </motion.div>
    );
  }

  if (isEditing) {
    return (
      <div className="flex-1 flex flex-col min-h-0" style={{ backgroundColor: '#FDF8F3' }}>
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-[4vw] max-w-[min(42rem,100%)] mx-auto w-full pb-[max(env(safe-area-inset-bottom,0px),8rem)]">
          <div className="rounded-[clamp(1.5rem,6vw,2rem)] shadow-lg p-[clamp(1rem,4vw,1.5rem)] min-h-[50vh]" style={{ backgroundColor: 'white', border: '1px solid #E8DDD4' }}>
            <div className="space-y-[clamp(1rem,4vw,2rem)]">
              <div className="flex items-center justify-between border-b pb-[clamp(0.75rem,3vw,1.25rem)]" style={{ borderColor: '#E8DDD4' }}>
                <div>
                  <p className="text-responsive-xs font-black uppercase tracking-[0.2em] mb-[0.25vh]" style={{ color: '#8B7355' }}>{format(currentDate, "EEEE, d MMMM")}</p>
                  <h1 className="text-responsive-xl font-black tracking-tight" style={{ color: '#5D4E37' }}>New Entry</h1>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="font-bold touch-target" style={{ color: '#8B7355' }}>Cancel</Button>
              </div>

              <div className="flex gap-[clamp(0.5rem,2vw,1rem)]">
                {MOODS.map((mood) => {
                  const Icon = mood.icon;
                  const isSelected = selectedMood === mood.id;
                  return (
                    <button key={mood.id} type="button" onClick={() => setSelectedMood(isSelected ? null : mood.id)}
                      className={cn("p-[clamp(0.5rem,2vw,0.75rem)] rounded-[clamp(0.75rem,3vw,1rem)] transition-all border-2 touch-target", isSelected ? mood.bg + " border-current shadow-sm" : "bg-muted/30 border-transparent hover:bg-muted")}>
                      <Icon className={cn("icon-responsive-md", isSelected ? mood.color : "text-muted-foreground/50")} />
                    </button>
                  );
                })}
              </div>

              {showPrompt && !isPromptDismissed && (
                <div className="bg-primary/5 p-[clamp(0.75rem,3vw,1.25rem)] rounded-[clamp(0.75rem,3vw,1rem)] relative border border-primary/10 shadow-sm">
                  <div className="flex items-center justify-between mb-[clamp(0.5rem,2vw,0.75rem)]">
                    <div className="flex items-center gap-[clamp(0.375rem,1.5vw,0.625rem)] text-primary">
                      <Lightbulb className="icon-responsive-sm" />
                      <span className="text-responsive-xs font-black uppercase tracking-widest">Inspiration</span>
                    </div>
                    <button onClick={() => setIsPromptDismissed(true)} className="text-primary/30 hover:text-primary p-[0.25rem] transition-colors touch-target">
                      <X className="icon-responsive-sm" />
                    </button>
                  </div>
                  <p className="text-primary font-medium text-responsive-sm leading-relaxed">{currentPrompt}</p>
                </div>
              )}

              <div className="relative">
                <textarea 
                  autoFocus 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="You can write one word, one sentence, or nothing at all."
                  aria-label="Journal entry"
                  spellCheck={false}
                  className="w-full min-h-[30vh] text-responsive-base focus:outline-none resize-none bg-transparent relative z-10 font-medium" 
                  style={{ lineHeight: '1.7', color: '#5D4E37' }}
                />
              </div>

              <div className="space-y-[clamp(1rem,4vw,1.5rem)] border-t border-border/50 pt-[clamp(1rem,4vw,1.5rem)]">
                <div className="flex flex-wrap gap-[clamp(0.375rem,1.5vw,0.5rem)]">
                  {TAGS.map(tag => (
                    <button key={tag} type="button" onClick={() => toggleTag(tag)}
                      className={cn("px-[clamp(0.75rem,3vw,1rem)] py-[clamp(0.25rem,1vw,0.375rem)] rounded-[clamp(0.5rem,2vw,0.75rem)] text-responsive-xs font-bold transition-all border touch-target",
                        selectedTags.includes(tag) ? "bg-foreground text-background border-foreground shadow-md" : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted")}>
                      {tag}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-[clamp(0.5rem,2vw,0.75rem)] flex-wrap">
                  <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} className="h-[clamp(2.25rem,9vw,2.5rem)] px-[clamp(0.75rem,3vw,1rem)] rounded-[clamp(0.5rem,2vw,0.75rem)] text-responsive-xs font-bold gap-[clamp(0.375rem,1.5vw,0.5rem)] touch-target">
                    <ImageIcon className="icon-responsive-sm" /> Photo
                  </Button>
                  <Button variant="secondary" size="sm" onClick={isRecording ? stopRecording : startRecording}
                    className={cn("h-[clamp(2.25rem,9vw,2.5rem)] px-[clamp(0.75rem,3vw,1rem)] rounded-[clamp(0.5rem,2vw,0.75rem)] text-responsive-xs font-bold gap-[clamp(0.375rem,1.5vw,0.5rem)] touch-target", isRecording ? "bg-red-500 text-white hover:bg-red-600" : "")}>
                    {isRecording ? <Square className="icon-responsive-sm" /> : <Mic className="icon-responsive-sm" />}
                    {isRecording ? "Stop" : "Voice"}
                  </Button>
                  <div className="flex-1" />
                  <div className="flex items-center gap-[clamp(0.375rem,1.5vw,0.625rem)] px-[clamp(0.5rem,2vw,0.75rem)] py-[clamp(0.25rem,1vw,0.375rem)] bg-muted/30 rounded-[clamp(0.5rem,2vw,0.75rem)] border border-border/50">
                    <EyeOff className="icon-responsive-sm text-muted-foreground" />
                    <Switch checked={isHidden} onCheckedChange={setIsHidden} className="scale-75" />
                  </div>
                </div>

                {photos.length > 0 && (
                  <div className="flex gap-[clamp(0.5rem,2vw,0.75rem)] overflow-x-auto pb-[0.5vh] no-scrollbar">
                    {photos.map((photo, i) => (
                      <div key={i} className="relative w-[clamp(4rem,16vw,5rem)] h-[clamp(4rem,16vw,5rem)] rounded-[clamp(0.75rem,3vw,1rem)] overflow-hidden shrink-0 shadow-md border-2 border-background">
                        <img src={photo} className="w-full h-full object-cover" />
                        <button onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                          className="absolute top-[5%] right-[5%] p-[0.25rem] bg-black/60 backdrop-blur-sm rounded-full text-white shadow-lg touch-target">
                          <X className="icon-responsive-sm" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <Button onClick={handleSave} disabled={createEntryMutation.isPending || !content.trim()}
                  className="w-full h-[clamp(3rem,12vw,3.5rem)] rounded-[clamp(1.5rem,6vw,2rem)] font-black text-responsive-base shadow-lg transition-all active:scale-[0.98] touch-target"
                  style={{ backgroundColor: '#B8E0D2', color: '#3D5A4C' }}>
                  {createEntryMutation.isPending ? "Saving..." : "Keep this"}
                </Button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0" style={{ backgroundColor: '#FDF8F3' }}>
      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
        <div className="sticky top-0 z-20 backdrop-blur-md" style={{ backgroundColor: 'rgba(253, 248, 243, 0.9)', borderBottom: '1px solid #E8DDD4' }}>
          <div className="max-w-[min(42rem,100%)] mx-auto px-[4vw] pt-[max(env(safe-area-inset-top,0px),1.25rem)] pb-[clamp(0.5rem,2vw,0.75rem)] space-y-[clamp(0.75rem,3vw,1rem)]">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <h1 className="text-responsive-xl font-semibold tracking-tight" style={{ color: '#5D4E37' }}>Journal</h1>
                <p className="text-responsive-xs" style={{ color: '#8B7355' }}>A quiet place for your thoughts</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-[clamp(0.5rem,2vw,1rem)] flex-wrap">
              <div className="flex items-center gap-[0.25rem]">
                <Button variant="ghost" size="icon" onClick={() => navigatePeriod('prev')} className="w-[clamp(1.75rem,7vw,2rem)] h-[clamp(1.75rem,7vw,2rem)] text-muted-foreground touch-target">
                  <ChevronLeft className="icon-responsive-sm" />
                </Button>
                <span className="text-responsive-xs font-black uppercase tracking-widest text-foreground min-w-[clamp(5rem,20vw,6.25rem)] text-center">{getPeriodLabel()}</span>
                <Button variant="ghost" size="icon" onClick={() => navigatePeriod('next')} className="w-[clamp(1.75rem,7vw,2rem)] h-[clamp(1.75rem,7vw,2rem)] text-muted-foreground touch-target">
                  <ChevronRight className="icon-responsive-sm" />
                </Button>
              </div>
              
              <div className="flex bg-muted/50 rounded-[clamp(0.5rem,2vw,0.75rem)] p-[0.25rem] border border-border/50">
                {TIME_PERIODS.map(period => (
                  <button key={period} onClick={() => setTimePeriod(period)}
                    className={cn("px-[clamp(0.5rem,2vw,0.75rem)] py-[clamp(0.25rem,1vw,0.375rem)] rounded-[clamp(0.375rem,1.5vw,0.5rem)] text-responsive-xs font-black uppercase tracking-wider transition-all touch-target",
                      timePeriod === period ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                    {period}
                  </button>
                ))}
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-[clamp(0.5rem,2vw,0.75rem)] w-[clamp(2.25rem,9vw,2.5rem)] h-[clamp(2.25rem,9vw,2.5rem)] touch-target" style={{ backgroundColor: 'white', border: '1px solid #E8DDD4', color: '#8B7355' }}>
                    <CalendarIcon className="icon-responsive-md" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border border-border shadow-2xl rounded-[clamp(0.75rem,3vw,1rem)] bg-card" align="end">
                  <Calendar mode="single" selected={currentDate} onSelect={(date) => date && setCurrentDate(date)}
                    initialFocus className="rounded-[clamp(0.75rem,3vw,1rem)] bg-card" />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>


        <div className="max-w-[min(42rem,100%)] mx-auto px-[4vw] pb-[max(env(safe-area-inset-bottom,0px),8rem)] space-y-[clamp(1.5rem,6vw,2rem)]">
          {isLocked ? (
            <div className="flex flex-col items-center justify-center py-[10vh] text-center space-y-[clamp(1rem,4vw,1.5rem)] rounded-[clamp(1.5rem,6vw,2rem)]" style={{ backgroundColor: 'rgba(255,255,255,0.6)', border: '2px dashed #E8DDD4' }}>
              <div className="avatar-responsive-lg rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(251, 146, 60, 0.1)' }}>
                <Lock className="icon-responsive-lg text-orange-500" />
              </div>
              <div className="space-y-[0.5vh]">
                <h3 className="text-responsive-base font-semibold tracking-tight" style={{ color: '#5D4E37' }}>Journal Protected</h3>
                <p className="text-responsive-sm font-medium" style={{ color: '#8B7355' }}>Your private thoughts are safely locked.</p>
              </div>
              <Button onClick={handleToggleLock} className="rounded-[clamp(1.5rem,6vw,2rem)] bg-orange-500 hover:bg-orange-600 text-white font-medium px-[clamp(1.5rem,6vw,2rem)] h-[clamp(2.5rem,10vw,3rem)] touch-target text-responsive-sm">
                Unlock Now
              </Button>
            </div>
          ) : Object.keys(groupedEntries).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-[10vh] text-center space-y-[clamp(0.75rem,3vw,1rem)] rounded-[clamp(1.5rem,6vw,2rem)]" style={{ backgroundColor: 'rgba(255,255,255,0.5)', border: '2px dashed #E8DDD4' }}>
              <span className="text-4xl">🌱</span>
              <div className="space-y-[0.25vh]">
                <p className="font-medium tracking-tight text-responsive-sm" style={{ color: '#5D4E37' }}>Your journal is waiting</p>
                <p className="text-responsive-xs font-medium" style={{ color: '#8B7355' }}>for your first thought</p>
              </div>
            </div>
          ) : (
            Object.entries(groupedEntries).map(([dateLabel, dateEntries]) => (
              <div key={dateLabel} className="space-y-4">
                <div className="flex items-center gap-3 sticky top-[140px] z-10">
                  <div className="shadow-sm px-4 py-1.5 rounded-full inline-flex items-center gap-2" style={{ backgroundColor: '#FDF8F3', border: '1px solid #E8DDD4' }}>
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#B8E0D2' }} />
                    <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#5D4E37' }}>{dateLabel}</span>
                  </div>
                </div>

                <div className="space-y-4 pl-4 ml-4" style={{ borderLeft: '2px solid #E8DDD4' }}>
                  {dateEntries.map((entry) => {
                    const entryPhotos = entry.photos ? JSON.parse(entry.photos) : [];
                    const entryTags = entry.tags ? JSON.parse(entry.tags).filter((t: string) => !t.startsWith('Energy:')) : [];
                    const isExpanded = expandedEntry === entry.id;

                    return (
                      <div key={entry.id} onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                        className={cn("group rounded-[1.5rem] p-5 transition-all duration-300 cursor-pointer hover:shadow-lg relative overflow-hidden",
                          isExpanded ? "shadow-lg" : "shadow-sm")}
                        style={{ backgroundColor: 'white', border: '1px solid #E8DDD4' }}>
                        
                        <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: getMoodDotColor(entry.mood) }} />

                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner" style={{ backgroundColor: '#FDF8F3', border: '1px solid #E8DDD4' }}>
                                {(() => {
                                  const MoodIcon = MOODS.find(m => m.id === entry.mood)?.icon || Smile;
                                  return <MoodIcon className="w-5 h-5" style={{ color: getMoodDotColor(entry.mood) }} />;
                                })()}
                              </div>
                              <div>
                                <h3 className="text-sm font-semibold tracking-tight line-clamp-1" style={{ color: '#5D4E37' }}>{getEntryTitle(entry.content)}</h3>
                                <p className="text-[10px] font-medium tracking-wide" style={{ color: '#8B7355' }}>{format(new Date(entry.createdAt), "HH:mm")}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all scale-90">
                              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEdit(entry); }} className="w-8 h-8 rounded-lg" style={{ color: '#8B7355' }}>
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }} className="w-8 h-8 rounded-lg hover:bg-red-50 hover:text-red-500">
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>

                          <div className={cn("relative transition-all duration-300", !isExpanded && "max-h-20 overflow-hidden")}>
                            <p className="text-sm leading-relaxed font-medium" style={{ color: '#8B7355' }}>
                              {isExpanded ? entry.content : getEntryPreview(entry.content)}
                            </p>
                            {!isExpanded && entry.content.length > 100 && (
                              <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white to-transparent" />
                            )}
                          </div>

                          {entryPhotos.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                              {entryPhotos.map((photo: string, idx: number) => (
                                <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-border shadow-sm shrink-0">
                                  <img src={photo} className="w-full h-full object-cover" />
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-2">
                            <div className="flex flex-wrap gap-1.5">
                              {entryTags.map((tag: string) => (
                                <Badge key={tag} variant="secondary" className="px-2 py-0 h-5 text-[9px] font-medium uppercase tracking-tighter border-none" style={{ backgroundColor: '#E8F4F0', color: '#3D5A4C' }}>
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <div className="h-7 px-2 text-[10px] font-medium tracking-wider flex items-center gap-1" style={{ color: '#8B7355' }}>
                              {isExpanded ? "Less" : "More"}
                              <ChevronDown className={cn("w-3 h-3 transition-transform duration-300", isExpanded && "rotate-180")} />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-5 backdrop-blur-xl z-40 mb-20 shadow-[0_-8px_30px_rgba(0,0,0,0.04)]" style={{ backgroundColor: 'rgba(253, 248, 243, 0.9)', borderTop: '1px solid #E8DDD4' }}>
        <button
          onClick={() => setIsEditing(true)}
          className="w-full h-14 flex items-center justify-center gap-3 rounded-[1.75rem] font-medium text-lg shadow-lg transition-all active:scale-[0.98]"
          style={{ backgroundColor: '#B8E0D2', color: '#3D5A4C' }}
        >
          <span className="text-2xl">🐧</span>
          <span>Tell Pipo something</span>
        </button>
      </div>
    </div>
  );
}
