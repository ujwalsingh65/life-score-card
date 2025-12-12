import { useState, useEffect, useCallback } from "react";
import { Habit, HabitLog, CATEGORY_CONFIG } from "@/types/habit";
import {
  getHabits,
  saveHabits,
  getLogs,
  saveLogs,
  toggleHabitLog as toggleLog,
  getHabitStreak,
  getLongestStreak,
  generateId,
  formatDate,
} from "@/lib/habits";

const SAMPLE_HABITS: Omit<Habit, "id" | "createdAt">[] = [
  {
    name: "Morning Meditation",
    category: "mindfulness",
    icon: "🧘",
    color: CATEGORY_CONFIG.mindfulness.color,
    targetDays: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    name: "Read 20 Pages",
    category: "learning",
    icon: "📖",
    color: CATEGORY_CONFIG.learning.color,
    targetDays: [1, 2, 3, 4, 5],
  },
  {
    name: "Exercise",
    category: "fitness",
    icon: "💪",
    color: CATEGORY_CONFIG.fitness.color,
    targetDays: [1, 3, 5],
  },
];

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let storedHabits = getHabits();
    
    // Seed sample habits for new users
    if (storedHabits.length === 0) {
      storedHabits = SAMPLE_HABITS.map((h) => ({
        ...h,
        id: generateId(),
        createdAt: new Date().toISOString(),
      }));
      saveHabits(storedHabits);
    }
    
    setHabits(storedHabits);
    setLogs(getLogs());
    setLoading(false);
  }, []);

  const addHabit = useCallback((habit: Omit<Habit, "id" | "createdAt">) => {
    const newHabit: Habit = {
      ...habit,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setHabits((prev) => {
      const updated = [...prev, newHabit];
      saveHabits(updated);
      return updated;
    });
    return newHabit;
  }, []);

  const updateHabit = useCallback((habit: Habit) => {
    setHabits((prev) => {
      const updated = prev.map((h) => (h.id === habit.id ? habit : h));
      saveHabits(updated);
      return updated;
    });
  }, []);

  const deleteHabit = useCallback((habitId: string) => {
    setHabits((prev) => {
      const updated = prev.filter((h) => h.id !== habitId);
      saveHabits(updated);
      return updated;
    });
    setLogs((prev) => {
      const updated = prev.filter((l) => l.habitId !== habitId);
      saveLogs(updated);
      return updated;
    });
  }, []);

  const toggleHabitLog = useCallback((habitId: string, date: string) => {
    const completed = toggleLog(habitId, date);
    setLogs(getLogs());
    return completed;
  }, []);

  const isCompleted = useCallback(
    (habitId: string, date: string) => {
      return logs.some(
        (l) => l.habitId === habitId && l.date === date && l.completed
      );
    },
    [logs]
  );

  const getStreak = useCallback(
    (habitId: string) => {
      return getHabitStreak(habitId);
    },
    [logs]
  );

  const getBestStreak = useCallback(
    (habitId: string) => {
      return getLongestStreak(habitId);
    },
    [logs]
  );

  const getTodayHabits = useCallback(() => {
    const todayDayOfWeek = new Date().getDay();
    return habits.filter((h) => h.targetDays.includes(todayDayOfWeek));
  }, [habits]);

  const getTodayStats = useCallback(() => {
    const todayHabits = getTodayHabits();
    const today = formatDate(new Date());
    const completed = todayHabits.filter((h) => isCompleted(h.id, today)).length;
    return { completed, total: todayHabits.length };
  }, [getTodayHabits, isCompleted]);

  return {
    habits,
    logs,
    loading,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabitLog,
    isCompleted,
    getStreak,
    getBestStreak,
    getTodayHabits,
    getTodayStats,
  };
}
