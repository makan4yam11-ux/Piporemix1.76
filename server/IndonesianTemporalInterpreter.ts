import { format, addDays, setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';

// Timezone untuk Indonesia
const JAKARTA_TZ = 'Asia/Jakarta';

// Konfigurasi waktu untuk bagian hari
const TIME_OF_DAY_CONFIG: Record<string, [number, number]> = {
  'pagi': [5, 10],      // 05:00 - 10:59
  'siang': [11, 14],    // 11:00 - 14:59
  'sore': [15, 17],     // 15:00 - 17:59
  'malam': [18, 23],    // 18:00 - 23:59
  'dini hari': [0, 4],  // 00:00 - 04:59
};

// Default waktu untuk setiap bagian hari (jika tidak spesifik)
const TIME_OF_DAY_DEFAULTS: Record<string, number> = {
  'pagi': 8,        // 08:00
  'siang': 12,      // 12:00 (noon)
  'sore': 16,       // 16:00 (4 PM)
  'malam': 19,      // 19:00 (7 PM)
  'dini hari': 2,   // 02:00
};

// Data structures
export interface ParsedTemporalExpression {
  activityText: string;
  dateDescriptor?: string;  // "hari ini", "besok", "lusa"
  timeDescriptor?: string;  // "pagi", "siang", "sore", "malam"
  explicitTime?: string;    // "6", "8:30"
  meridiem?: string;        // "pagi", "sore", "malam" when used with time
  relativeOffsetDays?: number;
  rawInput: string;
}

export interface ResolutionResult {
  status: 'resolved' | 'needs_clarification';
  activityText: string;
  isoDate?: string;         // yyyy-mm-dd
  isoTime?: string;         // HH:mm
  formattedReminder?: string; // "[Activity] — [yyyy-mm-dd] — [HH:mm]"
  clarificationPrompt?: string;
}

/**
 * Tokenize dan normalize input bahasa Indonesia
 */
function tokenizeIndonesianTimeExpression(message: string): string[] {
  const normalized = message
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[.,!?]+$/, '') // hapus tanda baca di akhir
    .replace(/pukul/g, 'jam'); // normalize "pukul" ke "jam"
  
  return normalized.split(/\s+/);
}

/**
 * Extract temporal intent dari pesan
 */
export function extractTemporalIntent(message: string): ParsedTemporalExpression {
  const tokens = tokenizeIndonesianTimeExpression(message);
  const normalized = tokens.join(' ');
  
  console.log('🕐 Extracting temporal intent from:', message);
  console.log('🕐 Tokens:', tokens);
  
  const intent: ParsedTemporalExpression = {
    activityText: '',
    rawInput: message,
  };
  
  // Cari relative date descriptor
  if (normalized.includes('hari ini') || normalized.includes('today')) {
    intent.dateDescriptor = 'hari ini';
    intent.relativeOffsetDays = 0;
  } else if (normalized.includes('besok') || normalized.includes('tomorrow')) {
    intent.dateDescriptor = 'besok';
    intent.relativeOffsetDays = 1;
  } else if (normalized.includes('lusa')) {
    intent.dateDescriptor = 'lusa';
    intent.relativeOffsetDays = 2;
  }
  
  // Cari time of day descriptor
  for (const timeOfDay of ['pagi', 'siang', 'sore', 'malam', 'dini hari']) {
    if (normalized.includes(timeOfDay)) {
      intent.timeDescriptor = timeOfDay;
      break;
    }
  }
  
  // Cari explicit time dengan berbagai pattern
  // Pattern 1: "jam 6", "jam 18"
  const jamPattern = /jam\s+(\d{1,2})(?::(\d{2}))?/;
  const jamMatch = normalized.match(jamPattern);
  if (jamMatch) {
    intent.explicitTime = jamMatch[2] ? `${jamMatch[1]}:${jamMatch[2]}` : jamMatch[1];
  }
  
  // Pattern 2: standalone time seperti "3:30", "15:00"
  if (!intent.explicitTime) {
    const timePattern = /\b(\d{1,2}):(\d{2})\b/;
    const timeMatch = normalized.match(timePattern);
    if (timeMatch) {
      intent.explicitTime = `${timeMatch[1]}:${timeMatch[2]}`;
    }
  }
  
  // Extract activity text (remove temporal words)
  const temporalWords = [
    'jam', 'pukul', 'hari ini', 'besok', 'lusa', 'today', 'tomorrow',
    'pagi', 'siang', 'sore', 'malam', 'dini hari',
    'tolong', 'ingatkan', 'ingatkan saya', 'remind me', 'reminder',
    'ya', 'dong', 'please'
  ];
  
  let activityText = message;
  // Remove temporal patterns
  activityText = activityText.replace(/jam\s+\d{1,2}(?::\d{2})?/gi, '');
  activityText = activityText.replace(/pukul\s+\d{1,2}(?::\d{2})?/gi, '');
  activityText = activityText.replace(/\b\d{1,2}:\d{2}\b/g, '');
  
  for (const word of temporalWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    activityText = activityText.replace(regex, '');
  }
  
  // Clean up extra spaces and punctuation
  activityText = activityText
    .replace(/\s+/g, ' ')
    .replace(/^[,.\s]+|[,.\s]+$/g, '')
    .trim();
  
  intent.activityText = activityText || 'Pengingat';
  
  console.log('🕐 Extracted intent:', intent);
  return intent;
}

/**
 * Resolve date dari descriptor
 */
function resolveDate(intent: ParsedTemporalExpression, referenceDate: Date = new Date()): Date {
  let targetDate = new Date(referenceDate);
  
  if (intent.relativeOffsetDays !== undefined) {
    targetDate = addDays(targetDate, intent.relativeOffsetDays);
  }
  
  return targetDate;
}

/**
 * Resolve time dari intent
 */
function resolveTime(
  intent: ParsedTemporalExpression,
  targetDate: Date
): { hour: number; minute: number; isAmbiguous: boolean } {
  let hour = 0;
  let minute = 0;
  let isAmbiguous = false;
  
  // Case 1: Ada explicit time
  if (intent.explicitTime) {
    const timeParts = intent.explicitTime.includes(':')
      ? intent.explicitTime.split(':')
      : [intent.explicitTime, '0'];
    
    let parsedHour = parseInt(timeParts[0], 10);
    minute = parseInt(timeParts[1] || '0', 10);
    
    // Jika jam >= 12, use as-is (already 24-hour format or noon/midnight)
    if (parsedHour >= 12) {
      hour = parsedHour;
    }
    // Jika jam < 12 dan ada descriptor waktu, tentukan AM/PM
    else if (intent.timeDescriptor) {
      if (intent.timeDescriptor === 'malam' || intent.timeDescriptor === 'sore') {
        // "jam 6 malam" → 18:00, "jam 6 sore" → 18:00
        parsedHour = parsedHour + 12;
      } else if (intent.timeDescriptor === 'pagi' || intent.timeDescriptor === 'siang') {
        // "jam 8 pagi" → 08:00, "jam 12 siang" → 12:00
        // Keep as is
      } else if (intent.timeDescriptor === 'dini hari') {
        // "jam 2 dini hari" → 02:00
        // Keep as is
      }
      hour = parsedHour;
    }
    // Jika jam 1-11 tanpa descriptor → AMBIGUOUS
    else if (parsedHour >= 1 && parsedHour <= 11) {
      // Ambiguous: "jam 6" tanpa pagi/sore/malam
      isAmbiguous = true;
      hour = parsedHour; // Keep the value for now, will trigger clarification
    }
    // Jam 0 (midnight)
    else {
      hour = parsedHour;
    }
  } 
  // Case 2: Hanya time descriptor (pagi/siang/sore/malam) tanpa explicit time
  else if (intent.timeDescriptor) {
    // "besok pagi" → use default for pagi (08:00)
    // "lusa sore" → use default for sore (16:00)
    // Ini TIDAK ambigu karena kita punya default yang jelas
    hour = TIME_OF_DAY_DEFAULTS[intent.timeDescriptor] || 9;
    minute = 0;
    isAmbiguous = false; // NOT ambiguous - we have clear defaults
  } 
  // Case 3: Tidak ada info waktu sama sekali
  else {
    // Default to 9 AM
    hour = 9;
    minute = 0;
    isAmbiguous = true; // This is ambiguous - no time info at all
  }
  
  return { hour, minute, isAmbiguous };
}

/**
 * Main function: Parse Indonesian time expression dan resolve ke format yang diminta
 */
export function parseIndonesianTime(
  message: string,
  referenceDate: Date = new Date()
): ResolutionResult {
  console.log('🕐 Parsing Indonesian time expression:', message);
  
  // Extract intent
  const intent = extractTemporalIntent(message);
  
  // Jika tidak ada indikasi waktu sama sekali, return needs clarification
  if (!intent.dateDescriptor && !intent.timeDescriptor && !intent.explicitTime) {
    return {
      status: 'needs_clarification',
      activityText: intent.activityText,
      clarificationPrompt: `Baik, saya catat "${intent.activityText}". Kapan kamu mau diingatkan? Bisa kasih tau tanggal dan jamnya? Contoh: "besok jam 6 sore" atau "hari ini jam 3 siang".`,
    };
  }
  
  // Resolve date
  const targetDate = resolveDate(intent, referenceDate);
  
  // Resolve time
  const { hour, minute, isAmbiguous } = resolveTime(intent, targetDate);
  
  // Jika ambigu (explicit time 1-11 tanpa descriptor, atau tidak ada waktu sama sekali)
  if (isAmbiguous) {
    // Case 1: "jam 6" tanpa pagi/malam/sore
    if (intent.explicitTime && !intent.timeDescriptor) {
      return {
        status: 'needs_clarification',
        activityText: intent.activityText,
        clarificationPrompt: `Oke, "${intent.activityText}" ${intent.dateDescriptor || 'nanti'} jam ${intent.explicitTime}. Tapi jam ${intent.explicitTime} pagi atau malam? Bisa tambahkan "pagi", "siang", "sore", atau "malam"?`,
      };
    }
    // Case 2: Tidak ada waktu sama sekali
    else {
      return {
        status: 'needs_clarification',
        activityText: intent.activityText,
        clarificationPrompt: `Baik, saya catat "${intent.activityText}". Kapan kamu mau diingatkan? Bisa kasih tau tanggal dan jamnya? Contoh: "besok jam 6 sore" atau "hari ini jam 3 siang".`,
      };
    }
  }
  
  // Set final time
  let finalDate = targetDate;
  finalDate = setHours(finalDate, hour);
  finalDate = setMinutes(finalDate, minute);
  finalDate = setSeconds(finalDate, 0);
  finalDate = setMilliseconds(finalDate, 0);
  
  // Format ke ISO untuk penyimpanan
  const isoDate = format(finalDate, 'yyyy-MM-dd');
  const isoTime = format(finalDate, 'HH:mm');
  
  // Format reminder: "[Activity] — [yyyy-mm-dd] — [HH:mm]"
  const formattedReminder = `${intent.activityText} — ${isoDate} — ${isoTime}`;
  
  console.log('🕐 Resolved:', {
    isoDate,
    isoTime,
    formattedReminder,
  });
  
  return {
    status: 'resolved',
    activityText: intent.activityText,
    isoDate,
    isoTime,
    formattedReminder,
  };
}

/**
 * Helper: Create Date object dari ISO date + time dalam Asia/Jakarta timezone
 * 
 * Input adalah waktu lokal Jakarta (e.g., "2025-10-20" "18:00")
 * Output adalah Date object (UTC) yang merepresentasikan waktu tersebut
 * 
 * Contoh: createJakartaDate("2025-10-20", "18:00")
 * → Returns Date object representing 2025-10-20 18:00 Jakarta Time (11:00 UTC)
 */
export function createJakartaDate(isoDate: string, isoTime: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  const [hour, minute] = isoTime.split(':').map(Number);
  
  // Buat date string dalam format yang bisa di-parse
  const dateTimeString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
  
  // fromZonedTime: interpret input sebagai waktu Jakarta, convert ke UTC
  // Input: "2025-10-20T18:00:00" + "Asia/Jakarta" timezone
  // Output: Date object in UTC representing that Jakarta time
  const utcDate = fromZonedTime(dateTimeString, JAKARTA_TZ);
  
  return utcDate;
}

/**
 * Helper: Format date ke format display yang user-friendly
 */
export function formatReminderDisplay(isoDate: string, isoTime: string): string {
  const date = createJakartaDate(isoDate, isoTime);
  return format(date, "d MMM yyyy 'at' HH:mm");
}
