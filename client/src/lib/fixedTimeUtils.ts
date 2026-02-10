import { format } from "date-fns";

export function parseFixedTime(timeString: string, dateString: string): Date {
  const [hours, minutes] = timeString.split(':').map(Number);
  const [year, month, day] = dateString.split('-').map(Number);
  
  return new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0));
}

export function formatFixedTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const hours = d.getUTCHours();
  const minutes = d.getUTCMinutes();
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function formatFixedDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getFixedHourFromDate(date: Date | string): number {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.getUTCHours();
}

export function getFixedMinuteFromDate(date: Date | string): number {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.getUTCMinutes();
}

export function createFixedDateTime(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);
  
  return new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0));
}

export function formatFixedDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const hours = String(d.getUTCHours()).padStart(2, '0');
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function formatFixedDateTimeForAPI(dateTimeString: string): string {
  if (!dateTimeString.includes('T')) {
    throw new Error('Invalid datetime format - expected YYYY-MM-DDTHH:mm');
  }
  
  const [datePart, timePart] = dateTimeString.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);
  
  const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute || 0, 0, 0));
  return utcDate.toISOString();
}

export function getEventPositionFixed(
  startTime: string | Date,
  endTime: string | Date
): { top: number; height: number; hour: number; minute: number } {
  const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
  const end = typeof endTime === 'string' ? new Date(endTime) : endTime;
  
  const startHour = start.getUTCHours();
  const startMinute = start.getUTCMinutes();
  const duration = (end.getTime() - start.getTime()) / (1000 * 60);
  
  return {
    top: (startHour + startMinute / 60) * 80,
    height: (duration / 60) * 80,
    hour: startHour,
    minute: startMinute,
  };
}

export function getEventPositionLocal(
  startTime: string | Date,
  endTime: string | Date
): { top: number; height: number; hour: number; minute: number } {
  const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
  const end = typeof endTime === 'string' ? new Date(endTime) : endTime;
  
  const startHour = start.getHours();
  const startMinute = start.getMinutes();
  const duration = (end.getTime() - start.getTime()) / (1000 * 60);
  
  return {
    top: (startHour + startMinute / 60) * 80,
    height: (duration / 60) * 80,
    hour: startHour,
    minute: startMinute,
  };
}
