import { motion } from "framer-motion";
import { Crown, Star, Flame, Target, Zap, Gift, Check, Lock, Calendar } from "lucide-react";
import { Habit, HabitLog } from "@/types/habit";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface MonthlyChallengesProps {
  habits: Habit[];
  logs: HabitLog[];
  onClaimChallenge: (challengeId: string, xpReward: number) => void;
  claimedChallenges: string[];
  remainingDailyXP: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: typeof Crown;
  xpReward: number;
  target: number;
  color: string;
  getProgress: (habits: Habit[], logs: HabitLog[], month: string) => number;
}

// Get current month string (YYYY-MM)
function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

// Get all dates in current month up to today
function getMonthDates(): string[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const dates: string[] = [];
  
  for (let day = 1; day <= now.getDate(); day++) {
    const date = new Date(year, month, day);
    dates.push(date.toISOString().split("T")[0]);
  }
  
  return dates;
}

// Calculate streak for the month
function calculateMonthStreak(habits: Habit[], logs: HabitLog[]): number {
  const monthDates = getMonthDates();
  let streak = 0;
  
  for (let i = monthDates.length - 1; i >= 0; i--) {
    const dateStr = monthDates[i];
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    
    const habitsForDay = habits.filter(h => h.targetDays.includes(dayOfWeek));
    if (habitsForDay.length === 0) continue;
    
    const completedAll = habitsForDay.every(h => 
      logs.some(l => l.habitId === h.id && l.date === dateStr && l.completed)
    );
    
    if (completedAll) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

// Count perfect days in month
function countPerfectDays(habits: Habit[], logs: HabitLog[]): number {
  const monthDates = getMonthDates();
  let perfectDays = 0;
  
  for (const dateStr of monthDates) {
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    
    const habitsForDay = habits.filter(h => h.targetDays.includes(dayOfWeek));
    if (habitsForDay.length === 0) continue;
    
    const completedAll = habitsForDay.every(h => 
      logs.some(l => l.habitId === h.id && l.date === dateStr && l.completed)
    );
    
    if (completedAll) {
      perfectDays++;
    }
  }
  
  return perfectDays;
}

// Count total completions in month
function countMonthCompletions(logs: HabitLog[]): number {
  const currentMonth = getCurrentMonth();
  return logs.filter(l => l.date.startsWith(currentMonth) && l.completed).length;
}

// Monthly challenges - balanced for 4-year journey to max level
const MONTHLY_CHALLENGES: Challenge[] = [
  {
    id: "monthly-warrior",
    title: "Monthly Warrior",
    description: "Complete 50 habit tasks this month",
    icon: Zap,
    xpReward: 50,    // Was 150
    target: 50,
    color: "hsl(215 100% 55%)",
    getProgress: (_, logs) => countMonthCompletions(logs),
  },
  {
    id: "perfect-week",
    title: "Perfect Week",
    description: "Achieve 7 perfect days this month",
    icon: Star,
    xpReward: 75,    // Was 200
    target: 7,
    color: "hsl(45 100% 50%)",
    getProgress: (habits, logs) => countPerfectDays(habits, logs),
  },
  {
    id: "streak-master",
    title: "Streak Master",
    description: "Maintain a 14-day streak this month",
    icon: Flame,
    xpReward: 100,   // Was 250
    target: 14,
    color: "hsl(16 85% 58%)",
    getProgress: (habits, logs) => calculateMonthStreak(habits, logs),
  },
  {
    id: "habit-centurion",
    title: "Habit Centurion",
    description: "Complete 100 habit tasks this month",
    icon: Crown,
    xpReward: 150,   // Was 300
    target: 100,
    color: "hsl(280 100% 65%)",
    getProgress: (_, logs) => countMonthCompletions(logs),
  },
  {
    id: "perfect-month",
    title: "Perfect Month",
    description: "Achieve 20 perfect days this month",
    icon: Target,
    xpReward: 250,   // Was 500
    target: 20,
    color: "hsl(175 90% 45%)",
    getProgress: (habits, logs) => countPerfectDays(habits, logs),
  },
];

export function MonthlyChallenges({
  habits,
  logs,
  onClaimChallenge,
  claimedChallenges,
  remainingDailyXP,
}: MonthlyChallengesProps) {
  const currentMonth = getCurrentMonth();
  const monthName = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const challengeProgress = useMemo(() => {
    return MONTHLY_CHALLENGES.map(challenge => ({
      ...challenge,
      progress: challenge.getProgress(habits, logs, currentMonth),
    }));
  }, [habits, logs, currentMonth]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Crown className="w-5 h-5 text-accent" />
          Monthly Challenges
        </h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          {monthName}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {challengeProgress.map((challenge, index) => {
          const isComplete = challenge.progress >= challenge.target;
          const isClaimed = claimedChallenges.includes(`${challenge.id}-${currentMonth}`);
          const canClaim = isComplete && !isClaimed && remainingDailyXP > 0;
          const progressPercent = Math.min(100, (challenge.progress / challenge.target) * 100);
          const Icon = challenge.icon;

          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative overflow-hidden rounded-xl border p-4 transition-all",
                isComplete
                  ? "bg-gradient-to-br from-accent/10 to-primary/10 border-accent/30 shadow-[0_0_20px_hsla(175,90%,45%,0.15)]"
                  : "bg-secondary/30 border-primary/20"
              )}
            >
              {/* Background glow */}
              {isComplete && (
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{
                    background: `radial-gradient(ellipse at 30% 30%, ${challenge.color} 0%, transparent 70%)`,
                  }}
                />
              )}

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg",
                        isComplete ? "bg-accent/20" : "bg-primary/20"
                      )}
                      style={{ 
                        boxShadow: isComplete ? `0 0 15px ${challenge.color}40` : undefined 
                      }}
                    >
                      <Icon 
                        className="h-5 w-5" 
                        style={{ color: isComplete ? challenge.color : "hsl(var(--primary))" }}
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-sm">{challenge.title}</h4>
                      <p className="text-xs text-muted-foreground">{challenge.description}</p>
                    </div>
                  </div>
                </div>

                {/* Reward */}
                <div className="flex items-center gap-1 mb-3">
                  <Gift className="h-4 w-4 text-accent" />
                  <span className="text-sm font-bold text-accent">+{challenge.xpReward} XP</span>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className={cn(
                      "font-mono font-bold",
                      isComplete ? "text-accent" : "text-foreground"
                    )}>
                      {challenge.progress}/{challenge.target}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary/50">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className="h-full rounded-full"
                      style={{
                        background: isComplete
                          ? challenge.color
                          : `linear-gradient(90deg, hsl(var(--primary)), ${challenge.color})`,
                      }}
                    />
                  </div>
                </div>

                {/* Claim Button */}
                {isComplete && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: canClaim ? 1.02 : 1 }}
                    whileTap={{ scale: canClaim ? 0.98 : 1 }}
                    onClick={() => canClaim && onClaimChallenge(`${challenge.id}-${currentMonth}`, challenge.xpReward)}
                    disabled={!canClaim}
                    className={cn(
                      "mt-3 w-full py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all",
                      isClaimed
                        ? "bg-accent/20 text-accent cursor-default"
                        : canClaim
                        ? "bg-accent text-accent-foreground hover:shadow-[0_0_15px_hsla(175,90%,45%,0.4)]"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    )}
                  >
                    {isClaimed ? (
                      <>
                        <Check className="h-3 w-3" />
                        Claimed!
                      </>
                    ) : remainingDailyXP <= 0 ? (
                      <>
                        <Lock className="h-3 w-3" />
                        XP Cap
                      </>
                    ) : (
                      <>
                        <Gift className="h-3 w-3" />
                        Claim
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Info */}
      <p className="text-xs text-muted-foreground text-center">
        Monthly challenges reset at the start of each month. Complete them for massive XP bonuses!
      </p>
    </div>
  );
}