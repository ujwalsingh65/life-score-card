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
import { Habit } from "@/types/habit";
import { getWeeklyData, getCategoryStats, getHabitCompletionData } from "@/lib/habits";

interface AnalyticsChartsProps {
  habits: Habit[];
}

export function AnalyticsCharts({ habits }: AnalyticsChartsProps) {
  const weeklyData = useMemo(() => getWeeklyData(), [habits]);
  const categoryData = useMemo(() => getCategoryStats(), [habits]);
  const habitCompletionData = useMemo(() => getHabitCompletionData(), [habits]);

  const COLORS = [
    "hsl(210, 100%, 50%)",
    "hsl(190, 95%, 45%)",
    "hsl(150, 80%, 45%)",
    "hsl(45, 100%, 50%)",
    "hsl(280, 80%, 55%)",
    "hsl(340, 80%, 55%)",
  ];

  const customTooltipStyle = {
    backgroundColor: "hsl(222, 47%, 10%)",
    border: "1px solid hsl(215, 30%, 25%)",
    borderRadius: "8px",
    padding: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Weekly Progress Line Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-lg border border-primary/20 bg-card p-6 shadow-system"
      >
        <h3 className="font-display text-lg font-semibold text-primary mb-4 text-glow">
          WEEKLY PROGRESS
        </h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 30%, 18%)" />
              <XAxis
                dataKey="day"
                stroke="hsl(215, 20%, 55%)"
                fontSize={12}
                fontFamily="Rajdhani"
              />
              <YAxis
                stroke="hsl(215, 20%, 55%)"
                fontSize={12}
                fontFamily="Rajdhani"
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={customTooltipStyle}
                labelStyle={{ color: "hsl(210, 100%, 50%)", fontFamily: "Orbitron" }}
                itemStyle={{ color: "hsl(210, 40%, 98%)" }}
                formatter={(value: number) => [`${value}%`, "Completion"]}
              />
              <Line
                type="monotone"
                dataKey="percentage"
                stroke="hsl(210, 100%, 50%)"
                strokeWidth={3}
                dot={{ fill: "hsl(210, 100%, 50%)", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 8, fill: "hsl(190, 95%, 45%)" }}
                filter="drop-shadow(0 0 8px hsl(210, 100%, 50%))"
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
        className="rounded-lg border border-primary/20 bg-card p-6 shadow-system"
      >
        <h3 className="font-display text-lg font-semibold text-primary mb-4 text-glow">
          QUEST CATEGORIES
        </h3>
        <div className="h-[250px] flex items-center justify-center">
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
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
                      stroke="hsl(222, 47%, 8%)"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={customTooltipStyle}
                  labelStyle={{ color: "hsl(210, 100%, 50%)", fontFamily: "Orbitron" }}
                  itemStyle={{ color: "hsl(210, 40%, 98%)" }}
                />
                <Legend
                  wrapperStyle={{ fontFamily: "Rajdhani", fontSize: "14px" }}
                  formatter={(value) => (
                    <span style={{ color: "hsl(210, 40%, 98%)" }}>{value}</span>
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
        className="rounded-lg border border-primary/20 bg-card p-6 shadow-system lg:col-span-2"
      >
        <h3 className="font-display text-lg font-semibold text-primary mb-4 text-glow">
          QUEST COMPLETION STATUS
        </h3>
        <div className="h-[250px]">
          {habitCompletionData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={habitCompletionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 30%, 18%)" />
                <XAxis
                  type="number"
                  stroke="hsl(215, 20%, 55%)"
                  fontSize={12}
                  fontFamily="Rajdhani"
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="hsl(215, 20%, 55%)"
                  fontSize={12}
                  fontFamily="Rajdhani"
                  width={120}
                  tickFormatter={(value) => value.length > 15 ? `${value.slice(0, 15)}...` : value}
                />
                <Tooltip
                  contentStyle={customTooltipStyle}
                  labelStyle={{ color: "hsl(210, 100%, 50%)", fontFamily: "Orbitron" }}
                  itemStyle={{ color: "hsl(210, 40%, 98%)" }}
                />
                <Legend
                  wrapperStyle={{ fontFamily: "Rajdhani", fontSize: "14px" }}
                  formatter={(value) => (
                    <span style={{ color: "hsl(210, 40%, 98%)" }}>{value}</span>
                  )}
                />
                <Bar
                  dataKey="completed"
                  name="Completed"
                  fill="hsl(150, 80%, 45%)"
                  radius={[0, 4, 4, 0]}
                />
                <Bar
                  dataKey="missed"
                  name="Missed"
                  fill="hsl(0, 80%, 50%)"
                  radius={[0, 4, 4, 0]}
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