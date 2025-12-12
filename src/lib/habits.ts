import { Habit, HabitLog } from "@/types/habit";

const HABITS_KEY = "habit-monitor-habits";
const LOGS_KEY = "habit-monitor-logs";

export function getHabits(): Habit[] {
  const stored = localStorage.getItem(HABITS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveHabits(habits: Habit[]): void {
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}

export function addHabit(habit: Habit): void {
  const habits = getHabits();
  habits.push(habit);
  saveHabits(habits);
}

export function updateHabit(habit: Habit): void {
  const habits = getHabits();
  const index = habits.findIndex((h) => h.id === habit.id);
  if (index !== -1) {
    habits[index] = habit;
    saveHabits(habits);
  }
}

export function deleteHabit(habitId: string): void {
  const habits = getHabits().filter((h) => h.id !== habitId);
  saveHabits(habits);
  
  // Also delete associated logs
  const logs = getLogs().filter((l) => l.habitId !== habitId);
  saveLogs(logs);
}

export function getLogs(): HabitLog[] {
  const stored = localStorage.getItem(LOGS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveLogs(logs: HabitLog[]): void {
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

export function toggleHabitLog(habitId: string, date: string): boolean {
  const logs = getLogs();
  const existingIndex = logs.findIndex(
    (l) => l.habitId === habitId && l.date === date
  );

  if (existingIndex !== -1) {
    // Toggle off
    logs.splice(existingIndex, 1);
    saveLogs(logs);
    return false;
  } else {
    // Toggle on
    logs.push({ habitId, date, completed: true });
    saveLogs(logs);
    return true;
  }
}

export function isHabitCompleted(habitId: string, date: string): boolean {
  const logs = getLogs();
  return logs.some((l) => l.habitId === habitId && l.date === date && l.completed);
}

export function getHabitStreak(habitId: string): number {
  const habit = getHabits().find((h) => h.id === habitId);
  if (!habit) return 0;

  const logs = getLogs().filter((l) => l.habitId === habitId && l.completed);
  const logDates = new Set(logs.map((l) => l.date));

  let streak = 0;
  const today = new Date();
  
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dayOfWeek = checkDate.getDay();
    
    // Skip days that aren't target days for this habit
    if (!habit.targetDays.includes(dayOfWeek)) continue;
    
    const dateStr = formatDate(checkDate);
    
    if (logDates.has(dateStr)) {
      streak++;
    } else if (i > 0) {
      // Don't break on today if it's not completed yet
      break;
    }
  }

  return streak;
}

export function getLongestStreak(habitId: string): number {
  const habit = getHabits().find((h) => h.id === habitId);
  if (!habit) return 0;

  const logs = getLogs()
    .filter((l) => l.habitId === habitId && l.completed)
    .map((l) => l.date)
    .sort();

  if (logs.length === 0) return 0;

  let maxStreak = 0;
  let currentStreak = 0;
  let lastDate: Date | null = null;

  for (const dateStr of logs) {
    const currentDate = new Date(dateStr);
    
    if (lastDate) {
      const diff = Math.floor(
        (currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (diff === 1 || (diff > 1 && isGapOnlyNonTargetDays(habit, lastDate, currentDate))) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
    }

    maxStreak = Math.max(maxStreak, currentStreak);
    lastDate = currentDate;
  }

  return maxStreak;
}

function isGapOnlyNonTargetDays(habit: Habit, start: Date, end: Date): boolean {
  const current = new Date(start);
  current.setDate(current.getDate() + 1);
  
  while (current < end) {
    if (habit.targetDays.includes(current.getDay())) {
      return false;
    }
    current.setDate(current.getDate() + 1);
  }
  return true;
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function getWeekDates(referenceDate: Date = new Date()): Date[] {
  const dates: Date[] = [];
  const startOfWeek = new Date(referenceDate);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(date.getDate() + i);
    dates.push(date);
  }

  return dates;
}

export function getTodayCompletionStats(): { completed: number; total: number } {
  const habits = getHabits();
  const today = formatDate(new Date());
  const todayDayOfWeek = new Date().getDay();

  const todayHabits = habits.filter((h) => h.targetDays.includes(todayDayOfWeek));
  const completed = todayHabits.filter((h) => isHabitCompleted(h.id, today)).length;

  return { completed, total: todayHabits.length };
}

export function getWeeklyStats(): { completed: number; total: number } {
  const habits = getHabits();
  const weekDates = getWeekDates();
  
  let total = 0;
  let completed = 0;

  for (const date of weekDates) {
    const dayOfWeek = date.getDay();
    const dateStr = formatDate(date);
    
    for (const habit of habits) {
      if (habit.targetDays.includes(dayOfWeek)) {
        total++;
        if (isHabitCompleted(habit.id, dateStr)) {
          completed++;
        }
      }
    }
  }

  return { completed, total };
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
