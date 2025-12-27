export type HabitCategory = 
  | "health" 
  | "productivity" 
  | "learning" 
  | "fitness" 
  | "mindfulness" 
  | "social" 
  | "finance" 
  | "creative";

export interface Habit {
  id: string;
  name: string;
  category: HabitCategory;
  icon: string;
  color: string;
  targetDays: number[]; // 0-6, Sunday-Saturday
  createdAt: string;
}

export interface HabitLog {
  habitId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  note?: string;
}

export interface DailyStats {
  date: string;
  completed: number;
  total: number;
  percentage: number;
}

export interface PlayerStats {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  rank: string;
}

// XP rewards based on actions
export const XP_REWARDS = {
  HABIT_COMPLETE: 10,
  STREAK_BONUS_3: 15,
  STREAK_BONUS_7: 30,
  STREAK_BONUS_14: 50,
  STREAK_BONUS_30: 100,
  PERFECT_DAY: 50,
} as const;

// Level thresholds and ranks
export const LEVEL_CONFIG = [
  { level: 1, xpRequired: 0, rank: "E-Rank Hunter" },
  { level: 2, xpRequired: 100, rank: "E-Rank Hunter" },
  { level: 3, xpRequired: 250, rank: "D-Rank Hunter" },
  { level: 4, xpRequired: 450, rank: "D-Rank Hunter" },
  { level: 5, xpRequired: 700, rank: "C-Rank Hunter" },
  { level: 6, xpRequired: 1000, rank: "C-Rank Hunter" },
  { level: 7, xpRequired: 1400, rank: "B-Rank Hunter" },
  { level: 8, xpRequired: 1900, rank: "B-Rank Hunter" },
  { level: 9, xpRequired: 2500, rank: "A-Rank Hunter" },
  { level: 10, xpRequired: 3200, rank: "A-Rank Hunter" },
  { level: 11, xpRequired: 4000, rank: "S-Rank Hunter" },
  { level: 12, xpRequired: 5000, rank: "S-Rank Hunter" },
  { level: 13, xpRequired: 6200, rank: "SS-Rank Hunter" },
  { level: 14, xpRequired: 7600, rank: "SS-Rank Hunter" },
  { level: 15, xpRequired: 9200, rank: "National Level Hunter" },
] as const;

export const CATEGORY_CONFIG: Record<HabitCategory, { label: string; icon: string; color: string }> = {
  health: { label: "Health", icon: "🍎", color: "hsl(145 65% 40%)" },
  productivity: { label: "Productivity", icon: "⚡", color: "hsl(38 92% 50%)" },
  learning: { label: "Learning", icon: "📚", color: "hsl(220 70% 55%)" },
  fitness: { label: "Fitness", icon: "💪", color: "hsl(16 85% 58%)" },
  mindfulness: { label: "Mindfulness", icon: "🧘", color: "hsl(280 65% 60%)" },
  social: { label: "Social", icon: "👥", color: "hsl(340 70% 55%)" },
  finance: { label: "Finance", icon: "💰", color: "hsl(145 50% 45%)" },
  creative: { label: "Creative", icon: "🎨", color: "hsl(320 70% 55%)" },
};

export const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const DAYS_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
