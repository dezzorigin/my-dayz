// =============================================================================
// src/lib/constants.ts
// MyDay — All static data constants
// =============================================================================

import type { MoodOption, NavGroup, Priority, GoalType, AkademikType } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// LOCALE
// ─────────────────────────────────────────────────────────────────────────────

export const DAYS_SHORT  = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'] as const;
export const DAYS_FULL   = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'] as const;
export const MONTHS      = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember',
] as const;

export type DayShort  = typeof DAYS_SHORT[number];
export type MonthName = typeof MONTHS[number];

// ─────────────────────────────────────────────────────────────────────────────
// FINANCE CATEGORIES
// ─────────────────────────────────────────────────────────────────────────────

export const EXPENSE_CATEGORIES = [
  'Makan',
  'Transport',
  'Hiburan',
  'Belanja',
  'Tagihan',
  'Kos/Rumah',
  'Kesehatan',
  'Edukasi',
  'Lainnya',
] as const;

export const INCOME_CATEGORIES = [
  'Gaji',
  'Freelance',
  'Uang Saku',
  'Bonus',
  'Lainnya',
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
export type IncomeCategory  = typeof INCOME_CATEGORIES[number];

/** Category icon map for Finance UI */
export const CATEGORY_ICONS: Record<string, string> = {
  Makan:      '🍜',
  Transport:  '🚗',
  Hiburan:    '🎮',
  Belanja:    '🛍️',
  Tagihan:    '📄',
  'Kos/Rumah':'🏠',
  Kesehatan:  '💊',
  Edukasi:    '📚',
  Lainnya:    '📦',
  Gaji:       '💼',
  Freelance:  '💻',
  'Uang Saku':'👛',
  Bonus:      '🎁',
};

/** Category color map (for chart bars / badges) */
export const CATEGORY_COLORS: Record<string, string> = {
  Makan:      '#f59e0b',
  Transport:  '#3b82f6',
  Hiburan:    '#a855f7',
  Belanja:    '#ec4899',
  Tagihan:    '#64748b',
  'Kos/Rumah':'#14b8a6',
  Kesehatan:  '#22c55e',
  Edukasi:    '#06b6d4',
  Lainnya:    '#94a3b8',
  Gaji:       '#10b981',
  Freelance:  '#6366f1',
  'Uang Saku':'#f97316',
  Bonus:      '#eab308',
};

// ─────────────────────────────────────────────────────────────────────────────
// MOOD
// ─────────────────────────────────────────────────────────────────────────────

export const MOODS: MoodOption[] = [
  { v: 5, e: '🤩', l: 'Luar Biasa',   color: '#d97706', bg: 'rgba(217,119,6,0.10)' },
  { v: 4, e: '😊', l: 'Baik',         color: '#059669', bg: 'rgba(5,150,105,0.10)' },
  { v: 3, e: '😐', l: 'Biasa',        color: '#64748b', bg: 'rgba(100,116,139,0.10)' },
  { v: 2, e: '😔', l: 'Buruk',        color: '#ea580c', bg: 'rgba(234,88,12,0.10)' },
  { v: 1, e: '😫', l: 'Sangat Buruk', color: '#dc2626', bg: 'rgba(220,38,38,0.10)' },
];

// ─────────────────────────────────────────────────────────────────────────────
// HABITS
// ─────────────────────────────────────────────────────────────────────────────

export const HABIT_ICONS = [
  '⭐','💪','📚','🏃','🧘','💧','🍎','😴','✍️','🎯',
  '🎸','🌿','🧠','🏋️','🚴','🎨','🎵','🧩','🌅','🫁',
  '🦷','🧹','📖','🚶','🧃','🥗','🏊','🎤','🌍','💬',
] as const;

export const HABIT_ACCENT_COLORS = [
  '#2563eb', // blue
  '#059669', // emerald
  '#d97706', // amber
  '#7c3aed', // violet
  '#db2777', // pink
  '#0891b2', // cyan
  '#65a30d', // lime
  '#dc2626', // red
  '#0d9488', // teal
  '#9333ea', // purple
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// TASK PRIORITY
// ─────────────────────────────────────────────────────────────────────────────

export const PRIORITIES: {
  value: Priority;
  label: string;
  color: string;
  bg: string;
  dot: string;
}[] = [
  { value: 'high', label: '🔴 Tinggi', color: '#dc2626', bg: 'rgba(220,38,38,0.08)',  dot: '#f87171' },
  { value: 'med',  label: '🟡 Sedang', color: '#d97706', bg: 'rgba(217,119,6,0.08)',  dot: '#fbbf24' },
  { value: 'low',  label: '🟢 Rendah', color: '#059669', bg: 'rgba(5,150,105,0.08)', dot: '#34d399' },
];

export const PRIORITY_COLOR: Record<Priority, string> = {
  high: '#dc2626',
  med:  '#d97706',
  low:  '#059669',
};

export const PRIORITY_DOT: Record<Priority, string> = {
  high: '#f87171',
  med:  '#fbbf24',
  low:  '#34d399',
};

export const PRIORITY_BG: Record<Priority, string> = {
  high: 'rgba(220,38,38,0.08)',
  med:  'rgba(217,119,6,0.08)',
  low:  'rgba(5,150,105,0.08)',
};

// ─────────────────────────────────────────────────────────────────────────────
// GOALS
// ─────────────────────────────────────────────────────────────────────────────

export const GOAL_TYPES: { value: GoalType; label: string; color: string }[] = [
  { value: 'mingguan',  label: 'Mingguan',  color: '#3b82f6' },
  { value: 'bulanan',   label: 'Bulanan',   color: '#d97706' },
  { value: 'semestral', label: 'Semestral', color: '#7c3aed' },
];

// ─────────────────────────────────────────────────────────────────────────────
// AKADEMIK
// ─────────────────────────────────────────────────────────────────────────────

export const AKADEMIK_TYPES: AkademikType[] = [
  'Kuliah','Praktikum','UTS','UAS','Tugas','Seminar',
];

export const AKADEMIK_COLORS: Record<AkademikType, string> = {
  Kuliah:     '#2563eb',
  Praktikum:  '#059669',
  UTS:        '#dc2626',
  UAS:        '#7c3aed',
  Tugas:      '#d97706',
  Seminar:    '#0891b2',
};

// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATION
// ─────────────────────────────────────────────────────────────────────────────

export const NAV_ITEMS: NavGroup[] = [
  {
    group: 'Menu Utama',
    items: [
      { id: 'dashboard',      href: '/dashboard',      label: 'Dashboard',    emoji: '🏠' },
      { id: 'planner',        href: '/planner',        label: 'Planner',      emoji: '📋' },
      { id: 'calendar',       href: '/calendar',       label: 'Kalender',     emoji: '📅' },
      { id: 'finance',        href: '/finance',        label: 'Keuangan',     emoji: '💰' },
    ],
  },
  {
    group: 'Wellness & Growth',
    items: [
      { id: 'habits',         href: '/habits',         label: 'Habits',       emoji: '✅' },
      { id: 'diary',          href: '/diary',          label: 'Daily Diary',  emoji: '📝' },
      { id: 'neural-roadmap', href: '/neural-roadmap', label: 'Neural Map',   emoji: '🧠' },
      { id: 'ai',             href: '/ai',             label: 'AI Assistant', emoji: '🤖' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MOTIVATIONAL QUOTES (rotated daily)
// ─────────────────────────────────────────────────────────────────────────────

export const QUOTES: { text: string; author: string }[] = [
  { text: 'Konsistensi kecil setiap hari mengalahkan ledakan besar sesekali.', author: 'James Clear' },
  { text: 'Disiplin adalah jembatan antara tujuan dan pencapaian.', author: 'Jim Rohn' },
  { text: 'Kamu tidak harus sempurna untuk memulai, tapi kamu harus memulai untuk menjadi sempurna.', author: 'Zig Ziglar' },
  { text: 'Fokus pada prosesnya. Hasil adalah efek samping dari proses yang benar.', author: 'Unknown' },
  { text: 'Setiap hari adalah halaman baru dalam cerita hidupmu. Tulislah dengan baik.', author: 'Unknown' },
  { text: 'Kebiasaan kecil yang dilakukan secara konsisten menghasilkan perubahan luar biasa.', author: 'Atomic Habits' },
  { text: 'Jangan hitung hari-harinya, buat setiap harinya berhitung.', author: 'Muhammad Ali' },
];

// ─────────────────────────────────────────────────────────────────────────────
// APP META
// ─────────────────────────────────────────────────────────────────────────────

export const APP_NAME    = 'MyDay' as const;
export const APP_VERSION = '3.0.0' as const;
export const APP_TAGLINE = 'Personal OS' as const;

export const LS_KEYS = {
  TASKS:    'myday_tasks_v3',
  FINANCE:  'myday_finance_v3',
  HABITS:   'myday_habits_v3',
  MOODS:    'myday_moods_v2',
  DIARY:    'myday_diary_v2',
  CALENDAR: 'myday_calendar_v2',
  AI_KEY:   'myday_gemini_key',
  THEME:    'myday_theme_storage',
} as const;