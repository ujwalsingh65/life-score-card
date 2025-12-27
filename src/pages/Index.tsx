import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Zap, LayoutGrid, Calendar, Trash2, MoreVertical, BarChart3, Trophy } from "lucide-react";
import { useHabits } from "@/hooks/useHabits";
import { HabitCard } from "@/components/HabitCard";
import { AddHabitDialog } from "@/components/AddHabitDialog";
import { WeeklyView } from "@/components/WeeklyView";
import { DashboardStats } from "@/components/DashboardStats";
import { ProgressRing } from "@/components/ProgressRing";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { PlayerLevel } from "@/components/PlayerLevel";
import { AchievementsPanel } from "@/components/AchievementsPanel";
import { AchievementToast } from "@/components/AchievementToast";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, getWeeklyStats } from "@/lib/habits";
import { getTotalXP, addXP, calculatePlayerStats, calculateCompletionXP } from "@/lib/xp";
import { checkAndUnlockAchievements, Achievement } from "@/lib/achievements";
import { PlayerStats } from "@/types/habit";

export default function Index() {
  const {
    habits,
    loading,
    addHabit,
    deleteHabit,
    toggleHabitLog,
    isCompleted,
    getStreak,
    getBestStreak,
    getTodayHabits,
    getTodayStats,
  } = useHabits();

  const [playerStats, setPlayerStats] = useState<PlayerStats>(() => 
    calculatePlayerStats(getTotalXP())
  );
  const [xpGain, setXpGain] = useState(0);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

  const today = formatDate(new Date());
  const todayHabits = getTodayHabits();
  const todayStats = getTodayStats();
  const weeklyStats = getWeeklyStats();

  const totalBestStreak = useMemo(() => {
    return habits.reduce((max, h) => Math.max(max, getBestStreak(h.id)), 0);
  }, [habits, getBestStreak]);

  const todayPercentage = todayStats.total > 0 
    ? (todayStats.completed / todayStats.total) * 100 
    : 0;

  // Handle quest completion with XP and achievements
  const handleQuestToggle = (habitId: string) => {
    const wasCompleted = isCompleted(habitId, today);
    toggleHabitLog(habitId, today);
    
    // Only grant XP when completing, not uncompleting
    if (!wasCompleted) {
      const streak = getStreak(habitId);
      const willBePerfect = todayStats.completed + 1 === todayStats.total;
      const earned = calculateCompletionXP(streak, willBePerfect);
      
      const newTotal = addXP(earned);
      setPlayerStats(calculatePlayerStats(newTotal));
      setXpGain(earned);
      
      // Clear XP popup after animation
      setTimeout(() => setXpGain(0), 2000);
      
      // Check for new achievements
      setTimeout(() => {
        const unlocked = checkAndUnlockAchievements();
        if (unlocked.length > 0) {
          setNewAchievement(unlocked[0]);
        }
      }, 500);
    }
  };
  
  // Check achievements on habit creation
  const handleAddHabit = (habit: Parameters<typeof addHabit>[0]) => {
    addHabit(habit);
    setTimeout(() => {
      const unlocked = checkAndUnlockAchievements();
      if (unlocked.length > 0) {
        setNewAchievement(unlocked[0]);
      }
    }, 300);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-shimmer h-8 w-32 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-primary/20 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-neon animate-pulse-glow">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold text-primary text-glow">QUEST MONITOR</h1>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Level Up Your Life</p>
              </div>
            </div>
            <AddHabitDialog onAdd={handleAddHabit} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Player Level */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <PlayerLevel stats={playerStats} showXPGain={xpGain} />
        </motion.div>

        {/* Hero Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <DashboardStats
            todayCompleted={todayStats.completed}
            todayTotal={todayStats.total}
            weeklyCompleted={weeklyStats.completed}
            weeklyTotal={weeklyStats.total}
            currentStreak={totalBestStreak}
            totalHabits={habits.length}
          />
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue="today" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4 mx-auto bg-secondary/50 border border-primary/20">
            <TabsTrigger value="today" className="gap-2 font-display text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <LayoutGrid className="h-4 w-4" />
              TODAY
            </TabsTrigger>
            <TabsTrigger value="week" className="gap-2 font-display text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Calendar className="h-4 w-4" />
              WEEK
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2 font-display text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="h-4 w-4" />
              STATS
            </TabsTrigger>
            <TabsTrigger value="achievements" className="gap-2 font-display text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Trophy className="h-4 w-4" />
              BADGES
            </TabsTrigger>
          </TabsList>

          {/* Today Tab */}
          <TabsContent value="today" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Today's Progress Ring */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-lg border border-primary/20 bg-card p-6 flex flex-col items-center justify-center shadow-system"
              >
                <h2 className="font-display text-lg font-semibold text-primary mb-4 text-glow">DAILY PROGRESS</h2>
                <ProgressRing progress={todayPercentage} size={140} strokeWidth={12} />
                <p className="mt-4 text-center text-muted-foreground">
                  {todayStats.completed === todayStats.total && todayStats.total > 0 ? (
                    <span className="flex items-center gap-2 text-success font-semibold">
                      <Flame className="h-4 w-4 animate-streak-pulse" />
                      QUEST COMPLETE!
                    </span>
                  ) : (
                    <span className="uppercase tracking-wide">{todayStats.total - todayStats.completed} quests remaining</span>
                  )}
                </p>
              </motion.div>

              {/* Today's Habits */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold text-primary text-glow">ACTIVE QUESTS</h2>
                  <span className="text-sm text-muted-foreground uppercase tracking-wide">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <AnimatePresence mode="popLayout">
                  {todayHabits.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="rounded-lg border-2 border-dashed border-primary/30 p-8 text-center"
                    >
                      <Zap className="mx-auto h-12 w-12 text-primary/50" />
                      <h3 className="mt-4 font-display text-lg font-semibold text-primary">NO ACTIVE QUESTS</h3>
                      <p className="mt-2 text-muted-foreground">
                        Initialize your first quest to begin leveling up
                      </p>
                      <AddHabitDialog onAdd={addHabit}>
                        <Button variant="neon" className="mt-4">
                          Initialize First Quest
                        </Button>
                      </AddHabitDialog>
                    </motion.div>
                  ) : (
                    <div className="space-y-3">
                      {todayHabits.map((habit) => (
                        <div key={habit.id} className="relative group">
                          <HabitCard
                            habit={habit}
                            isCompleted={isCompleted(habit.id, today)}
                            streak={getStreak(habit.id)}
                            onToggle={() => handleQuestToggle(habit.id)}
                          />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover border-primary/20">
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => deleteHabit(habit.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Abandon Quest
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </TabsContent>

          {/* Week Tab */}
          <TabsContent value="week">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-primary/20 bg-card p-6 shadow-system"
            >
              <h2 className="font-display text-lg font-semibold text-primary mb-4 text-glow">WEEKLY OVERVIEW</h2>
              <WeeklyView
                habits={habits}
                isCompleted={isCompleted}
                onToggle={toggleHabitLog}
              />
            </motion.div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AnalyticsCharts habits={habits} />
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-primary/20 bg-card p-6 shadow-system"
            >
              <AchievementsPanel />
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Achievement Toast */}
      <AchievementToast 
        achievement={newAchievement} 
        onClose={() => setNewAchievement(null)} 
      />

      {/* Footer */}
      <footer className="border-t border-primary/20 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground font-display tracking-wider">
          LEVEL UP YOUR LIFE • ONE QUEST AT A TIME
        </div>
      </footer>
    </div>
  );
}