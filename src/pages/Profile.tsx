import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, User, Save, Loader2, Shield, Zap, Trophy, Swords } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ProfileCustomization } from "@/components/ProfileCustomization";
import { AchievementsPanel } from "@/components/AchievementsPanel";
import { calculatePlayerStats } from "@/lib/xp";
import { getAvatarById, getTitleById } from "@/lib/customization";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [selectedAvatarId, setSelectedAvatarId] = useState("default");
  const [selectedTitleId, setSelectedTitleId] = useState("novice");
  const [totalXP, setTotalXP] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isSavingCustomization, setIsSavingCustomization] = useState(false);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [achievementStats, setAchievementStats] = useState({
    maxStreak: 0,
    totalCompletions: 0,
    perfectDays: 0,
    habitsCreated: 0,
  });

  const playerStats = calculatePlayerStats(totalXP);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchProfile = async () => {
      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, selected_avatar_id, selected_title_id")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
      } else if (profileData) {
        setDisplayName(profileData.display_name || "");
        setAvatarUrl(profileData.avatar_url);
        setSelectedAvatarId(profileData.selected_avatar_id || "default");
        setSelectedTitleId(profileData.selected_title_id || "novice");
      }

      // Fetch player stats
      const { data: statsData, error: statsError } = await supabase
        .from("player_stats")
        .select("total_xp")
        .eq("id", user.id)
        .maybeSingle();

      if (statsError) {
        console.error("Error fetching stats:", statsError);
      } else if (statsData) {
        setTotalXP(statsData.total_xp);
      }

      // Fetch unlocked achievements
      const { data: achievementsData } = await supabase
        .from("unlocked_achievements")
        .select("achievement_id")
        .eq("user_id", user.id);

      if (achievementsData) {
        setUnlockedAchievements(achievementsData.map((a) => a.achievement_id));
      }

      // Fetch habits and logs for stats calculation
      const { data: habitsData } = await supabase
        .from("habits")
        .select("id, target_days")
        .eq("user_id", user.id);

      const { data: logsData } = await supabase
        .from("habit_logs")
        .select("habit_id, date, completed")
        .eq("user_id", user.id);

      if (habitsData && logsData) {
        const habits = habitsData;
        const logs = logsData.filter((l) => l.completed);

        // Calculate max streak
        let maxStreak = 0;
        habits.forEach((habit) => {
          const habitLogs = logs
            .filter((l) => l.habit_id === habit.id)
            .map((l) => l.date)
            .sort();

          let streak = 0;
          let bestStreak = 0;
          let prevDate: Date | null = null;

          habitLogs.forEach((dateStr) => {
            const date = new Date(dateStr);
            if (prevDate) {
              const diff = (date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
              if (diff === 1) {
                streak++;
              } else {
                streak = 1;
              }
            } else {
              streak = 1;
            }
            bestStreak = Math.max(bestStreak, streak);
            prevDate = date;
          });

          maxStreak = Math.max(maxStreak, bestStreak);
        });

        // Calculate perfect days
        const dateMap: Record<string, Set<string>> = {};
        logs.forEach((log) => {
          if (!dateMap[log.date]) {
            dateMap[log.date] = new Set();
          }
          dateMap[log.date].add(log.habit_id);
        });

        let perfectDays = 0;
        Object.entries(dateMap).forEach(([dateStr, completedHabitIds]) => {
          const date = new Date(dateStr);
          const dayOfWeek = date.getDay();
          const habitsForDay = habits.filter((h) => h.target_days.includes(dayOfWeek));
          if (habitsForDay.length > 0 && habitsForDay.every((h) => completedHabitIds.has(h.id))) {
            perfectDays++;
          }
        });

        setAchievementStats({
          maxStreak,
          totalCompletions: logs.length,
          perfectDays,
          habitsCreated: habits.length,
        });
      }

      setIsFetching(false);
    };

    fetchProfile();
  }, [user, navigate]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // Strict allowlists for avatar upload security
  const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate MIME type against strict allowlist (blocks SVG and other risky types)
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Only JPG, PNG, GIF, and WebP images are allowed.",
        variant: "destructive",
      });
      return;
    }

    // Validate file extension against strict allowlist
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    if (!fileExt || !ALLOWED_IMAGE_EXTENSIONS.includes(fileExt)) {
      toast({
        title: "Invalid file extension",
        description: "Only JPG, PNG, GIF, and WebP files are allowed.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 2MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    // Use validated extension for safe filename
    const safeExt = file.type === 'image/jpeg' ? 'jpg' : fileExt;
    const fileName = `${user.id}/${Date.now()}.${safeExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      toast({
        title: "Upload failed",
        description: uploadError.message,
        variant: "destructive",
      });
      setIsUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    const newAvatarUrl = publicUrlData.publicUrl;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: newAvatarUrl, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (updateError) {
      toast({
        title: "Failed to update profile",
        description: updateError.message,
        variant: "destructive",
      });
    } else {
      setAvatarUrl(newAvatarUrl);
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated.",
      });
    }

    setIsUploading(false);
  };

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({ 
        display_name: displayName.trim() || null, 
        updated_at: new Date().toISOString() 
      })
      .eq("id", user.id);

    if (error) {
      toast({
        title: "Failed to save",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile saved",
        description: "Your changes have been saved.",
      });
    }

    setIsLoading(false);
  };

  const handleSaveCustomization = async (avatarId: string, titleId: string) => {
    if (!user) return;

    setIsSavingCustomization(true);

    const { error } = await supabase
      .from("profiles")
      .update({ 
        selected_avatar_id: avatarId,
        selected_title_id: titleId,
        updated_at: new Date().toISOString() 
      })
      .eq("id", user.id);

    if (error) {
      toast({
        title: "Failed to save customization",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setSelectedAvatarId(avatarId);
      setSelectedTitleId(titleId);
      toast({
        title: "Customization saved",
        description: "Your avatar and title have been updated.",
      });
    }

    setIsSavingCustomization(false);
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const selectedAvatar = getAvatarById(selectedAvatarId);
  const selectedTitle = getTitleById(selectedTitleId);
  const AvatarIcon = selectedAvatar?.icon || User;

  const getRankColor = (rank: string) => {
    if (rank.includes("S-Rank")) return "hsl(45, 100%, 50%)";
    if (rank.includes("A-Rank")) return "hsl(280, 100%, 60%)";
    if (rank.includes("B-Rank")) return "hsl(215, 100%, 55%)";
    if (rank.includes("C-Rank")) return "hsl(175, 90%, 45%)";
    if (rank.includes("D-Rank")) return "hsl(120, 60%, 45%)";
    return "hsl(215, 25%, 50%)";
  };

  const rankColor = getRankColor(playerStats.rank);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="system-border rounded-lg bg-card min-h-[calc(100vh-3rem)]">
        <div className="system-border-glow top-left" />
        <div className="system-border-glow top-right" />
        <div className="system-border-glow bottom-left" />
        <div className="system-border-glow bottom-right" />

        <header className="border-b-2 border-primary/30 bg-card sticky top-0 z-50 rounded-t-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-neon animate-pulse-glow">
                  <Shield className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="font-display text-xl font-bold text-primary text-glow">HUNTER PROFILE</h1>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Status Window</p>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
          {/* Hunter Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="relative rounded-lg border-2 border-primary/50 bg-card overflow-hidden shadow-neon">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
              
              <div className="relative border-b border-primary/30 bg-secondary/30 px-6 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary animate-pulse" />
                    <span className="font-display text-sm font-bold text-primary tracking-wider">HUNTER STATUS</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">ID: {user?.id?.slice(0, 8).toUpperCase()}</span>
                </div>
              </div>

              <div className="relative p-6">
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                  <div className="relative flex-shrink-0">
                    <div 
                      className="relative rounded-lg p-1"
                      style={{ 
                        background: `linear-gradient(135deg, ${rankColor}, ${selectedAvatar?.color || "hsl(var(--primary))"})`,
                        boxShadow: `0 0 30px ${rankColor}50`
                      }}
                    >
                      {avatarUrl ? (
                        <Avatar className="h-32 w-32 rounded-lg">
                          <AvatarImage src={avatarUrl} className="rounded-lg" />
                          <AvatarFallback className="bg-secondary rounded-lg">
                            <User className="h-14 w-14 text-muted-foreground" />
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div
                          className="h-32 w-32 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: selectedAvatar?.bgColor || "hsl(var(--secondary))" }}
                        >
                          <AvatarIcon className="h-16 w-16" style={{ color: selectedAvatar?.color }} />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleAvatarClick}
                      disabled={isUploading}
                      className="absolute -bottom-2 -right-2 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.gif,.webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>

                  <div className="flex-1 w-full space-y-4">
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground font-display tracking-wider">NAME</span>
                      <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground">
                        {displayName || "Anonymous Hunter"}
                      </h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="rounded-lg border border-primary/20 bg-secondary/30 p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Trophy className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground font-display tracking-wider">TITLE</span>
                        </div>
                        <p 
                          className="font-bold font-display text-sm truncate"
                          style={{ color: selectedTitle?.color }}
                        >
                          {selectedTitle?.title || "Novice Hunter"}
                        </p>
                      </div>

                      <div className="rounded-lg border border-primary/20 bg-secondary/30 p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground font-display tracking-wider">LEVEL</span>
                        </div>
                        <p className="font-bold font-display text-2xl text-primary text-glow">
                          {playerStats.level}
                        </p>
                      </div>

                      <div className="rounded-lg border border-primary/20 bg-secondary/30 p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground font-display tracking-wider">RANK</span>
                        </div>
                        <p 
                          className="font-bold font-display text-sm"
                          style={{ color: rankColor, textShadow: `0 0 10px ${rankColor}50` }}
                        >
                          {playerStats.rank}
                        </p>
                      </div>

                      <div className="rounded-lg border border-primary/20 bg-secondary/30 p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Swords className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground font-display tracking-wider">TOTAL XP</span>
                        </div>
                        <p className="font-bold font-display text-lg text-accent">
                          {totalXP.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground font-display">XP PROGRESS</span>
                        <span className="text-primary font-mono">{playerStats.currentXP} / {playerStats.xpToNextLevel}</span>
                      </div>
                      <div className="h-3 bg-secondary rounded-full overflow-hidden border border-primary/20">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${playerStats.xpToNextLevel > 0 ? (playerStats.currentXP / playerStats.xpToNextLevel) * 100 : 100}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          style={{ boxShadow: "0 0 10px hsl(var(--primary))" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Basic Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-primary/20 bg-card shadow-card">
              <CardHeader>
                <CardTitle className="text-primary font-display">BASIC INFO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-muted-foreground">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your hunter name"
                    maxLength={50}
                    className="bg-secondary/50 border-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-muted-foreground">Email</Label>
                  <Input
                    id="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-muted border-border"
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                <Button onClick={handleSave} disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Customization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-primary/20 bg-card shadow-card">
              <CardHeader>
                <CardTitle className="text-primary font-display">CUSTOMIZE YOUR HUNTER</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Unlock new avatars and titles as you level up!
                </p>
              </CardHeader>
              <CardContent>
                <ProfileCustomization
                  currentLevel={playerStats.level}
                  selectedAvatarId={selectedAvatarId}
                  selectedTitleId={selectedTitleId}
                  onSave={handleSaveCustomization}
                  saving={isSavingCustomization}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-primary/20 bg-card shadow-card">
              <CardHeader>
                <CardTitle className="text-primary font-display flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  ACHIEVEMENTS
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Track your progress and unlock badges!
                </p>
              </CardHeader>
              <CardContent>
                <AchievementsPanel
                  unlockedAchievementIds={unlockedAchievements}
                  stats={achievementStats}
                />
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
