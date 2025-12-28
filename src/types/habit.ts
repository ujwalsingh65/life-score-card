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
  reminderTime?: string | null; // HH:MM format
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

// Level thresholds and ranks - 100 levels, National Level requires ~4 years of daily completion
// Assuming ~50 XP/day average with streaks: 4 years = 1460 days * 50 XP = ~73,000 XP for max rank
export const LEVEL_CONFIG = [
  // E-Rank: Levels 1-10
  { level: 1, xpRequired: 0, rank: "E-Rank Hunter" },
  { level: 2, xpRequired: 50, rank: "E-Rank Hunter" },
  { level: 3, xpRequired: 120, rank: "E-Rank Hunter" },
  { level: 4, xpRequired: 200, rank: "E-Rank Hunter" },
  { level: 5, xpRequired: 300, rank: "E-Rank Hunter" },
  { level: 6, xpRequired: 420, rank: "E-Rank Hunter" },
  { level: 7, xpRequired: 560, rank: "E-Rank Hunter" },
  { level: 8, xpRequired: 720, rank: "E-Rank Hunter" },
  { level: 9, xpRequired: 900, rank: "E-Rank Hunter" },
  { level: 10, xpRequired: 1100, rank: "E-Rank Hunter" },
  // D-Rank: Levels 11-20
  { level: 11, xpRequired: 1320, rank: "D-Rank Hunter" },
  { level: 12, xpRequired: 1560, rank: "D-Rank Hunter" },
  { level: 13, xpRequired: 1820, rank: "D-Rank Hunter" },
  { level: 14, xpRequired: 2100, rank: "D-Rank Hunter" },
  { level: 15, xpRequired: 2400, rank: "D-Rank Hunter" },
  { level: 16, xpRequired: 2720, rank: "D-Rank Hunter" },
  { level: 17, xpRequired: 3060, rank: "D-Rank Hunter" },
  { level: 18, xpRequired: 3420, rank: "D-Rank Hunter" },
  { level: 19, xpRequired: 3800, rank: "D-Rank Hunter" },
  { level: 20, xpRequired: 4200, rank: "D-Rank Hunter" },
  // C-Rank: Levels 21-35
  { level: 21, xpRequired: 4620, rank: "C-Rank Hunter" },
  { level: 22, xpRequired: 5060, rank: "C-Rank Hunter" },
  { level: 23, xpRequired: 5520, rank: "C-Rank Hunter" },
  { level: 24, xpRequired: 6000, rank: "C-Rank Hunter" },
  { level: 25, xpRequired: 6500, rank: "C-Rank Hunter" },
  { level: 26, xpRequired: 7020, rank: "C-Rank Hunter" },
  { level: 27, xpRequired: 7560, rank: "C-Rank Hunter" },
  { level: 28, xpRequired: 8120, rank: "C-Rank Hunter" },
  { level: 29, xpRequired: 8700, rank: "C-Rank Hunter" },
  { level: 30, xpRequired: 9300, rank: "C-Rank Hunter" },
  { level: 31, xpRequired: 9920, rank: "C-Rank Hunter" },
  { level: 32, xpRequired: 10560, rank: "C-Rank Hunter" },
  { level: 33, xpRequired: 11220, rank: "C-Rank Hunter" },
  { level: 34, xpRequired: 11900, rank: "C-Rank Hunter" },
  { level: 35, xpRequired: 12600, rank: "C-Rank Hunter" },
  // B-Rank: Levels 36-50
  { level: 36, xpRequired: 13320, rank: "B-Rank Hunter" },
  { level: 37, xpRequired: 14060, rank: "B-Rank Hunter" },
  { level: 38, xpRequired: 14820, rank: "B-Rank Hunter" },
  { level: 39, xpRequired: 15600, rank: "B-Rank Hunter" },
  { level: 40, xpRequired: 16400, rank: "B-Rank Hunter" },
  { level: 41, xpRequired: 17220, rank: "B-Rank Hunter" },
  { level: 42, xpRequired: 18060, rank: "B-Rank Hunter" },
  { level: 43, xpRequired: 18920, rank: "B-Rank Hunter" },
  { level: 44, xpRequired: 19800, rank: "B-Rank Hunter" },
  { level: 45, xpRequired: 20700, rank: "B-Rank Hunter" },
  { level: 46, xpRequired: 21620, rank: "B-Rank Hunter" },
  { level: 47, xpRequired: 22560, rank: "B-Rank Hunter" },
  { level: 48, xpRequired: 23520, rank: "B-Rank Hunter" },
  { level: 49, xpRequired: 24500, rank: "B-Rank Hunter" },
  { level: 50, xpRequired: 25500, rank: "B-Rank Hunter" },
  // A-Rank: Levels 51-65
  { level: 51, xpRequired: 26520, rank: "A-Rank Hunter" },
  { level: 52, xpRequired: 27560, rank: "A-Rank Hunter" },
  { level: 53, xpRequired: 28620, rank: "A-Rank Hunter" },
  { level: 54, xpRequired: 29700, rank: "A-Rank Hunter" },
  { level: 55, xpRequired: 30800, rank: "A-Rank Hunter" },
  { level: 56, xpRequired: 31920, rank: "A-Rank Hunter" },
  { level: 57, xpRequired: 33060, rank: "A-Rank Hunter" },
  { level: 58, xpRequired: 34220, rank: "A-Rank Hunter" },
  { level: 59, xpRequired: 35400, rank: "A-Rank Hunter" },
  { level: 60, xpRequired: 36600, rank: "A-Rank Hunter" },
  { level: 61, xpRequired: 37820, rank: "A-Rank Hunter" },
  { level: 62, xpRequired: 39060, rank: "A-Rank Hunter" },
  { level: 63, xpRequired: 40320, rank: "A-Rank Hunter" },
  { level: 64, xpRequired: 41600, rank: "A-Rank Hunter" },
  { level: 65, xpRequired: 42900, rank: "A-Rank Hunter" },
  // S-Rank: Levels 66-80
  { level: 66, xpRequired: 44220, rank: "S-Rank Hunter" },
  { level: 67, xpRequired: 45560, rank: "S-Rank Hunter" },
  { level: 68, xpRequired: 46920, rank: "S-Rank Hunter" },
  { level: 69, xpRequired: 48300, rank: "S-Rank Hunter" },
  { level: 70, xpRequired: 49700, rank: "S-Rank Hunter" },
  { level: 71, xpRequired: 51120, rank: "S-Rank Hunter" },
  { level: 72, xpRequired: 52560, rank: "S-Rank Hunter" },
  { level: 73, xpRequired: 54020, rank: "S-Rank Hunter" },
  { level: 74, xpRequired: 55500, rank: "S-Rank Hunter" },
  { level: 75, xpRequired: 57000, rank: "S-Rank Hunter" },
  { level: 76, xpRequired: 58520, rank: "S-Rank Hunter" },
  { level: 77, xpRequired: 60060, rank: "S-Rank Hunter" },
  { level: 78, xpRequired: 61620, rank: "S-Rank Hunter" },
  { level: 79, xpRequired: 63200, rank: "S-Rank Hunter" },
  { level: 80, xpRequired: 64800, rank: "S-Rank Hunter" },
  // SS-Rank: Levels 81-95
  { level: 81, xpRequired: 66420, rank: "SS-Rank Hunter" },
  { level: 82, xpRequired: 68060, rank: "SS-Rank Hunter" },
  { level: 83, xpRequired: 69720, rank: "SS-Rank Hunter" },
  { level: 84, xpRequired: 71400, rank: "SS-Rank Hunter" },
  { level: 85, xpRequired: 73100, rank: "SS-Rank Hunter" },
  { level: 86, xpRequired: 74820, rank: "SS-Rank Hunter" },
  { level: 87, xpRequired: 76560, rank: "SS-Rank Hunter" },
  { level: 88, xpRequired: 78320, rank: "SS-Rank Hunter" },
  { level: 89, xpRequired: 80100, rank: "SS-Rank Hunter" },
  { level: 90, xpRequired: 81900, rank: "SS-Rank Hunter" },
  { level: 91, xpRequired: 83720, rank: "SS-Rank Hunter" },
  { level: 92, xpRequired: 85560, rank: "SS-Rank Hunter" },
  { level: 93, xpRequired: 87420, rank: "SS-Rank Hunter" },
  { level: 94, xpRequired: 89300, rank: "SS-Rank Hunter" },
  { level: 95, xpRequired: 91200, rank: "SS-Rank Hunter" },
  // National Level Hunter: Levels 96-100 (~4 years of daily completion required)
  { level: 96, xpRequired: 93120, rank: "National Level Hunter" },
  { level: 97, xpRequired: 95060, rank: "National Level Hunter" },
  { level: 98, xpRequired: 97020, rank: "National Level Hunter" },
  { level: 99, xpRequired: 99000, rank: "National Level Hunter" },
  { level: 100, xpRequired: 101000, rank: "National Level Hunter" },
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
