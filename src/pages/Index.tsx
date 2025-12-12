import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Sparkles, LayoutGrid, Calendar, Trash2, MoreVertical } from "lucide-react";
import { useHabits } from "@/hooks/useHabits";
import { HabitCard } from "@/components/HabitCard";
import { AddHabitDialog } from "@/components/AddHabitDialog";
import { WeeklyView } from "@/components/WeeklyView";
import { DashboardStats } from "@/components/DashboardStats";
import { ProgressRing } from "@/components/ProgressRing";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, getWeeklyStats } from "@/lib/habits";

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
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-warm">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Habit Monitor</h1>
                <p className="text-xs text-muted-foreground">Track. Grow. Succeed.</p>
              </div>
            </div>
            <AddHabitDialog onAdd={addHabit} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
          <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto">
            <TabsTrigger value="today" className="gap-2">
              <LayoutGrid className="h-4 w-4" />
              Today
            </TabsTrigger>
            <TabsTrigger value="week" className="gap-2">
              <Calendar className="h-4 w-4" />
              This Week
            </TabsTrigger>
          </TabsList>

          {/* Today Tab */}
          <TabsContent value="today" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Today's Progress Ring */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border bg-card p-6 flex flex-col items-center justify-center shadow-soft"
              >
                <h2 className="text-lg font-semibold mb-4">Today's Progress</h2>
                <ProgressRing progress={todayPercentage} size={140} strokeWidth={12} />
                <p className="mt-4 text-center text-muted-foreground">
                  {todayStats.completed === todayStats.total && todayStats.total > 0 ? (
                    <span className="flex items-center gap-2 text-success font-medium">
                      <Flame className="h-4 w-4 animate-streak-pulse" />
                      All habits completed!
                    </span>
                  ) : (
                    `${todayStats.total - todayStats.completed} habits remaining`
                  )}
                </p>
              </motion.div>

              {/* Today's Habits */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Today's Habits</h2>
                  <span className="text-sm text-muted-foreground">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
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
                      className="rounded-xl border-2 border-dashed border-muted p-8 text-center"
                    >
                      <Sparkles className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <h3 className="mt-4 text-lg font-semibold">No habits for today</h3>
                      <p className="mt-2 text-muted-foreground">
                        Create your first habit to start building better routines
                      </p>
                      <AddHabitDialog onAdd={addHabit}>
                        <Button variant="warm" className="mt-4">
                          Create First Habit
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
                            onToggle={() => toggleHabitLog(habit.id, today)}
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
                            <DropdownMenuContent align="end" className="bg-popover">
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => deleteHabit(habit.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Habit
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
              className="rounded-2xl border bg-card p-6 shadow-soft"
            >
              <h2 className="text-lg font-semibold mb-4">Weekly Overview</h2>
              <WeeklyView
                habits={habits}
                isCompleted={isCompleted}
                onToggle={toggleHabitLog}
              />
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* All Habits (when none today) */}
        {todayHabits.length === 0 && habits.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <h2 className="text-lg font-semibold mb-4">All Habits</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {habits.map((habit) => (
                <div key={habit.id} className="relative group">
                  <HabitCard
                    habit={habit}
                    isCompleted={false}
                    streak={getStreak(habit.id)}
                    onToggle={() => {}}
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
                    <DropdownMenuContent align="end" className="bg-popover">
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => deleteHabit(habit.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Habit
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Build better habits, one day at a time
        </div>
      </footer>
    </div>
  );
}
