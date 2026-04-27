// =============================================================================
// src/lib/utils.ts
// MyDay — All utility / helper functions
// =============================================================================

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DAYS_SHORT, MONTHS, QUOTES, MOODS } from './constants';
import type { Priority, MoodValue, MoodOption } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// TAILWIND CLASS MERGING
// ─────────────────────────────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ─────────────────────────────────────────────────────────────────────────────
// ID & TIME
// ─────────────────────────────────────────────────────────────────────────────

/** Generate a short random alphanumeric ID */
export function genId(): string {
  return Math.random().toString(36).slice(2, 11);
}

/** Current ISO datetime string */
export function nowISO(): string {
  return new Date().toISOString();
}

/** Today as "YYYY-MM-DD" */
export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Current month as "YYYY-MM" */
export function currentMonthStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Build "YYYY-MM-DD" from year, month (1-based), day */
export function buildDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// DATE FORMATTING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * "Senin, 2 Juni 2025"
 * Pass a "YYYY-MM-DD" string; defaults to today.
 */
export function formatDateLong(dateStr?: string): string {
  const d = dateStr ? new Date(dateStr + 'T12:00:00') : new Date();
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric',
  });
}

/**
 * "Sen, 2 Jun"
 */
export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const day   = DAYS_SHORT[d.getDay()];
  const date  = d.getDate();
  const month = MONTHS[d.getMonth()].slice(0, 3);
  return `${day}, ${date} ${month}`;
}

/**
 * "2 Jun"
 */
export function formatDateMini(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
}

/**
 * "Juni 2025"
 */
export function formatMonthYear(year: number, month: number): string {
  return `${MONTHS[month]} ${year}`;
}

/**
 * "14:30"  →  "14.30 WIB"   (or just "14:30" if no suffix needed)
 */
export function formatTime(time: string, suffix = ''): string {
  if (!time) return '';
  const [h, m] = time.split(':');
  return `${h}.${m}${suffix ? ' ' + suffix : ''}`;
}

/**
 * Relative label: "Hari ini", "Kemarin", "Besok", or the short date.
 */
export function relativeDateLabel(dateStr: string): string {
  const td  = todayStr();
  if (dateStr === td) return 'Hari ini';

  const d     = new Date(dateStr + 'T12:00:00');
  const today = new Date(td + 'T12:00:00');
  const diff  = Math.round((d.getTime() - today.getTime()) / 86_400_000);

  if (diff === -1) return 'Kemarin';
  if (diff ===  1) return 'Besok';
  return formatDateShort(dateStr);
}

// ─────────────────────────────────────────────────────────────────────────────
// CURRENCY
// ─────────────────────────────────────────────────────────────────────────────

const IDR_FORMATTER = new Intl.NumberFormat('id-ID', {
  style:                 'currency',
  currency:              'IDR',
  minimumFractionDigits: 0,
});

/** "Rp 1.500.000" */
export function formatIDR(amount: number): string {
  return IDR_FORMATTER.format(amount ?? 0);
}

/**
 * Compact IDR:
 *   1_500_000 → "1,5jt"
 *   150_000   → "150rb"
 *   5_000     → "5rb"
 */
export function formatIDRCompact(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(1)}M`;
  if (abs >= 1_000_000)     return `${sign}${(abs / 1_000_000).toFixed(1)}jt`;
  if (abs >= 1_000)         return `${sign}${(abs / 1_000).toFixed(0)}rb`;
  return formatIDR(amount);
}

/** Strip "Rp " prefix and dots for display in compact contexts */
export function stripIDRPrefix(formatted: string): string {
  return formatted.replace(/^Rp\s?/, '').replace(/\./g, '');
}

// ─────────────────────────────────────────────────────────────────────────────
// GREETING
// ─────────────────────────────────────────────────────────────────────────────

export function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 5)  return 'Selamat dini hari';
  if (h < 11) return 'Selamat pagi';
  if (h < 15) return 'Selamat siang';
  if (h < 18) return 'Selamat sore';
  return 'Selamat malam';
}

export function getGreetingEmoji(): string {
  const h = new Date().getHours();
  if (h < 5)  return '🌙';
  if (h < 11) return '☀️';
  if (h < 15) return '🌤️';
  if (h < 18) return '🌇';
  return '🌙';
}

// ─────────────────────────────────────────────────────────────────────────────
// HABITS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate consecutive-day streak ending today (or yesterday if today not logged).
 * Walks backwards day-by-day until a gap is found.
 */
export function calcStreak(log: Record<string, boolean>): number {
  if (!log) return 0;
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 365; i++) {
    const key = d.toISOString().slice(0, 10);
    if (!log[key]) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

/** Alias — streak hari berturut-turut dari log kebiasaan */
export function getHabitStreak(log: Record<string, boolean>): number {
  return calcStreak(log);
}

/** Returns last N days as date strings (oldest → newest) */
export function getLastNDays(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1) + i);
    return d.toISOString().slice(0, 10);
  });
}

/**
 * Habit completion rate over last 30 days — 0-100
 */
export function calcCompletionRate(log: Record<string, boolean>): number {
  const days = getLastNDays(30);
  const done = days.filter((d) => log?.[d]).length;
  return Math.round((done / 30) * 100);
}

// ─────────────────────────────────────────────────────────────────────────────
// PRIORITY HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export function getPriorityTextColor(priority: Priority): string {
  switch (priority) {
    case 'high': return 'text-red-500';
    case 'med':  return 'text-amber-500';
    case 'low':  return 'text-emerald-500';
  }
}

export function getPriorityDotClass(priority: Priority): string {
  switch (priority) {
    case 'high': return 'bg-red-400';
    case 'med':  return 'bg-amber-400';
    case 'low':  return 'bg-emerald-400';
  }
}

export function getPriorityHex(priority: Priority): string {
  switch (priority) {
    case 'high': return '#f87171';
    case 'med':  return '#fbbf24';
    case 'low':  return '#34d399';
  }
}

export function getPriorityLabel(priority: Priority): string {
  switch (priority) {
    case 'high': return 'Tinggi';
    case 'med':  return 'Sedang';
    case 'low':  return 'Rendah';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MOOD HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export function getMoodOption(value: MoodValue): MoodOption | undefined {
  return MOODS.find((m) => m.v === value);
}

export function getMoodEmoji(value: MoodValue): string {
  return getMoodOption(value)?.e ?? '—';
}

export function getMoodLabel(value: MoodValue): string {
  return getMoodOption(value)?.l ?? '';
}

export function getMoodColor(value: MoodValue): string {
  return getMoodOption(value)?.color ?? '#94a3b8';
}

// ─────────────────────────────────────────────────────────────────────────────
// CALENDAR HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function firstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

/**
 * Build a 42-cell (6-week) grid for a calendar month view.
 * Each cell: { day, currentMonth }
 */
export function buildCalendarGrid(
  year: number,
  month: number
): { day: number; currentMonth: boolean }[] {
  const cells: { day: number; currentMonth: boolean }[] = [];
  const fd   = firstDayOfMonth(year, month);
  const dim  = daysInMonth(year, month);
  const prevDim = daysInMonth(
    month === 0 ? year - 1 : year,
    month === 0 ? 11 : month - 1
  );

  // Trailing days from previous month
  for (let i = fd - 1; i >= 0; i--) {
    cells.push({ day: prevDim - i, currentMonth: false });
  }
  // Current month days
  for (let d = 1; d <= dim; d++) {
    cells.push({ day: d, currentMonth: true });
  }
  // Leading days of next month
  const rem = 42 - cells.length;
  for (let d = 1; d <= rem; d++) {
    cells.push({ day: d, currentMonth: false });
  }

  return cells;
}

// ─────────────────────────────────────────────────────────────────────────────
// MATH & NUMBER HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function pct(part: number, total: number): number {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** SVG circle stroke-dashoffset for a progress ring */
export function ringDashOffset(radius: number, progress: number): number {
  const circumference = 2 * Math.PI * radius;
  return circumference * (1 - clamp(progress, 0, 100) / 100);
}

export function ringCircumference(radius: number): number {
  return 2 * Math.PI * radius;
}

// ─────────────────────────────────────────────────────────────────────────────
// QUOTE OF THE DAY
// ─────────────────────────────────────────────────────────────────────────────

/** Deterministically picks a quote based on today's date (stable per day) */
export function getDailyQuote(): { text: string; author: string } {
  const dayOfYear = (() => {
    const now  = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    return Math.floor((now.getTime() - start.getTime()) / 86_400_000);
  })();
  return QUOTES[dayOfYear % QUOTES.length];
}

// ─────────────────────────────────────────────────────────────────────────────
// STRING HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + '…';
}

export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function initials(name: string, maxChars = 2): string {
  return name
    .split(' ')
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, maxChars);
}

// ─────────────────────────────────────────────────────────────────────────────
// ARRAY HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const k = String(item[key]);
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});
}

export function sortByDate<T extends { date: string }>(
  arr: T[],
  direction: 'asc' | 'desc' = 'desc'
): T[] {
  return [...arr].sort((a, b) => {
    const diff = a.date.localeCompare(b.date);
    return direction === 'desc' ? -diff : diff;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF / EXPORT HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Sanitise a string for use as a file name */
export function safeFilename(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_\-]/g, '')
    .slice(0, 64);
}

/** Build a default PDF export filename: "myday_keuangan_2025-06.pdf" */
export function buildExportFilename(prefix: string, ext = 'pdf'): string {
  const month = currentMonthStr();
  return `${safeFilename(prefix)}_${month}.${ext}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// GEMINI AI HELPER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calls Gemini 1.5 Flash and returns the text response.
 * `messages` follows the { role, content } shape used in ChatMessage.
 */
export async function callGemini(
  messages: { role: 'user' | 'assistant'; content: string }[],
  systemPrompt: string,
  apiKey: string
): Promise<string> {
  const contents = messages.map((m) => ({
    role:  m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  if (systemPrompt && contents.length > 0) {
    contents[0].parts[0].text = `${systemPrompt}\n\n${contents[0].parts[0].text}`;
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
    {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 1500 },
      }),
    }
  );

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as {
      error?: { message?: string };
    };
    throw new Error(err.error?.message ?? `HTTP ${res.status}`);
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  if (!text) throw new Error('Empty response from Gemini');
  return text;
}