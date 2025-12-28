import { motion } from "framer-motion";
import { Shield, Crown, Star, Zap, Sword, Trophy, Flame, Award } from "lucide-react";
import { PlayerStats } from "@/types/habit";
import { getRankColor } from "@/lib/xp";

interface RankProgressionDisplayProps {
  stats: PlayerStats;
}

const RANKS = [
  { name: "E-Rank", levels: "1-10", minLevel: 1, maxLevel: 10, icon: Shield, description: "Novice Hunter" },
  { name: "D-Rank", levels: "11-20", minLevel: 11, maxLevel: 20, icon: Sword, description: "Apprentice Hunter" },
  { name: "C-Rank", levels: "21-35", minLevel: 21, maxLevel: 35, icon: Zap, description: "Skilled Hunter" },
  { name: "B-Rank", levels: "36-50", minLevel: 36, maxLevel: 50, icon: Flame, description: "Elite Hunter" },
  { name: "A-Rank", levels: "51-65", minLevel: 51, maxLevel: 65, icon: Star, description: "Master Hunter" },
  { name: "S-Rank", levels: "66-80", minLevel: 66, maxLevel: 80, icon: Trophy, description: "Legendary Hunter" },
  { name: "SS-Rank", levels: "81-95", minLevel: 81, maxLevel: 95, icon: Award, description: "Mythic Hunter" },
  { name: "National", levels: "96-100", minLevel: 96, maxLevel: 100, icon: Crown, description: "National Level Hunter" },
];

export function RankProgressionDisplay({ stats }: RankProgressionDisplayProps) {
  const currentLevel = stats.level;

  const getRankStatus = (rank: typeof RANKS[0]) => {
    if (currentLevel > rank.maxLevel) return "completed";
    if (currentLevel >= rank.minLevel && currentLevel <= rank.maxLevel) return "current";
    return "locked";
  };

  const getRankProgress = (rank: typeof RANKS[0]) => {
    if (currentLevel > rank.maxLevel) return 100;
    if (currentLevel < rank.minLevel) return 0;
    const levelsInRank = rank.maxLevel - rank.minLevel + 1;
    const levelsCompleted = currentLevel - rank.minLevel;
    return Math.round((levelsCompleted / levelsInRank) * 100);
  };

  return (
    <div className="bg-secondary/30 border border-primary/20 rounded-xl p-6 backdrop-blur-sm">
      <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-primary" />
        Rank Progression
      </h3>

      <div className="space-y-4">
        {RANKS.map((rank, index) => {
          const status = getRankStatus(rank);
          const progress = getRankProgress(rank);
          const Icon = rank.icon;
          const isActive = status === "current";
          const isCompleted = status === "completed";

          return (
            <motion.div
              key={rank.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative flex items-center gap-4 p-4 rounded-lg border transition-all duration-300 ${
                isActive
                  ? "bg-primary/20 border-primary shadow-[0_0_20px_hsla(215,100%,55%,0.3)]"
                  : isCompleted
                  ? "bg-accent/10 border-accent/30"
                  : "bg-secondary/20 border-primary/10 opacity-50"
              }`}
            >
              {/* Rank Icon */}
              <div
                className={`relative flex items-center justify-center w-12 h-12 rounded-full ${
                  isActive
                    ? "bg-primary/30"
                    : isCompleted
                    ? "bg-accent/20"
                    : "bg-secondary/30"
                }`}
              >
                <Icon
                  className={`w-6 h-6 ${
                    isActive
                      ? "text-primary"
                      : isCompleted
                      ? "text-accent"
                      : "text-muted-foreground"
                  }`}
                />
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-primary"
                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </div>

              {/* Rank Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="font-bold text-lg"
                      style={{ color: isActive || isCompleted ? getRankColor(rank.name) : undefined }}
                    >
                      {rank.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Lv. {rank.levels}
                    </span>
                  </div>
                  {isCompleted && (
                    <span className="text-xs text-accent font-medium px-2 py-0.5 bg-accent/20 rounded-full">
                      ✓ Achieved
                    </span>
                  )}
                  {isActive && (
                    <span className="text-xs text-primary font-medium px-2 py-0.5 bg-primary/20 rounded-full animate-pulse">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{rank.description}</p>

                {/* Progress Bar */}
                <div className="relative h-2 bg-secondary/50 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      background: isActive
                        ? "linear-gradient(90deg, hsl(215 100% 55%), hsl(175 90% 45%))"
                        : isCompleted
                        ? "hsl(var(--accent))"
                        : "hsl(var(--muted))",
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  />
                  {isActive && (
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full bg-white/20"
                      animate={{ width: [`${progress}%`, `${progress + 5}%`, `${progress}%`] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </div>
                {isActive && (
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-muted-foreground">Level {currentLevel}</span>
                    <span className="text-xs text-primary font-medium">{progress}%</span>
                  </div>
                )}
              </div>

              {/* Connector Line */}
              {index < RANKS.length - 1 && (
                <div
                  className={`absolute left-10 top-full w-0.5 h-4 -translate-x-1/2 ${
                    isCompleted ? "bg-accent/50" : "bg-primary/20"
                  }`}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current Progress</p>
            <p className="text-lg font-bold" style={{ color: getRankColor(stats.rank) }}>
              {stats.rank}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Level</p>
            <p className="text-2xl font-bold text-primary">{currentLevel}/100</p>
          </div>
        </div>
        <div className="mt-3 h-3 bg-secondary/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, hsl(215 100% 55%), hsl(280 100% 65%), hsl(45 100% 50%))",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${currentLevel}%` }}
            transition={{ duration: 1.5 }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {100 - currentLevel} levels to National Level Hunter
        </p>
      </div>
    </div>
  );
}