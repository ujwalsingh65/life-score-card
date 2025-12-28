import { motion } from "framer-motion";
import { Target, Calendar, Flame, Gift, Check, Lock } from "lucide-react";
import { Habit } from "@/types/habit";
import { cn } from "@/lib/utils";

interface QuestChallengesProps {
  habits: Habit[];
  todayCompleted: number;
  todayTotal: number;
  weeklyCompleted: number;
  weeklyTotal: number;
  onClaimDaily?: () => void;
  onClaimWeekly?: () => void;
  dailyClaimed: boolean;
  weeklyClaimed: boolean;
  remainingDailyXP: number;
}

// Quest reward values - balanced for 4-year journey
export const QUEST_REWARDS = {
  DAILY_COMPLETE: 15,   // Was 20 - complete all daily habits
  WEEKLY_COMPLETE: 50,  // Was 100 - complete all weekly habits
} as const;

export function QuestChallenges({
  habits,
  todayCompleted,
  todayTotal,
  weeklyCompleted,
  weeklyTotal,
  onClaimDaily,
  onClaimWeekly,
  dailyClaimed,
  weeklyClaimed,
  remainingDailyXP,
}: QuestChallengesProps) {
  const dailyProgress = todayTotal > 0 ? (todayCompleted / todayTotal) * 100 : 0;
  const weeklyProgress = weeklyTotal > 0 ? (weeklyCompleted / weeklyTotal) * 100 : 0;
  
  const isDailyComplete = todayCompleted === todayTotal && todayTotal > 0;
  const isWeeklyComplete = weeklyCompleted === weeklyTotal && weeklyTotal > 0;

  const canClaimDaily = isDailyComplete && !dailyClaimed && remainingDailyXP > 0;
  const canClaimWeekly = isWeeklyComplete && !weeklyClaimed && remainingDailyXP > 0;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
        <Target className="w-5 h-5 text-primary" />
        Quest Challenges
      </h3>

      {/* Daily Quest */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn(
          "relative overflow-hidden rounded-xl border p-4 transition-all",
          isDailyComplete
            ? "bg-success/10 border-success/30 shadow-[0_0_15px_hsla(145,70%,45%,0.2)]"
            : "bg-secondary/30 border-primary/20"
        )}
      >
        {/* Background glow for completed */}
        {isDailyComplete && (
          <div className="absolute inset-0 bg-gradient-to-r from-success/10 to-transparent" />
        )}

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                isDailyComplete ? "bg-success/20" : "bg-primary/20"
              )}>
                <Flame className={cn(
                  "h-5 w-5",
                  isDailyComplete ? "text-success" : "text-primary"
                )} />
              </div>
              <div>
                <h4 className="font-bold text-foreground">Daily Quest</h4>
                <p className="text-sm text-muted-foreground">
                  Complete all habits today
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Gift className={cn(
                "h-4 w-4",
                isDailyComplete ? "text-success" : "text-primary"
              )} />
              <span className={cn(
                "font-bold",
                isDailyComplete ? "text-success" : "text-primary"
              )}>
                +{QUEST_REWARDS.DAILY_COMPLETE} XP
              </span>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className={cn(
                "font-mono font-bold",
                isDailyComplete ? "text-success" : "text-foreground"
              )}>
                {todayCompleted}/{todayTotal}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary/50">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${dailyProgress}%` }}
                transition={{ duration: 0.5 }}
                className={cn(
                  "h-full rounded-full",
                  isDailyComplete
                    ? "bg-success"
                    : "bg-gradient-to-r from-primary to-accent"
                )}
              />
            </div>
          </div>

          {/* Claim Button */}
          {isDailyComplete && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: canClaimDaily ? 1.02 : 1 }}
              whileTap={{ scale: canClaimDaily ? 0.98 : 1 }}
              onClick={canClaimDaily ? onClaimDaily : undefined}
              disabled={!canClaimDaily}
              className={cn(
                "mt-3 w-full py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all",
                dailyClaimed
                  ? "bg-success/20 text-success cursor-default"
                  : canClaimDaily
                  ? "bg-success text-success-foreground hover:shadow-[0_0_15px_hsla(145,70%,45%,0.4)]"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              {dailyClaimed ? (
                <>
                  <Check className="h-4 w-4" />
                  Claimed!
                </>
              ) : remainingDailyXP <= 0 ? (
                <>
                  <Lock className="h-4 w-4" />
                  Daily XP Cap Reached
                </>
              ) : (
                <>
                  <Gift className="h-4 w-4" />
                  Claim Reward
                </>
              )}
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Weekly Quest */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className={cn(
          "relative overflow-hidden rounded-xl border p-4 transition-all",
          isWeeklyComplete
            ? "bg-accent/10 border-accent/30 shadow-[0_0_15px_hsla(175,90%,45%,0.2)]"
            : "bg-secondary/30 border-primary/20"
        )}
      >
        {/* Background glow for completed */}
        {isWeeklyComplete && (
          <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent" />
        )}

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                isWeeklyComplete ? "bg-accent/20" : "bg-primary/20"
              )}>
                <Calendar className={cn(
                  "h-5 w-5",
                  isWeeklyComplete ? "text-accent" : "text-primary"
                )} />
              </div>
              <div>
                <h4 className="font-bold text-foreground">Weekly Quest</h4>
                <p className="text-sm text-muted-foreground">
                  Complete all habits this week
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Gift className={cn(
                "h-4 w-4",
                isWeeklyComplete ? "text-accent" : "text-primary"
              )} />
              <span className={cn(
                "font-bold",
                isWeeklyComplete ? "text-accent" : "text-primary"
              )}>
                +{QUEST_REWARDS.WEEKLY_COMPLETE} XP
              </span>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className={cn(
                "font-mono font-bold",
                isWeeklyComplete ? "text-accent" : "text-foreground"
              )}>
                {weeklyCompleted}/{weeklyTotal}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary/50">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${weeklyProgress}%` }}
                transition={{ duration: 0.5 }}
                className={cn(
                  "h-full rounded-full",
                  isWeeklyComplete
                    ? "bg-accent"
                    : "bg-gradient-to-r from-primary to-accent"
                )}
              />
            </div>
          </div>

          {/* Claim Button */}
          {isWeeklyComplete && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: canClaimWeekly ? 1.02 : 1 }}
              whileTap={{ scale: canClaimWeekly ? 0.98 : 1 }}
              onClick={canClaimWeekly ? onClaimWeekly : undefined}
              disabled={!canClaimWeekly}
              className={cn(
                "mt-3 w-full py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all",
                weeklyClaimed
                  ? "bg-accent/20 text-accent cursor-default"
                  : canClaimWeekly
                  ? "bg-accent text-accent-foreground hover:shadow-[0_0_15px_hsla(175,90%,45%,0.4)]"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              {weeklyClaimed ? (
                <>
                  <Check className="h-4 w-4" />
                  Claimed!
                </>
              ) : remainingDailyXP <= 0 ? (
                <>
                  <Lock className="h-4 w-4" />
                  Daily XP Cap Reached
                </>
              ) : (
                <>
                  <Gift className="h-4 w-4" />
                  Claim Reward
                </>
              )}
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Info text */}
      <p className="text-xs text-muted-foreground text-center">
        Quest rewards are subject to daily XP cap. Complete quests daily to maximize progress!
      </p>
    </div>
  );
}