import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Habit, HabitLog } from "@/types/habit";

interface AnalyticsChartsProps {
  habits: Habit[];
  logs: HabitLog[];
}

export function AnalyticsCharts({ habits, logs }: AnalyticsChartsProps) {
  // Helper to check completion from logs
  const checkCompleted = (habitId: string, date: string): boolean => {
    return logs.some(l => l.habitId === habitId && l.date === date && l.completed);
  };

  // Calculate weekly data from actual logs
  const weeklyData = useMemo(() => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const result = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      const dayOfWeek = date.getDay();
      
      const habitsForDay = habits.filter(h => h.targetDays.includes(dayOfWeek));
      const completed = habitsForDay.filter(h => checkCompleted(h.id, dateStr)).length;
      const total = habitsForDay.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      result.push({ day: days[dayOfWeek], completed, total, percentage });
    }
    
    return result;
  }, [habits, logs]);

  // Calculate category stats from actual habits
  const categoryData = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    habits.forEach(habit => {
      categoryMap[habit.category] = (categoryMap[habit.category] || 0) + 1;
    });
    return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
  }, [habits]);

  // Calculate habit completion data from actual logs
  const habitCompletionData = useMemo(() => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    
    return habits.map(habit => {
      let completed = 0;
      let missed = 0;
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split("T")[0];
        const dayOfWeek = date.getDay();
        
        if (habit.targetDays.includes(dayOfWeek)) {
          if (checkCompleted(habit.id, dateStr)) {
            completed++;
          } else if (date <= new Date()) {
            missed++;
          }
        }
      }
      
      return { name: habit.name, completed, missed };
    });
  }, [habits, logs]);

  // Solo Leveling blue-purple palette
  const COLORS = [
    "hsl(215, 100%, 55%)",  // Electric blue
    "hsl(195, 100%, 50%)",  // Cyan
    "hsl(175, 90%, 45%)",   // Teal
    "hsl(260, 85%, 60%)",   // Purple
    "hsl(235, 80%, 55%)",   // Indigo
    "hsl(280, 75%, 55%)",   // Violet
  ];

  const customTooltipStyle = {
    backgroundColor: "hsl(225, 35%, 8%)",
    border: "1px solid hsl(215, 100%, 55%)",
    borderRadius: "8px",
    padding: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5), 0 0 20px hsla(215, 100%, 55%, 0.2)",
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Weekly Progress Line Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-lg border border-primary/30 bg-card p-6 shadow-system"
      >
        <h3 className="font-display text-lg font-semibold text-primary mb-4 text-glow">
          WEEKLY PROGRESS
        </h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 30%, 15%)" />
              <XAxis
                dataKey="day"
                stroke="hsl(215, 25%, 50%)"
                fontSize={12}
                fontFamily="Rajdhani"
              />
              <YAxis
                stroke="hsl(215, 25%, 50%)"
                fontSize={12}
                fontFamily="Rajdhani"
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={customTooltipStyle}
                labelStyle={{ color: "hsl(215, 100%, 55%)", fontFamily: "Orbitron" }}
                itemStyle={{ color: "hsl(210, 50%, 95%)" }}
                formatter={(value: number) => [`${value}%`, "Completion"]}
              />
              <Line
                type="monotone"
                dataKey="percentage"
                stroke="hsl(215, 100%, 55%)"
                strokeWidth={3}
                dot={{ fill: "hsl(215, 100%, 55%)", strokeWidth: 2, r: 5, stroke: "hsl(225, 30%, 3%)" }}
                activeDot={{ r: 8, fill: "hsl(195, 100%, 50%)", stroke: "hsl(215, 100%, 55%)", strokeWidth: 2 }}
                filter="drop-shadow(0 0 8px hsl(215, 100%, 55%))"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Category Distribution Pie Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-lg border border-primary/30 bg-card p-6 shadow-system"
      >
        <h3 className="font-display text-lg font-semibold text-primary mb-4 text-glow">
          QUEST CATEGORIES
        </h3>
        <div className="h-[250px] flex items-center justify-center">
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {COLORS.map((color, index) => (
                    <filter key={`glow-${index}`} id={`pieGlow-${index}`} x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  ))}
                </defs>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="hsl(225, 30%, 3%)"
                      strokeWidth={2}
                      style={{ filter: `drop-shadow(0 0 6px ${COLORS[index % COLORS.length]})` }}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={customTooltipStyle}
                  labelStyle={{ color: "hsl(215, 100%, 55%)", fontFamily: "Orbitron" }}
                  itemStyle={{ color: "hsl(210, 50%, 95%)" }}
                />
                <Legend
                  wrapperStyle={{ fontFamily: "Rajdhani", fontSize: "14px" }}
                  formatter={(value) => (
                    <span style={{ color: "hsl(210, 50%, 95%)" }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center">No quests to display</p>
          )}
        </div>
      </motion.div>

      {/* Habit Completion Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-lg border border-primary/30 bg-card p-6 shadow-system lg:col-span-2"
      >
        <h3 className="font-display text-lg font-semibold text-primary mb-4 text-glow">
          QUEST COMPLETION STATUS
        </h3>
        <div className="h-[250px]">
          {habitCompletionData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={habitCompletionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 30%, 15%)" />
                <XAxis
                  type="number"
                  stroke="hsl(215, 25%, 50%)"
                  fontSize={12}
                  fontFamily="Rajdhani"
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="hsl(215, 25%, 50%)"
                  fontSize={12}
                  fontFamily="Rajdhani"
                  width={120}
                  tickFormatter={(value) => value.length > 15 ? `${value.slice(0, 15)}...` : value}
                />
                <Tooltip
                  contentStyle={customTooltipStyle}
                  labelStyle={{ color: "hsl(215, 100%, 55%)", fontFamily: "Orbitron" }}
                  itemStyle={{ color: "hsl(210, 50%, 95%)" }}
                />
                <Legend
                  wrapperStyle={{ fontFamily: "Rajdhani", fontSize: "14px" }}
                  formatter={(value) => (
                    <span style={{ color: "hsl(210, 50%, 95%)" }}>{value}</span>
                  )}
                />
                <Bar
                  dataKey="completed"
                  name="Completed"
                  fill="hsl(175, 90%, 45%)"
                  radius={[0, 4, 4, 0]}
                  style={{ filter: "drop-shadow(0 0 4px hsl(175, 90%, 45%))" }}
                />
                <Bar
                  dataKey="missed"
                  name="Missed"
                  fill="hsl(0, 85%, 55%)"
                  radius={[0, 4, 4, 0]}
                  style={{ filter: "drop-shadow(0 0 4px hsl(0, 85%, 55%))" }}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-20">No quest data to display</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
