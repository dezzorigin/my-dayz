// =============================================================================
// src/types/index.ts
// MyDay — Master Type Definitions
// Re-exported from stores for convenience; source of truth for all entities.
// =============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVE ALIASES
// ─────────────────────────────────────────────────────────────────────────────

/** "YYYY-MM-DD" */
export type DateString = string;

/** ISO 8601 datetime string */
export type ISOString = string;

/** "HH:mm" */
export type TimeString = string;

/** Short random ID, e.g. "k7x2mq9f1" */
export type ID = string;

// ─────────────────────────────────────────────────────────────────────────────
// TASK & PLANNER
// ─────────────────────────────────────────────────────────────────────────────

export type Priority = 'high' | 'med' | 'low';
export type GoalType = 'mingguan' | 'bulanan' | 'semestral';
export type PlannerTab = 'tasks' | 'goals';

export interface Task {
  id:        ID;
  title:     string;
  date:      DateString;
  priority:  Priority;
  tag:       string;
  time:      TimeString;
  notes:     string;
  done:      boolean;
  createdAt: ISOString;
}

export interface Goal {
  id:        ID;
  title:     string;
  type:      GoalType;
  deadline:  DateString;   // "" if not set
  progress:  number;       // 0–100
  createdAt: ISOString;
}

// ─────────────────────────────────────────────────────────────────────────────
// FINANCE
// ─────────────────────────────────────────────────────────────────────────────

export type TxnType     = 'income' | 'expense';
export type FinanceTab  = 'overview' | 'txn';

export interface Transaction {
  id:        ID;
  type:      TxnType;
  amount?:   number;
  desc?:     string;
  title?:    string;
  cat?:      string;
  category?: string;
  date?:     DateString;
  createdAt?: ISOString;
  note?:     string;
}

/** Aggregated totals — derived, never stored */
export interface FinanceSummary {
  balance:   number;
  totalIn:   number;
  totalOut:  number;
  monthIn:   number;
  monthOut:  number;
  monthNet:  number;
}

/** Per-category spend breakdown — derived, never stored */
export interface CategoryBreakdown {
  cat:    string;
  amount: number;
  pct:    number;   // 0–100 relative to the top category
}

/** One bar in the 7-day spend chart — derived, never stored */
export interface WeeklySpend {
  date:    DateString;
  label:   string;   // "Sen", "Sel", …
  out:     number;
  isToday: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// HABITS
// ─────────────────────────────────────────────────────────────────────────────

export type HabitFrequency = 'daily' | 'weekly';

export interface Habit {
  id:        ID;
  name:      string;
  icon:      string;                       // emoji
  freq:      HabitFrequency;
  target:    number;                       // reserved for future multi-count support
  color:     string;                       // hex accent, e.g. "#2563eb"
  log:       Record<DateString, boolean>;  // { "2025-06-01": true }
  createdAt: ISOString;
}

/** Habit enriched with computed stats — used in UI, never persisted */
export interface HabitWithStats extends Habit {
  doneToday:      boolean;
  streak:         number;   // consecutive days ending today
  last7:          { date: DateString; done: boolean }[];
  totalDone:      number;   // all-time completion count
  completionRate: number;   // 0–100, based on last 30 days
}

// ─────────────────────────────────────────────────────────────────────────────
// MOOD
// ─────────────────────────────────────────────────────────────────────────────

export type MoodValue = 1 | 2 | 3 | 4 | 5;

export interface MoodEntry {
  id:        ID;
  date:      DateString;
  v:         MoodValue;
  note:      string;
  createdAt: ISOString;
}

/** Static mood option (from MOODS constant) */
export interface MoodOption {
  v:     MoodValue;
  e:     string;   // emoji
  l:     string;   // label, e.g. "Luar Biasa"
  color: string;   // text color hex
  bg:    string;   // background rgba
}

// ─────────────────────────────────────────────────────────────────────────────
// DIARY
// ─────────────────────────────────────────────────────────────────────────────

export interface DiaryEntry {
  id:        ID;
  date:      DateString;
  content:   string;
  mood?:     MoodValue;
  tags:      string[];
  createdAt: ISOString;
  updatedAt: ISOString;
}

// ─────────────────────────────────────────────────────────────────────────────
// CALENDAR
// ─────────────────────────────────────────────────────────────────────────────

export type CalendarTab     = 'personal' | 'akademik' | 'finansial';
export type AkademikType    = 'Kuliah' | 'Praktikum' | 'UTS' | 'UAS' | 'Tugas' | 'Seminar';

export interface CalendarEvent {
  id:        ID;
  title:     string;
  date:      DateString;
  type:      'personal';
  time:      TimeString;
  notes:     string;
  createdAt: ISOString;
}

export interface AkademikEvent {
  id:        ID;
  title:     string;
  matkul:    string;
  date:      DateString;
  type:      AkademikType;
  jam:       TimeString;
  ruangan:   string;
  dosen:     string;
  sks:       string;
  createdAt: ISOString;
}

/** Union type used in calendar event lists */
export type AnyCalendarEvent =
  | CalendarEvent
  | AkademikEvent
  | (Transaction & { _isTxn: true })
  | (Task        & { _isTask: true });

// ─────────────────────────────────────────────────────────────────────────────
// AI ASSISTANT
// ─────────────────────────────────────────────────────────────────────────────

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id:        ID;
  role:      ChatRole;
  content:   string;
  timestamp: ISOString;
}

// ─────────────────────────────────────────────────────────────────────────────
// NEURAL ROADMAP
// ─────────────────────────────────────────────────────────────────────────────

export type NodeType = 'mission' | 'milestone' | 'task' | 'note';

export interface RoadmapNode {
  id:          ID;
  type:        NodeType;
  title:       string;
  description: string;
  color:       string;
  position:    { x: number; y: number };
  connections: ID[];    // IDs of outgoing edges
  createdAt:   ISOString;
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────

/** Aggregated snapshot used by the Dashboard page */
export interface DashboardSnapshot {
  todayPending:   number;
  todayDone:      number;
  habitsDone:     number;
  habitsTotal:    number;
  habitPct:       number;
  balance:        number;
  weeklySpend:    number;
  todayMood:      MoodEntry | undefined;
  longestStreak:  { name: string; streak: number; icon: string } | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATION
// ─────────────────────────────────────────────────────────────────────────────

export interface NavItem {
  id:    string;
  href:  string;
  label: string;
  emoji: string;
}

export interface NavGroup {
  group: string;
  items: readonly NavItem[];
}

// ─────────────────────────────────────────────────────────────────────────────
// FORM STATE HELPERS (local component state — not persisted)
// ─────────────────────────────────────────────────────────────────────────────

export interface TaskForm {
  title:    string;
  date:     DateString;
  priority: Priority;
  tag:      string;
  time:     TimeString;
  notes:    string;
}

export interface GoalForm {
  title:    string;
  type:     GoalType;
  deadline: DateString;
}

export interface TxnForm {
  type:   TxnType;
  amount: string;      // string while typing, parsed on submit
  desc:   string;
  cat:    string;
  date:   DateString;
}

export interface HabitForm {
  name:   string;
  icon:   string;
  freq:   HabitFrequency;
  target: number;
  color:  string;
}

export interface EventForm {
  title: string;
  time:  TimeString;
  notes: string;
}

export interface AkademikForm {
  title:   string;
  matkul:  string;
  date:    DateString;
  type:    AkademikType;
  jam:     TimeString;
  ruangan: string;
  dosen:   string;
  sks:     string;
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY GENERICS
// ─────────────────────────────────────────────────────────────────────────────

/** Make selected keys required and non-nullable */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/** Deep partial */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/** Extract only string keys from a type */
export type StringKeys<T> = {
  [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];
