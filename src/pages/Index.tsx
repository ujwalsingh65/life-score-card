import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Zap, LayoutGrid, Calendar, Trash2, MoreVertical, BarChart3, Trophy, LogOut, Loader2, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { HabitCard } from "@/components/HabitCard";
import { AddHabitDialog } from "@/components/AddHabitDialog";
import { WeeklyView } from "@/components/WeeklyView";
import { DashboardStats } from "@/components/DashboardStats";
import { ProgressRing } from "@/components/ProgressRing";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { PlayerLevel } from "@/components/PlayerLevel";
import { AchievementsPanel } from "@/components/AchievementsPanel";
import { RankProgressionDisplay } from "@/components/RankProgressionDisplay";
import { QuestChallenges, QUEST_REWARDS } from "@/components/QuestChallenges";
import { AchievementToast } from "@/components/AchievementToast";
import { LevelUpOverlay } from "@/components/LevelUpOverlay";
import { NotificationToggle } from "@/components/NotificationToggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculatePlayerStats, calculateCompletionXP } from "@/lib/xp";
import { ACHIEVEMENTS, Achievement } from "@/lib/achievements";
import { PlayerStats } from "@/types/habit";

export default function Index() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const {
    habits,
    logs,
    totalXP,
    dailyXPEarned,
    dailyXPCap,
    unlockedAchievements,
    loading: dataLoading,
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
    getRemainingDailyXP,
  } = useSupabaseData();

  const { playQuestComplete, playLevelUp, playAchievement, playXPGain } = useSoundEffects();

  const [playerStats, setPlayerStats] = useState<PlayerStats>(() => 
    calculatePlayerStats(totalXP)
  );
  const [xpGain, setXpGain] = useState(0);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState({ level: 1, rank: "E-Rank Hunter" });
  const [dailyQuestClaimed, setDailyQuestClaimed] = useState(false);
  const [weeklyQuestClaimed, setWeeklyQuestClaimed] = useState(false);

  // Reset quest claims at midnight
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const storedDate = localStorage.getItem("quest-claim-date");
    if (storedDate !== today) {
      setDailyQuestClaimed(false);
      localStorage.setItem("quest-claim-date", today);
    } else {
      setDailyQuestClaimed(localStorage.getItem("daily-quest-claimed") === "true");
    }
    
    // Check weekly reset (Sunday)
    const currentWeek = getWeekNumber(new Date());
    const storedWeek = localStorage.getItem("quest-claim-week");
    if (storedWeek !== currentWeek.toString()) {
      setWeeklyQuestClaimed(false);
      localStorage.setItem("quest-claim-week", currentWeek.toString());
    } else {
      setWeeklyQuestClaimed(localStorage.getItem("weekly-quest-claimed") === "true");
    }
  }, []);

  function getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  // Update player stats when XP changes
  useEffect(() => {
    setPlayerStats(calculatePlayerStats(totalXP));
  }, [totalXP]);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const today = new Date().toISOString().split("T")[0];
  const todayHabits = getTodayHabits();
  const todayStats = getTodayStats();

  // Calculate weekly stats
  const weeklyStats = useMemo(() => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    
    let total = 0;
    let completed = 0;
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      const dayOfWeek = date.getDay();
      
      habits.forEach(habit => {
        if (habit.targetDays.includes(dayOfWeek)) {
          total++;
          if (isCompleted(habit.id, dateStr)) {
            completed++;
          }
        }
      });
    }
    
    return { completed, total };
  }, [habits, isCompleted]);

  const totalBestStreak = useMemo(() => {
    return habits.reduce((max, h) => Math.max(max, getBestStreak(h.id)), 0);
  }, [habits, getBestStreak]);

  const todayPercentage = todayStats.total > 0 
    ? (todayStats.completed / todayStats.total) * 100 
    : 0;

  // Check and unlock achievements
  const checkAchievements = async () => {
    const maxStreak = habits.reduce((max, h) => Math.max(max, getBestStreak(h.id)), 0);
    const totalCompletions = logs.filter(l => l.completed).length;
    const habitsCount = habits.length;
    
    // Calculate perfect days
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
      const habitsForDay = habits.filter((h) => h.targetDays.includes(dayOfWeek));
      if (habitsForDay.length > 0 && habitsForDay.every((h) => completedHabitIds.has(h.id))) {
        perfectDays++;
      }
    });

    for (const achievement of ACHIEVEMENTS) {
      if (unlockedAchievements.includes(achievement.id)) continue;

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

      if (shouldUnlock) {
        const unlocked = await unlockAchievement(achievement.id);
        if (unlocked) {
          setNewAchievement(achievement);
          playAchievement();
          return; // Only show one at a time
        }
      }
    }
  };

  // Handle quest completion with XP, achievements, and sounds
  const handleQuestToggle = async (habitId: string) => {
    const wasCompleted = isCompleted(habitId, today);
    const completed = await toggleHabitLog(habitId, today);
    
    // Only grant XP when completing, not uncompleting
    if (completed && !wasCompleted) {
      const previousLevel = playerStats.level;
      const streak = getStreak(habitId);
      const willBePerfect = todayStats.completed + 1 === todayStats.total;
      const earned = calculateCompletionXP(streak, willBePerfect);
      
      const { xpGained, cappedOut } = await updateXP(earned);
      
      if (xpGained > 0) {
        const newStats = calculatePlayerStats(totalXP + xpGained);
        setPlayerStats(newStats);
        setXpGain(xpGained);
        
        // Play quest complete sound
        playQuestComplete();
        
        // Check for level up
        if (newStats.level > previousLevel) {
          setTimeout(() => {
            setLevelUpData({ level: newStats.level, rank: newStats.rank });
            setShowLevelUp(true);
            playLevelUp();
          }, 300);
        }
        
        // Clear XP popup after animation
        setTimeout(() => setXpGain(0), 2000);
        
        // Check for new achievements
        setTimeout(() => checkAchievements(), 500);
      } else if (cappedOut) {
        // Show that daily XP cap was reached
        playQuestComplete();
      }
    }
  };
  
  // Check achievements on habit creation
  const handleAddHabit = async (habit: Parameters<typeof addHabit>[0]) => {
    await addHabit(habit);
    playXPGain();
    setTimeout(() => checkAchievements(), 300);
  };

  // Claim daily quest reward
  const handleClaimDailyQuest = async () => {
    if (dailyQuestClaimed) return;
    
    const previousLevel = playerStats.level;
    const { xpGained } = await updateXP(QUEST_REWARDS.DAILY_COMPLETE);
    
    if (xpGained > 0) {
      setDailyQuestClaimed(true);
      localStorage.setItem("daily-quest-claimed", "true");
      
      const newStats = calculatePlayerStats(totalXP + xpGained);
      setPlayerStats(newStats);
      setXpGain(xpGained);
      playAchievement();
      
      if (newStats.level > previousLevel) {
        setTimeout(() => {
          setLevelUpData({ level: newStats.level, rank: newStats.rank });
          setShowLevelUp(true);
          playLevelUp();
        }, 300);
      }
      
      setTimeout(() => setXpGain(0), 2000);
    }
  };

  // Claim weekly quest reward
  const handleClaimWeeklyQuest = async () => {
    if (weeklyQuestClaimed) return;
    
    const previousLevel = playerStats.level;
    const { xpGained } = await updateXP(QUEST_REWARDS.WEEKLY_COMPLETE);
    
    if (xpGained > 0) {
      setWeeklyQuestClaimed(true);
      localStorage.setItem("weekly-quest-claimed", "true");
      
      const newStats = calculatePlayerStats(totalXP + xpGained);
      setPlayerStats(newStats);
      setXpGain(xpGained);
      playAchievement();
      
      if (newStats.level > previousLevel) {
        setTimeout(() => {
          setLevelUpData({ level: newStats.level, rank: newStats.rank });
          setShowLevelUp(true);
          playLevelUp();
        }, 300);
      }
      
      setTimeout(() => setXpGain(0), 2000);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
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
            <div className="flex items-center gap-2">
              <AddHabitDialog onAdd={handleAddHabit} />
              <NotificationToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/profile")}
                className="text-muted-foreground hover:text-foreground"
              >
                <User className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
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
          <PlayerLevel stats={playerStats} showXPGain={xpGain} dailyXPEarned={dailyXPEarned} dailyXPCap={dailyXPCap} />
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
                      <AddHabitDialog onAdd={handleAddHabit}>
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

            {/* Quest Challenges */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-lg border border-primary/20 bg-card p-6 shadow-system"
            >
              <QuestChallenges
                habits={habits}
                todayCompleted={todayStats.completed}
                todayTotal={todayStats.total}
                weeklyCompleted={weeklyStats.completed}
                weeklyTotal={weeklyStats.total}
                onClaimDaily={handleClaimDailyQuest}
                onClaimWeekly={handleClaimWeeklyQuest}
                dailyClaimed={dailyQuestClaimed}
                weeklyClaimed={weeklyQuestClaimed}
                remainingDailyXP={getRemainingDailyXP()}
              />
            </motion.div>
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
              />
            </motion.div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="space-y-6">
              <AnalyticsCharts habits={habits} logs={logs} />
              <RankProgressionDisplay stats={playerStats} />
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-primary/20 bg-card p-6 shadow-system"
            >
              <AchievementsPanel unlockedAchievementIds={unlockedAchievements} />
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Level Up Overlay */}
      <LevelUpOverlay
        show={showLevelUp}
        level={levelUpData.level}
        rank={levelUpData.rank}
        onComplete={() => setShowLevelUp(false)}
      />

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
