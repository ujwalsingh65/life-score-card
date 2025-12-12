import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Habit, DAYS_OF_WEEK } from "@/types/habit";
import { getWeekDates, formatDate } from "@/lib/habits";
import { cn } from "@/lib/utils";

interface WeeklyViewProps {
  habits: Habit[];
  isCompleted: (habitId: string, date: string) => boolean;
  onToggle: (habitId: string, date: string) => void;
}

export function WeeklyView({ habits, isCompleted, onToggle }: WeeklyViewProps) {
  const weekDates = getWeekDates();
  const today = formatDate(new Date());

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Header */}
        <div className="grid grid-cols-8 gap-2 mb-3">
          <div className="text-sm font-medium text-muted-foreground">Habit</div>
          {weekDates.map((date, i) => {
            const dateStr = formatDate(date);
            const isToday = dateStr === today;
            return (
              <div
                key={dateStr}
                className={cn(
                  "text-center text-sm",
                  isToday ? "font-bold text-primary" : "font-medium text-muted-foreground"
                )}
              >
                <div>{DAYS_OF_WEEK[i]}</div>
                <div
                  className={cn(
                    "mx-auto mt-1 flex h-7 w-7 items-center justify-center rounded-full text-xs",
                    isToday && "bg-primary text-primary-foreground"
                  )}
                >
                  {date.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Habit rows */}
        <div className="space-y-2">
          {habits.map((habit) => (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="grid grid-cols-8 gap-2 rounded-lg bg-card p-3 border"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-lg">{habit.icon}</span>
                <span className="text-sm font-medium truncate">{habit.name}</span>
              </div>
              {weekDates.map((date) => {
                const dateStr = formatDate(date);
                const dayOfWeek = date.getDay();
                const isTargetDay = habit.targetDays.includes(dayOfWeek);
                const completed = isCompleted(habit.id, dateStr);
                const isToday = dateStr === today;
                const isPast = date < new Date() && !isToday;

                if (!isTargetDay) {
                  return (
                    <div
                      key={dateStr}
                      className="flex items-center justify-center"
                    >
                      <div className="h-8 w-8 rounded-lg bg-muted/50" />
                    </div>
                  );
                }

                return (
                  <motion.button
                    key={dateStr}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg mx-auto transition-all",
                      completed
                        ? "bg-success text-success-foreground"
                        : isPast
                        ? "bg-destructive/20 text-destructive"
                        : "bg-secondary hover:bg-primary/20"
                    )}
                    onClick={() => onToggle(habit.id, dateStr)}
                  >
                    {completed ? (
                      <Check className="h-4 w-4" />
                    ) : isPast ? (
                      <X className="h-4 w-4" />
                    ) : null}
                  </motion.button>
                );
              })}
            </motion.div>
          ))}
        </div>

        {habits.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No habits yet. Create your first habit to see it here!
          </div>
        )}
      </div>
    </div>
  );
}
