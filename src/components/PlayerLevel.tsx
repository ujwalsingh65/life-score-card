import { motion, AnimatePresence } from "framer-motion";
import { Zap, Shield, TrendingUp, Battery, Clock, Target } from "lucide-react";
import { PlayerStats, LEVEL_CONFIG } from "@/types/habit";
import { getRankColor } from "@/lib/xp";
import { cn } from "@/lib/utils";

interface PlayerLevelProps {
  stats: PlayerStats;
  showXPGain?: number;
  dailyXPEarned?: number;
  dailyXPCap?: number;
}

// Calculate estimated time to max level
function calculateTimeToMax(totalXP: number, dailyXPCap: number): { days: number; months: number; years: number; formatted: string } {
  const maxXP = LEVEL_CONFIG[LEVEL_CONFIG.length - 1].xpRequired;
  const remainingXP = Math.max(0, maxXP - totalXP);
  
  if (remainingXP === 0) {
    return { days: 0, months: 0, years: 0, formatted: "MAX LEVEL ACHIEVED" };
  }
  
  // Assume average daily XP is 90% of cap (realistic with consistent play)
  const avgDailyXP = dailyXPCap * 0.9;
  const daysRemaining = Math.ceil(remainingXP / avgDailyXP);
  
  const years = Math.floor(daysRemaining / 365);
  const months = Math.floor((daysRemaining % 365) / 30);
  const days = daysRemaining % 30;
  
  let formatted = "";
  if (years > 0) {
    formatted += `${years}y `;
  }
  if (months > 0 || years > 0) {
    formatted += `${months}m `;
  }
  formatted += `${days}d`;
  
  return { days: daysRemaining, months, years, formatted: formatted.trim() };
}

export function PlayerLevel({ stats, showXPGain, dailyXPEarned = 0, dailyXPCap = 70 }: PlayerLevelProps) {
  const progressPercent = stats.xpToNextLevel > 0 
    ? (stats.currentXP / stats.xpToNextLevel) * 100 
    : 100;
  const rankColor = getRankColor(stats.rank);
  const dailyXPPercent = (dailyXPEarned / dailyXPCap) * 100;
  const remainingDailyXP = Math.max(0, dailyXPCap - dailyXPEarned);
  
  const maxXP = LEVEL_CONFIG[LEVEL_CONFIG.length - 1].xpRequired;
  const overallProgress = (stats.totalXP / maxXP) * 100;
  const timeToMax = calculateTimeToMax(stats.totalXP, dailyXPCap);
  const isMaxLevel = stats.level >= 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-card p-6 shadow-system"
    >
      {/* Animated background glow */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(ellipse at 30% 50%, ${rankColor} 0%, transparent 60%)`,
        }}
      />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="flex h-14 w-14 items-center justify-center rounded-xl border-2 shadow-neon animate-pulse-glow"
              style={{ 
                borderColor: rankColor,
                boxShadow: `0 0 20px ${rankColor}40`,
              }}
            >
              <span className="text-2xl font-bold" style={{ color: rankColor }}>
                {stats.level}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Hunter Level</h3>
              <p 
                className="text-sm font-semibold"
                style={{ color: rankColor }}
              >
                {stats.rank}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-primary">
            <Zap className="h-5 w-5" />
            <span className="font-mono text-lg font-bold">{stats.totalXP.toLocaleString()} XP</span>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress to Level {stats.level + 1}</span>
            <span className="font-mono text-primary">
              {stats.currentXP} / {stats.xpToNextLevel} XP
            </span>
          </div>
          
          <div className="h-4 overflow-hidden rounded-full bg-muted/50 border border-primary/20">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full relative"
              style={{
                background: `linear-gradient(90deg, ${rankColor}, hsl(var(--primary)))`,
              }}
            >
              {/* Animated shimmer */}
              <div className="absolute inset-0 animate-shimmer" 
                style={{
                  background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
                  backgroundSize: "200% 100%",
                }}
              />
            </motion.div>
          </div>
        </div>

        {/* XP Gain Popup */}
        <AnimatePresence>
          {showXPGain && showXPGain > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-2 right-2 flex items-center gap-1 rounded-lg bg-primary px-3 py-1 text-primary-foreground font-bold shadow-neon"
            >
              <TrendingUp className="h-4 w-4" />
              +{showXPGain} XP
            </motion.div>
          )}
        </AnimatePresence>

        {/* Time to Max Level Tracker */}
        <div className="mt-4 p-3 rounded-lg bg-secondary/30 border border-accent/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-accent" />
              <span className="text-sm text-muted-foreground">Journey to National Level</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-accent" />
              <span className={cn(
                "text-sm font-mono font-bold",
                isMaxLevel ? "text-warning" : "text-accent"
              )}>
                {timeToMax.formatted}
              </span>
            </div>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted/50 border border-accent/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 1 }}
              className="h-full rounded-full bg-gradient-to-r from-accent via-primary to-warning"
              style={{
                boxShadow: "0 0 8px hsl(var(--accent))"
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{stats.totalXP.toLocaleString()} / {maxXP.toLocaleString()} XP</span>
            <span>{overallProgress.toFixed(1)}% complete</span>
          </div>
        </div>

        {/* Daily XP Cap Indicator */}
        <div className="mt-4 p-3 rounded-lg bg-secondary/30 border border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Battery className={cn("h-4 w-4", remainingDailyXP > 0 ? "text-accent" : "text-muted-foreground")} />
              <span className="text-sm text-muted-foreground">Daily XP</span>
            </div>
            <span className={cn("text-sm font-mono font-bold", remainingDailyXP > 0 ? "text-accent" : "text-muted-foreground")}>
              {remainingDailyXP}/{dailyXPCap} remaining
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted/50 border border-primary/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${dailyXPPercent}%` }}
              transition={{ duration: 0.5 }}
              className={cn(
                "h-full rounded-full",
                dailyXPPercent >= 100 
                  ? "bg-muted-foreground" 
                  : "bg-gradient-to-r from-accent to-primary"
              )}
            />
          </div>
          {remainingDailyXP === 0 && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Daily cap reached! Come back tomorrow.
            </p>
          )}
        </div>

        {/* Stats Row */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-primary">
              <Shield className="h-4 w-4" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Rank</p>
            <p className="text-sm font-semibold" style={{ color: rankColor }}>
              {stats.rank.split(" ")[0]}
            </p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-primary">{Math.round(progressPercent)}%</p>
            <p className="text-xs text-muted-foreground">To Next Level</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{stats.level}/100</p>
            <p className="text-xs text-muted-foreground">Level</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
