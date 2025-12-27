import { getHabits, getLogs, getHabitStreak, getLongestStreak, formatDate, getTodayCompletionStats } from "./habits";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  type: "streak" | "total_completions" | "perfect_days" | "habits_created" | "level";
  rarity: "common" | "rare" | "epic" | "legendary";
}

export interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: string;
}

const ACHIEVEMENTS_KEY = "quest-achievements";

export const ACHIEVEMENTS: Achievement[] = [
  // Streak achievements
  { id: "streak_3", name: "First Steps", description: "Maintain a 3-day streak", icon: "🔥", requirement: 3, type: "streak", rarity: "common" },
  { id: "streak_7", name: "Week Warrior", description: "Maintain a 7-day streak", icon: "⚔️", requirement: 7, type: "streak", rarity: "common" },
  { id: "streak_14", name: "Fortnight Fighter", description: "Maintain a 14-day streak", icon: "🗡️", requirement: 14, type: "streak", rarity: "rare" },
  { id: "streak_30", name: "Monthly Master", description: "Maintain a 30-day streak", icon: "👑", requirement: 30, type: "streak", rarity: "epic" },
  { id: "streak_60", name: "Shadow Monarch", description: "Maintain a 60-day streak", icon: "🌑", requirement: 60, type: "streak", rarity: "legendary" },
  { id: "streak_100", name: "Arise!", description: "Maintain a 100-day streak", icon: "⬆️", requirement: 100, type: "streak", rarity: "legendary" },
  
  // Perfect day achievements
  { id: "perfect_1", name: "Perfect Day", description: "Complete all quests in a day", icon: "✨", requirement: 1, type: "perfect_days", rarity: "common" },
  { id: "perfect_7", name: "Perfect Week", description: "Complete all quests for 7 days", icon: "💫", requirement: 7, type: "perfect_days", rarity: "rare" },
  { id: "perfect_30", name: "Flawless Month", description: "Complete all quests for 30 days", icon: "🌟", requirement: 30, type: "perfect_days", rarity: "legendary" },
  
  // Total completions
  { id: "complete_10", name: "Quest Beginner", description: "Complete 10 quests total", icon: "📜", requirement: 10, type: "total_completions", rarity: "common" },
  { id: "complete_50", name: "Quest Adept", description: "Complete 50 quests total", icon: "📋", requirement: 50, type: "total_completions", rarity: "common" },
  { id: "complete_100", name: "Quest Expert", description: "Complete 100 quests total", icon: "📖", requirement: 100, type: "total_completions", rarity: "rare" },
  { id: "complete_500", name: "Quest Legend", description: "Complete 500 quests total", icon: "📚", requirement: 500, type: "total_completions", rarity: "epic" },
  { id: "complete_1000", name: "Quest Immortal", description: "Complete 1000 quests total", icon: "🏛️", requirement: 1000, type: "total_completions", rarity: "legendary" },
  
  // Habits created
  { id: "habits_3", name: "Triple Threat", description: "Create 3 quests", icon: "🎯", requirement: 3, type: "habits_created", rarity: "common" },
  { id: "habits_5", name: "High Five", description: "Create 5 quests", icon: "🖐️", requirement: 5, type: "habits_created", rarity: "common" },
  { id: "habits_10", name: "Quest Collector", description: "Create 10 quests", icon: "🎪", requirement: 10, type: "habits_created", rarity: "rare" },
];

export function getUnlockedAchievements(): UnlockedAchievement[] {
  const stored = localStorage.getItem(ACHIEVEMENTS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveUnlockedAchievements(achievements: UnlockedAchievement[]): void {
  localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
}

export function unlockAchievement(achievementId: string): boolean {
  const unlocked = getUnlockedAchievements();
  if (unlocked.some((a) => a.achievementId === achievementId)) {
    return false; // Already unlocked
  }
  
  unlocked.push({
    achievementId,
    unlockedAt: new Date().toISOString(),
  });
  saveUnlockedAchievements(unlocked);
  return true;
}

export function isAchievementUnlocked(achievementId: string): boolean {
  return getUnlockedAchievements().some((a) => a.achievementId === achievementId);
}

export function getMaxStreak(): number {
  const habits = getHabits();
  return Math.max(0, ...habits.map((h) => getLongestStreak(h.id)));
}

export function getTotalCompletions(): number {
  return getLogs().filter((l) => l.completed).length;
}

export function getPerfectDaysCount(): number {
  const logs = getLogs();
  const habits = getHabits();
  
  // Group logs by date
  const dateMap: Record<string, Set<string>> = {};
  logs.forEach((log) => {
    if (log.completed) {
      if (!dateMap[log.date]) {
        dateMap[log.date] = new Set();
      }
      dateMap[log.date].add(log.habitId);
    }
  });
  
  let perfectDays = 0;
  
  Object.entries(dateMap).forEach(([dateStr, completedHabitIds]) => {
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    
    // Get habits that were supposed to be done that day
    const habitsForDay = habits.filter((h) => h.targetDays.includes(dayOfWeek));
    
    if (habitsForDay.length > 0 && habitsForDay.every((h) => completedHabitIds.has(h.id))) {
      perfectDays++;
    }
  });
  
  return perfectDays;
}

export function checkAndUnlockAchievements(): Achievement[] {
  const newlyUnlocked: Achievement[] = [];
  
  const maxStreak = getMaxStreak();
  const totalCompletions = getTotalCompletions();
  const perfectDays = getPerfectDaysCount();
  const habitsCount = getHabits().length;
  
  ACHIEVEMENTS.forEach((achievement) => {
    if (isAchievementUnlocked(achievement.id)) return;
    
    let shouldUnlock = false;
    
    switch (achievement.type) {
      case "streak":
        shouldUnlock = maxStreak >= achievement.requirement;
        break;
      case "total_completions":
        shouldUnlock = totalCompletions >= achievement.requirement;
        break;
      case "perfect_days":
        shouldUnlock = perfectDays >= achievement.requirement;
        break;
      case "habits_created":
        shouldUnlock = habitsCount >= achievement.requirement;
        break;
    }
    
    if (shouldUnlock && unlockAchievement(achievement.id)) {
      newlyUnlocked.push(achievement);
    }
  });
  
  return newlyUnlocked;
}

export function getRarityColor(rarity: Achievement["rarity"]): string {
  switch (rarity) {
    case "common":
      return "hsl(var(--muted-foreground))";
    case "rare":
      return "hsl(var(--primary))";
    case "epic":
      return "hsl(280 70% 60%)";
    case "legendary":
      return "hsl(38 92% 50%)";
  }
}

export function getRarityGlow(rarity: Achievement["rarity"]): string {
  switch (rarity) {
    case "common":
      return "";
    case "rare":
      return "shadow-[0_0_15px_hsl(var(--primary)/0.5)]";
    case "epic":
      return "shadow-[0_0_20px_hsl(280_70%_60%/0.6)]";
    case "legendary":
      return "shadow-[0_0_25px_hsl(38_92%_50%/0.7)]";
  }
}
