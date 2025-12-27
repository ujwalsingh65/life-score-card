import { Achievement, getRarityGlow } from "@/lib/achievements";
import { motion, AnimatePresence } from "framer-motion";

interface AchievementToastProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export function AchievementToast({ achievement, onClose }: AchievementToastProps) {
  if (!achievement) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.8 }}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50"
        onAnimationComplete={() => {
          setTimeout(onClose, 3000);
        }}
      >
        <motion.div
          className={`
            flex items-center gap-4 px-6 py-4 rounded-xl
            bg-gradient-card border-2 border-primary/50
            ${getRarityGlow(achievement.rarity)}
          `}
          animate={{
            boxShadow: [
              "0 0 20px hsl(var(--primary) / 0.3)",
              "0 0 40px hsl(var(--primary) / 0.5)",
              "0 0 20px hsl(var(--primary) / 0.3)",
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: 2 }}
            className="text-4xl"
          >
            {achievement.icon}
          </motion.div>
          
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-primary font-medium uppercase tracking-wider"
            >
              Achievement Unlocked!
            </motion.p>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg font-bold text-foreground"
            >
              {achievement.name}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm text-muted-foreground"
            >
              {achievement.description}
            </motion.p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
