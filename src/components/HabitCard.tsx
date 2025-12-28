import { motion } from "framer-motion";
import { Flame, Check } from "lucide-react";
import { Habit, CATEGORY_CONFIG } from "@/types/habit";
import { cn } from "@/lib/utils";

interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  streak: number;
  onToggle: () => void;
  onEdit?: () => void;
}

export function HabitCard({
  habit,
  isCompleted,
  streak,
  onToggle,
  onEdit,
}: HabitCardProps) {
  const category = CATEGORY_CONFIG[habit.category];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group relative rounded-xl border bg-card p-4 transition-all duration-200",
        "hover:shadow-card hover:border-primary/40 cursor-pointer",
        isCompleted 
          ? "border-accent/50 bg-accent/5 shadow-[0_0_20px_hsla(175,90%,45%,0.1)]" 
          : "border-primary/20"
      )}
      onClick={onToggle}
    >
      <div className="flex items-start gap-4">
        {/* Completion checkbox */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className={cn(
            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-200",
            isCompleted
              ? "border-accent bg-accent shadow-[0_0_10px_hsla(175,90%,45%,0.5)]"
              : "border-primary/40 hover:border-primary hover:shadow-[0_0_10px_hsla(215,100%,55%,0.3)]"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          {isCompleted && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="animate-check-bounce"
            >
              <Check className="h-4 w-4 text-accent-foreground" />
            </motion.div>
          )}
        </motion.button>

        {/* Habit info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">{habit.icon}</span>
            <h3
              className={cn(
                "font-semibold text-card-foreground transition-all",
                isCompleted && "line-through opacity-60"
              )}
            >
              {habit.name}
            </h3>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border"
              style={{
                backgroundColor: `hsla(215, 100%, 55%, 0.1)`,
                borderColor: `hsla(215, 100%, 55%, 0.3)`,
                color: "hsl(215, 100%, 60%)",
              }}
            >
              {category.icon} {category.label}
            </span>
          </div>
        </div>

        {/* Streak indicator */}
        {streak > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/30 px-3 py-1.5 shadow-[0_0_10px_hsla(215,100%,55%,0.2)]">
            <Flame
              className={cn(
                "h-4 w-4 text-primary",
                streak >= 7 && "animate-streak-pulse"
              )}
              style={{ filter: "drop-shadow(0 0 4px hsl(215 100% 55%))" }}
            />
            <span className="text-sm font-bold text-primary">{streak}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
