import { motion, AnimatePresence } from "framer-motion";
import { getRankColor } from "@/lib/xp";

interface LevelUpOverlayProps {
  show: boolean;
  level: number;
  rank: string;
  onComplete: () => void;
}

export function LevelUpOverlay({ show, level, rank, onComplete }: LevelUpOverlayProps) {
  const rankColor = getRankColor(rank);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onAnimationComplete={() => {
            setTimeout(onComplete, 2500);
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          {/* Radial burst effect */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 3, 4], opacity: [1, 0.5, 0] }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute w-48 h-48 rounded-full"
            style={{
              background: `radial-gradient(circle, ${rankColor} 0%, transparent 70%)`,
            }}
          />

          {/* Rotating ring */}
          <motion.div
            initial={{ scale: 0, rotate: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1.2, 1], 
              rotate: [0, 180, 360],
              opacity: [0, 1, 1]
            }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute w-64 h-64 rounded-full border-4"
            style={{ borderColor: rankColor }}
          />

          {/* Inner glow ring */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1], opacity: [0, 0.6] }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="absolute w-48 h-48 rounded-full"
            style={{
              boxShadow: `0 0 60px 20px ${rankColor}`,
            }}
          />

          {/* Particle effects */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: 0, 
                y: 0, 
                scale: 0, 
                opacity: 1 
              }}
              animate={{ 
                x: Math.cos((i * 30 * Math.PI) / 180) * 150,
                y: Math.sin((i * 30 * Math.PI) / 180) * 150,
                scale: [0, 1.5, 0],
                opacity: [1, 1, 0],
              }}
              transition={{ 
                duration: 1.2, 
                delay: 0.3,
                ease: "easeOut" 
              }}
              className="absolute w-4 h-4 rounded-full"
              style={{ backgroundColor: rankColor }}
            />
          ))}

          {/* Main content */}
          <motion.div
            initial={{ scale: 0, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 20,
              delay: 0.2 
            }}
            className="relative z-10 text-center"
          >
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl font-display uppercase tracking-[0.3em] text-primary mb-2"
            >
              Level Up!
            </motion.p>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="relative"
            >
              <motion.span
                animate={{ 
                  textShadow: [
                    `0 0 20px ${rankColor}`,
                    `0 0 60px ${rankColor}`,
                    `0 0 20px ${rankColor}`,
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-8xl font-bold font-display"
                style={{ color: rankColor }}
              >
                {level}
              </motion.span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-2xl font-display mt-4"
              style={{ color: rankColor }}
            >
              {rank}
            </motion.p>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="h-1 w-48 mx-auto mt-6 rounded-full"
              style={{ backgroundColor: rankColor }}
            />
          </motion.div>

          {/* Floating particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={`float-${i}`}
              initial={{ 
                x: (Math.random() - 0.5) * 400,
                y: 200,
                opacity: 0,
                scale: Math.random() * 0.5 + 0.5,
              }}
              animate={{ 
                y: -200,
                opacity: [0, 1, 0],
              }}
              transition={{ 
                duration: 2 + Math.random(),
                delay: Math.random() * 0.5,
                repeat: 1,
              }}
              className="absolute w-2 h-2 rounded-full"
              style={{ 
                backgroundColor: i % 2 === 0 ? rankColor : "hsl(var(--primary))",
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
