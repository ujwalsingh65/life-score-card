import { motion } from "framer-motion";
import { TrendingUp, Target, Flame, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  accentColor?: "primary" | "success" | "warning" | "accent";
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor = "primary",
}: StatsCardProps) {
  const colorClasses = {
    primary: "text-primary bg-primary/10",
    success: "text-success bg-success/10",
    warning: "text-warning bg-warning/10",
    accent: "text-accent bg-accent/10",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border bg-card p-5 shadow-soft"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl",
            colorClasses[accentColor]
          )}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

interface DashboardStatsProps {
  todayCompleted: number;
  todayTotal: number;
  weeklyCompleted: number;
  weeklyTotal: number;
  currentStreak: number;
  totalHabits: number;
}

export function DashboardStats({
  todayCompleted,
  todayTotal,
  weeklyCompleted,
  weeklyTotal,
  currentStreak,
  totalHabits,
}: DashboardStatsProps) {
  const todayPercentage = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;
  const weeklyPercentage = weeklyTotal > 0 ? Math.round((weeklyCompleted / weeklyTotal) * 100) : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Today's Progress"
        value={`${todayCompleted}/${todayTotal}`}
        subtitle={`${todayPercentage}% completed`}
        icon={<Target className="h-5 w-5" />}
        accentColor={todayPercentage === 100 ? "success" : "primary"}
      />
      <StatsCard
        title="This Week"
        value={`${weeklyPercentage}%`}
        subtitle={`${weeklyCompleted} of ${weeklyTotal} done`}
        icon={<Calendar className="h-5 w-5" />}
        accentColor="accent"
      />
      <StatsCard
        title="Best Streak"
        value={currentStreak}
        subtitle="days in a row"
        icon={<Flame className="h-5 w-5" />}
        accentColor="warning"
      />
      <StatsCard
        title="Active Habits"
        value={totalHabits}
        subtitle="tracking daily"
        icon={<TrendingUp className="h-5 w-5" />}
        accentColor="success"
      />
    </div>
  );
}
