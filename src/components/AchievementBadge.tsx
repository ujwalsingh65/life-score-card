import { Achievement, getRarityGlow } from "@/lib/achievements";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: "sm" | "md" | "lg";
  unlocked?: boolean;
}

export function AchievementBadge({ achievement, size = "md", unlocked = false }: AchievementBadgeProps) {
  const sizeClasses = {
    sm: "w-12 h-12 text-lg",
    md: "w-16 h-16 text-2xl",
    lg: "w-20 h-20 text-3xl",
  };
  
  const rarityBorder = {
    common: "border-muted-foreground/30",
    rare: "border-primary",
    epic: "border-[hsl(280_70%_60%)]",
    legendary: "border-[hsl(38_92%_50%)]",
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={unlocked ? { scale: 1.1, rotate: 5 } : undefined}
      className={`
        relative flex items-center justify-center rounded-xl border-2 
        ${sizeClasses[size]} 
        ${unlocked ? rarityBorder[achievement.rarity] : "border-muted/20"}
        ${unlocked ? getRarityGlow(achievement.rarity) : ""}
        ${unlocked ? "bg-gradient-card" : "bg-muted/10"}
        transition-all duration-300
      `}
    >
      {unlocked ? (
        <span className="drop-shadow-lg">{achievement.icon}</span>
      ) : (
        <Lock className="w-1/2 h-1/2 text-muted-foreground/30" />
      )}
      
      {unlocked && achievement.rarity === "legendary" && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-500/20 via-amber-400/20 to-yellow-500/20"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}
