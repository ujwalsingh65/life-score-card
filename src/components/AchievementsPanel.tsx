import { ACHIEVEMENTS, Achievement, getRarityColor } from "@/lib/achievements";
import { AchievementBadge } from "./AchievementBadge";
import { motion } from "framer-motion";
import { Trophy, Flame, Target, Calendar, ScrollText } from "lucide-react";

interface AchievementsPanelProps {
  unlockedAchievementIds?: string[];
  stats?: {
    maxStreak: number;
    totalCompletions: number;
    perfectDays: number;
    habitsCreated: number;
  };
}

export function AchievementsPanel({ 
  unlockedAchievementIds = [],
  stats = { maxStreak: 0, totalCompletions: 0, perfectDays: 0, habitsCreated: 0 }
}: AchievementsPanelProps) {
  const unlockedCount = unlockedAchievementIds.length;
  const totalCount = ACHIEVEMENTS.length;

  const groupedAchievements = {
    streak: ACHIEVEMENTS.filter((a) => a.type === "streak"),
    perfect_days: ACHIEVEMENTS.filter((a) => a.type === "perfect_days"),
    total_completions: ACHIEVEMENTS.filter((a) => a.type === "total_completions"),
    habits_created: ACHIEVEMENTS.filter((a) => a.type === "habits_created"),
  };

  const categories = [
    { key: "streak", label: "Streak Achievements", icon: Flame, stat: stats.maxStreak, statLabel: "Max Streak" },
    { key: "perfect_days", label: "Perfect Days", icon: Calendar, stat: stats.perfectDays, statLabel: "Perfect Days" },
    { key: "total_completions", label: "Quest Completions", icon: Target, stat: stats.totalCompletions, statLabel: "Total Completed" },
    { key: "habits_created", label: "Quest Collection", icon: ScrollText, stat: stats.habitsCreated, statLabel: "Quests Created" },
  ];

  const isUnlocked = (achievementId: string) => unlockedAchievementIds.includes(achievementId);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-4 rounded-xl bg-gradient-card border border-primary/20"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/20">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Achievements Unlocked</p>
            <p className="text-2xl font-bold text-foreground">
              {unlockedCount} <span className="text-muted-foreground text-lg">/ {totalCount}</span>
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Completion</p>
          <p className="text-2xl font-bold text-primary">
            {totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0}%
          </p>
        </div>
      </motion.div>

      {/* Achievement Categories */}
      {categories.map((category, categoryIndex) => (
        <motion.div
          key={category.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: categoryIndex * 0.1 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <category.icon className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">{category.label}</h3>
            </div>
            <span className="text-sm text-muted-foreground">
              {category.statLabel}: <span className="text-primary font-medium">{category.stat}</span>
            </span>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {groupedAchievements[category.key as keyof typeof groupedAchievements].map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: categoryIndex * 0.1 + index * 0.05 }}
                className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-muted/10 transition-colors"
              >
                <AchievementBadge 
                  achievement={achievement} 
                  size="md" 
                  unlocked={isUnlocked(achievement.id)}
                />
                <div className="text-center">
                  <p className="text-xs font-medium text-foreground truncate max-w-[80px]">
                    {achievement.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {achievement.requirement}+ {category.key === "streak" ? "days" : ""}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Rarity Legend */}
      <div className="flex items-center justify-center gap-4 pt-4 border-t border-border/30">
        {(["common", "rare", "epic", "legendary"] as const).map((rarity) => (
          <div key={rarity} className="flex items-center gap-1.5">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getRarityColor(rarity) }}
            />
            <span className="text-xs text-muted-foreground capitalize">{rarity}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
