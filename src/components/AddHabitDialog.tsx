import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Habit, HabitCategory, CATEGORY_CONFIG, DAYS_OF_WEEK } from "@/types/habit";
import { cn } from "@/lib/utils";

const HABIT_ICONS = ["🏃", "📖", "💧", "🧘", "✍️", "🎯", "💪", "🌅", "😴", "🥗", "📱", "💰"];

interface AddHabitDialogProps {
  onAdd: (habit: Omit<Habit, "id" | "createdAt">) => void;
  children?: React.ReactNode;
}

export function AddHabitDialog({ onAdd, children }: AddHabitDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<HabitCategory>("health");
  const [icon, setIcon] = useState("🎯");
  const [targetDays, setTargetDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd({
      name: name.trim(),
      category,
      icon,
      color: CATEGORY_CONFIG[category].color,
      targetDays,
    });

    setName("");
    setCategory("health");
    setIcon("🎯");
    setTargetDays([0, 1, 2, 3, 4, 5, 6]);
    setOpen(false);
  };

  const toggleDay = (day: number) => {
    setTargetDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="neon" size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            New Quest
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Habit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Habit Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Habit Name</Label>
            <Input
              id="name"
              placeholder="e.g., Morning meditation"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12"
            />
          </div>

          {/* Icon Selection */}
          <div className="space-y-2">
            <Label>Choose an Icon</Label>
            <div className="flex flex-wrap gap-2">
              {HABIT_ICONS.map((emoji) => (
                <motion.button
                  key={emoji}
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg border-2 text-xl transition-all",
                    icon === emoji
                      ? "border-primary bg-primary/10"
                      : "border-transparent bg-secondary hover:bg-secondary/80"
                  )}
                  onClick={() => setIcon(emoji)}
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label>Category</Label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(CATEGORY_CONFIG) as HabitCategory[]).map((cat) => (
                <motion.button
                  key={cat}
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border-2 px-3 py-2.5 text-left text-sm font-medium transition-all",
                    category === cat
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-transparent bg-secondary hover:bg-secondary/80"
                  )}
                  onClick={() => setCategory(cat)}
                >
                  <span>{CATEGORY_CONFIG[cat].icon}</span>
                  <span>{CATEGORY_CONFIG[cat].label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Target Days */}
          <div className="space-y-2">
            <Label>Repeat on</Label>
            <div className="flex gap-1.5">
              {DAYS_OF_WEEK.map((day, index) => (
                <motion.button
                  key={day}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-all",
                    targetDays.includes(index)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  )}
                  onClick={() => toggleDay(index)}
                >
                  {day.charAt(0)}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <Button type="submit" variant="neon" className="w-full" size="lg">
            Initialize Quest
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
