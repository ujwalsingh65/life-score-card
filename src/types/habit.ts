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
