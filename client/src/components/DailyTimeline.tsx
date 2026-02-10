import { useState } from "react";
import { format, addDays, subDays, startOfDay, isSameDay, setHours, setMinutes } from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useTranslation, useLanguage } from "@/contexts/LanguageContext";
import { getDateLocale } from "@/lib/dateLocale";
import { useFixedTime } from "@/contexts/FixedTimeContext";
import { 
  formatFixedTime, 
  formatFixedDateTime,
  formatFixedDateTimeForAPI,
  getEventPositionFixed, 
  getEventPositionLocal,
  createFixedDateTime,
  formatFixedDate
} from "@/lib/fixedTimeUtils";

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  category: string;
  color: string;
  icon?: string;
}

export function DailyTimeline() {
  const t = useTranslation();
  const { language } = useLanguage();
  const dateLocale = getDateLocale(language);
  const { isFixedTimeMode } = useFixedTime();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    category: "event",
  });

  const EVENT_CATEGORIES = [
    { value: "class", label: t.calendar.categoryClass, color: "#93C5FD", icon: "📚" },
    { value: "meeting", label: t.calendar.categoryMeeting, color: "#FCA5A5", icon: "👥" },
    { value: "event", label: t.calendar.categoryEvent, color: "#A78BFA", icon: "📅" },
    { value: "personal", label: t.calendar.categoryPersonal, color: "#FCD34D", icon: "⭐" },
  ];

  const { data: events = [] } = useQuery<CalendarEvent[]>({
    queryKey: ["/api/calendar/events"],
  });

  const createEventMutation = useMutation({
    mutationFn: async (eventData: { title: string; description: string; startTime: string; endTime: string; category: string }) => {
      const dataToSend = isFixedTimeMode ? {
        ...eventData,
        startTime: formatFixedDateTimeForAPI(eventData.startTime),
        endTime: formatFixedDateTimeForAPI(eventData.endTime),
      } : eventData;
      const response = await apiRequest("POST", "/api/calendar/events", dataToSend);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar/events"] });
      setIsAddDialogOpen(false);
      setEventForm({
        title: "",
        description: "",
        startTime: "",
        endTime: "",
        category: "event",
      });
    },
  });

  const dayEvents = events.filter(event => {
    if (isFixedTimeMode) {
      const eventDate = new Date(event.startTime);
      const eventDateStr = `${eventDate.getUTCFullYear()}-${String(eventDate.getUTCMonth() + 1).padStart(2, '0')}-${String(eventDate.getUTCDate()).padStart(2, '0')}`;
      const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
      return eventDateStr === selectedDateStr;
    } else {
      return isSameDay(new Date(event.startTime), selectedDate);
    }
  }).sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  const currentHour = isFixedTimeMode ? new Date().getUTCHours() : new Date().getHours();
  const currentMinute = isFixedTimeMode ? new Date().getUTCMinutes() : new Date().getMinutes();
  const isToday = isSameDay(selectedDate, new Date());

  const getEventPosition = (event: CalendarEvent) => {
    return isFixedTimeMode 
      ? getEventPositionFixed(event.startTime, event.endTime)
      : getEventPositionLocal(event.startTime, event.endTime);
  };

  const getCategoryColor = (category: string) => {
    return EVENT_CATEGORIES.find(c => c.value === category)?.color || "#6366f1";
  };

  const getCategoryIcon = (category: string) => {
    return EVENT_CATEGORIES.find(c => c.value === category)?.icon || "📅";
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-card">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">
            {format(selectedDate, "d MMMM", { locale: dateLocale })}
          </h2>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedDate(subDays(selectedDate, 1))}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDate(new Date())}
            >
              {t.calendar.today}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        <div className="flex gap-2 text-sm">
          <button className="px-3 py-1.5 rounded-full bg-gray-900 text-white font-medium">
            {t.calendar.hour}
          </button>
          <button className="px-3 py-1.5 rounded-full text-gray-600">
            {t.calendar.lessonsEvents}
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto relative bg-background">
        <div className="relative" style={{ height: `${hours.length * 80}px` }}>
          {/* Hour Labels */}
          {hours.map(hour => (
            <div key={hour} className="absolute left-0 right-0 flex" style={{ top: `${hour * 80}px`, height: '80px' }}>
              <div className="w-16 pr-2 pt-1 text-sm text-muted-foreground">
                {String(hour).padStart(2, '0')}:00
              </div>
              <div className="flex-1 border-t border-border"></div>
            </div>
          ))}

          {/* Current Time Indicator */}
          {isToday && (
            <div 
              className="absolute left-0 right-0 flex items-center z-20"
              style={{ top: `${(currentHour + currentMinute / 60) * 80}px` }}
            >
              <div className="w-16 pr-2">
                <div className="bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full inline-block">
                  {isFixedTimeMode 
                    ? `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`
                    : format(new Date(), "HH:mm", { locale: dateLocale })}
                </div>
              </div>
              <div className="flex-1 h-0.5 bg-pink-500"></div>
            </div>
          )}

          {/* Events */}
          <div className="absolute left-16 right-4 top-0 bottom-0">
            {dayEvents.map(event => {
              const position = getEventPosition(event);
              const categoryColor = getCategoryColor(event.category);
              const categoryIcon = getCategoryIcon(event.category);
              
              return (
                <div
                  key={event.id}
                  className="absolute left-0 right-0 px-3 py-2 rounded-lg shadow-sm"
                  style={{
                    top: `${position.top}px`,
                    height: `${Math.max(position.height, 60)}px`,
                    backgroundColor: categoryColor,
                  }}
                >
                  <div className="flex gap-2">
                    <div className="text-2xl">{categoryIcon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">
                        {event.title}
                      </div>
                      <div className="text-xs text-gray-700">
                        {isFixedTimeMode 
                          ? `${formatFixedTime(event.startTime)} - ${formatFixedTime(event.endTime)}`
                          : `${format(new Date(event.startTime), "HH:mm", { locale: dateLocale })} - ${format(new Date(event.endTime), "HH:mm", { locale: dateLocale })}`
                        }
                      </div>
                      {event.description && (
                        <div className="text-sm text-gray-700 mt-1 line-clamp-2">
                          {event.description}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Appointment Button */}
      <div className="p-4 bg-card border-t">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-full py-6"
              onClick={() => {
                if (isFixedTimeMode) {
                  const dateStr = formatFixedDate(selectedDate);
                  const startDateTime = createFixedDateTime(dateStr, "09:00");
                  const endDateTime = createFixedDateTime(dateStr, "10:00");
                  setEventForm({
                    title: "",
                    description: "",
                    startTime: formatFixedDateTime(startDateTime),
                    endTime: formatFixedDateTime(endDateTime),
                    category: "event",
                  });
                } else {
                  const defaultStart = new Date(selectedDate);
                  defaultStart.setHours(9, 0, 0, 0);
                  const defaultEnd = new Date(selectedDate);
                  defaultEnd.setHours(10, 0, 0, 0);
                  setEventForm({
                    title: "",
                    description: "",
                    startTime: format(defaultStart, "yyyy-MM-dd'T'HH:mm"),
                    endTime: format(defaultEnd, "yyyy-MM-dd'T'HH:mm"),
                    category: "event",
                  });
                }
              }}
            >
              {t.calendar.addAppointment}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.calendar.addEvent}</DialogTitle>
              <DialogDescription>
                {t.calendar.addEventForDate 
                  ? t.calendar.addEventForDate.replace('{title}', t.calendar.addEvent || '').replace('{date}', format(selectedDate, "MMMM d, yyyy", { locale: dateLocale }))
                  : `${t.calendar.addEvent} - ${format(selectedDate, "MMMM d, yyyy", { locale: dateLocale })}`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="event-title">{t.calendar.titleLabel}</Label>
                <Input 
                  id="event-title" 
                  placeholder={t.calendar.titleLabel}
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="event-description">{t.calendar.descriptionLabel}</Label>
                <Textarea 
                  id="event-description" 
                  placeholder={t.calendar.descriptionLabel}
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-time">{t.calendar.startTimeLabel}</Label>
                  <Input 
                    id="start-time" 
                    type="datetime-local"
                    value={eventForm.startTime}
                    onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="end-time">{t.calendar.endTimeLabel}</Label>
                  <Input 
                    id="end-time" 
                    type="datetime-local"
                    value={eventForm.endTime}
                    onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>{t.calendar.categoryLabel}</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {EVENT_CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => setEventForm({ ...eventForm, category: cat.value })}
                      className={`p-2 rounded border ${eventForm.category === cat.value ? 'border-gray-900 border-2' : 'border-gray-300'} hover:border-gray-400 text-left`}
                      style={{ backgroundColor: cat.color }}
                    >
                      <span className="mr-2">{cat.icon}</span>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              <Button 
                className="w-full"
                onClick={() => createEventMutation.mutate(eventForm)}
                disabled={!eventForm.title || createEventMutation.isPending}
              >
                {createEventMutation.isPending ? t.common.creating : t.calendar.addEvent}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
