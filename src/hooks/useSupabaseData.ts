import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Habit, HabitLog } from "@/types/habit";

interface DbHabit {
  id: string;
  user_id: string;
  name: string;
  category: string;
  icon: string;
  color: string;
  target_days: number[];
  created_at: string;
}

interface DbHabitLog {
  id: string;
  user_id: string;
  habit_id: string;
  date: string;
  completed: boolean;
  note: string | null;
}

interface DbPlayerStats {
  id: string;
  total_xp: number;
  updated_at: string;
}

interface DbUnlockedAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
}

export function useSupabaseData() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [totalXP, setTotalXP] = useState(0);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all data on mount
  useEffect(() => {
    if (!user) {
      setHabits([]);
      setLogs([]);
      setTotalXP(0);
      setUnlockedAchievements([]);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch habits
        const { data: habitsData } = await supabase
          .from("habits")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });

        if (habitsData) {
          setHabits(
            habitsData.map((h: DbHabit) => ({
              id: h.id,
              name: h.name,
              category: h.category as Habit["category"],
              icon: h.icon,
              color: h.color,
              targetDays: h.target_days,
              createdAt: h.created_at,
            }))
          );
        }

        // Fetch logs
        const { data: logsData } = await supabase
          .from("habit_logs")
          .select("*")
          .eq("user_id", user.id);

        if (logsData) {
          setLogs(
            logsData.map((l: DbHabitLog) => ({
              habitId: l.habit_id,
              date: l.date,
              completed: l.completed,
              note: l.note ?? undefined,
            }))
          );
        }

        // Fetch player stats
        const { data: statsData } = await supabase
          .from("player_stats")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (statsData) {
          setTotalXP((statsData as DbPlayerStats).total_xp);
        }

        // Fetch achievements
        const { data: achievementsData } = await supabase
          .from("unlocked_achievements")
          .select("*")
          .eq("user_id", user.id);

        if (achievementsData) {
          setUnlockedAchievements(
            achievementsData.map((a: DbUnlockedAchievement) => a.achievement_id)
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Add habit
  const addHabit = useCallback(
    async (habit: Omit<Habit, "id" | "createdAt">) => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("habits")
        .insert({
          user_id: user.id,
          name: habit.name,
          category: habit.category,
          icon: habit.icon,
          color: habit.color,
          target_days: habit.targetDays,
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding habit:", error);
        return null;
      }

      const newHabit: Habit = {
        id: data.id,
        name: data.name,
        category: data.category as Habit["category"],
        icon: data.icon,
        color: data.color,
        targetDays: data.target_days,
        createdAt: data.created_at,
      };

      setHabits((prev) => [...prev, newHabit]);
      return newHabit;
    },
    [user]
  );

  // Delete habit
  const deleteHabit = useCallback(
    async (habitId: string) => {
      if (!user) return;

      const { error } = await supabase
        .from("habits")
        .delete()
        .eq("id", habitId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error deleting habit:", error);
        return;
      }

      setHabits((prev) => prev.filter((h) => h.id !== habitId));
      setLogs((prev) => prev.filter((l) => l.habitId !== habitId));
    },
    [user]
  );

  // Toggle habit log
  const toggleHabitLog = useCallback(
    async (habitId: string, date: string): Promise<boolean> => {
      if (!user) return false;

      const existing = logs.find(
        (l) => l.habitId === habitId && l.date === date
      );

      if (existing) {
        // Remove log
        const { error } = await supabase
          .from("habit_logs")
          .delete()
          .eq("habit_id", habitId)
          .eq("date", date)
          .eq("user_id", user.id);

        if (error) {
          console.error("Error deleting log:", error);
          return false;
        }

        setLogs((prev) =>
          prev.filter((l) => !(l.habitId === habitId && l.date === date))
        );
        return false;
      } else {
        // Add log
        const { error } = await supabase.from("habit_logs").insert({
          user_id: user.id,
          habit_id: habitId,
          date,
          completed: true,
        });

        if (error) {
          console.error("Error adding log:", error);
          return false;
        }

        setLogs((prev) => [...prev, { habitId, date, completed: true }]);
        return true;
      }
    },
    [user, logs]
  );

  // Update XP
  const updateXP = useCallback(
    async (amount: number): Promise<number> => {
      if (!user) return totalXP;

      const newTotal = totalXP + amount;

      const { error } = await supabase
        .from("player_stats")
        .update({ total_xp: newTotal, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      if (error) {
        console.error("Error updating XP:", error);
        return totalXP;
      }

      setTotalXP(newTotal);
      return newTotal;
    },
    [user, totalXP]
  );

  // Unlock achievement
  const unlockAchievement = useCallback(
    async (achievementId: string): Promise<boolean> => {
      if (!user) return false;
      if (unlockedAchievements.includes(achievementId)) return false;

      const { error } = await supabase.from("unlocked_achievements").insert({
        user_id: user.id,
        achievement_id: achievementId,
      });

      if (error) {
        console.error("Error unlocking achievement:", error);
        return false;
      }

      setUnlockedAchievements((prev) => [...prev, achievementId]);
      return true;
    },
    [user, unlockedAchievements]
  );

  // Check if habit is completed
  const isCompleted = useCallback(
    (habitId: string, date: string): boolean => {
      return logs.some(
        (l) => l.habitId === habitId && l.date === date && l.completed
      );
    },
    [logs]
  );

  // Get streak for habit
  const getStreak = useCallback(
    (habitId: string): number => {
      const habit = habits.find((h) => h.id === habitId);
      if (!habit) return 0;

      const habitLogs = logs
        .filter((l) => l.habitId === habitId && l.completed)
        .map((l) => l.date);
      const logDates = new Set(habitLogs);

      let streak = 0;
      const today = new Date();

      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dayOfWeek = checkDate.getDay();

        if (!habit.targetDays.includes(dayOfWeek)) continue;

        const dateStr = checkDate.toISOString().split("T")[0];

        if (logDates.has(dateStr)) {
          streak++;
        } else if (i > 0) {
          break;
        }
      }

      return streak;
    },
    [habits, logs]
  );

  // Get best streak
  const getBestStreak = useCallback(
    (habitId: string): number => {
      const habit = habits.find((h) => h.id === habitId);
      if (!habit) return 0;

      const habitLogs = logs
        .filter((l) => l.habitId === habitId && l.completed)
        .map((l) => l.date)
        .sort();

      if (habitLogs.length === 0) return 0;

      let maxStreak = 0;
      let currentStreak = 0;
      let lastDate: Date | null = null;

      for (const dateStr of habitLogs) {
        const currentDate = new Date(dateStr);

        if (lastDate) {
          const diff = Math.floor(
            (currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (diff === 1) {
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
    },
    [habits, logs]
  );

  // Get today's habits
  const getTodayHabits = useCallback((): Habit[] => {
    const todayDayOfWeek = new Date().getDay();
    return habits.filter((h) => h.targetDays.includes(todayDayOfWeek));
  }, [habits]);

  // Get today's stats
  const getTodayStats = useCallback((): { completed: number; total: number } => {
    const today = new Date().toISOString().split("T")[0];
    const todayHabits = getTodayHabits();
    const completed = todayHabits.filter((h) => isCompleted(h.id, today)).length;
    return { completed, total: todayHabits.length };
  }, [getTodayHabits, isCompleted]);

  return {
    habits,
    logs,
    totalXP,
    unlockedAchievements,
    loading,
    addHabit,
    deleteHabit,
    toggleHabitLog,
    updateXP,
    unlockAchievement,
    isCompleted,
    getStreak,
    getBestStreak,
    getTodayHabits,
    getTodayStats,
  };
}
