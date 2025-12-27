import { XP_REWARDS, LEVEL_CONFIG, PlayerStats } from "@/types/habit";

const XP_STORAGE_KEY = "hunter-xp";

export function getTotalXP(): number {
  const stored = localStorage.getItem(XP_STORAGE_KEY);
  return stored ? parseInt(stored, 10) : 0;
}

export function saveTotalXP(xp: number): void {
  localStorage.setItem(XP_STORAGE_KEY, xp.toString());
}

export function addXP(amount: number): number {
  const currentXP = getTotalXP();
  const newXP = currentXP + amount;
  saveTotalXP(newXP);
  return newXP;
}

interface LevelEntry {
  level: number;
  xpRequired: number;
  rank: string;
}

export function calculatePlayerStats(totalXP: number): PlayerStats {
  const levels: LevelEntry[] = [...LEVEL_CONFIG];
  let currentLevel = levels[0];
  let nextLevel = levels[1];

  for (let i = levels.length - 1; i >= 0; i--) {
    if (totalXP >= levels[i].xpRequired) {
      currentLevel = levels[i];
      nextLevel = levels[i + 1] ?? levels[i];
      break;
    }
  }

  const xpInCurrentLevel = totalXP - currentLevel.xpRequired;
  const xpNeededForNext = nextLevel.xpRequired - currentLevel.xpRequired;

  return {
    level: currentLevel.level,
    currentXP: xpInCurrentLevel,
    xpToNextLevel: xpNeededForNext,
    totalXP,
    rank: currentLevel.rank,
  };
}

export function calculateCompletionXP(streak: number, isPerfectDay: boolean): number {
  let xp = XP_REWARDS.HABIT_COMPLETE;

  // Streak bonuses
  if (streak >= 30) {
    xp += XP_REWARDS.STREAK_BONUS_30;
  } else if (streak >= 14) {
    xp += XP_REWARDS.STREAK_BONUS_14;
  } else if (streak >= 7) {
    xp += XP_REWARDS.STREAK_BONUS_7;
  } else if (streak >= 3) {
    xp += XP_REWARDS.STREAK_BONUS_3;
  }

  // Perfect day bonus
  if (isPerfectDay) {
    xp += XP_REWARDS.PERFECT_DAY;
  }

  return xp;
}

export function getRankColor(rank: string): string {
  if (rank.includes("SS")) return "hsl(45 100% 50%)";
  if (rank.includes("S-")) return "hsl(280 100% 65%)";
  if (rank.includes("A-")) return "hsl(200 100% 50%)";
  if (rank.includes("B-")) return "hsl(145 70% 45%)";
  if (rank.includes("C-")) return "hsl(38 92% 50%)";
  if (rank.includes("D-")) return "hsl(16 85% 58%)";
  return "hsl(220 10% 50%)";
}
