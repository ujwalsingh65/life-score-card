import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, User, Loader2, Shield, Zap, Trophy, Swords, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { calculatePlayerStats, getRankColor } from "@/lib/xp";
import { getAvatarById, getTitleById } from "@/lib/customization";
import { RankProgressionDisplay } from "@/components/RankProgressionDisplay";

interface PublicProfileData {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  selectedAvatarId: string;
  selectedTitleId: string;
  totalXP: number;
}

export default function PublicProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setError("Invalid user ID");
        setLoading(false);
        return;
      }

      try {
        // Fetch profile from leaderboard_profiles view (public data)
        const { data: profileData, error: profileError } = await supabase
          .from("leaderboard_profiles")
          .select("id, display_name, selected_avatar_id, selected_title_id")
          .eq("id", userId)
          .maybeSingle();

        if (profileError) throw profileError;

        if (!profileData) {
          setError("Hunter not found");
          setLoading(false);
          return;
        }

        // Fetch stats from leaderboard_stats view (public data)
        const { data: statsData, error: statsError } = await supabase
          .from("leaderboard_stats")
          .select("id, total_xp")
          .eq("id", userId)
          .maybeSingle();

        if (statsError) throw statsError;

        setProfile({
          id: profileData.id || userId,
          displayName: profileData.display_name || "Anonymous Hunter",
          avatarUrl: null, // Avatar URL is private, only show icon
          selectedAvatarId: profileData.selected_avatar_id || "default",
          selectedTitleId: profileData.selected_title_id || "novice",
          totalXP: statsData?.total_xp || 0,
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load hunter profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Shield className="h-16 w-16 text-muted-foreground opacity-50" />
        <p className="text-xl text-muted-foreground">{error || "Hunter not found"}</p>
        <Button onClick={() => navigate("/")} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </div>
    );
  }

  const playerStats = calculatePlayerStats(profile.totalXP);
  const selectedAvatar = getAvatarById(profile.selectedAvatarId);
  const selectedTitle = getTitleById(profile.selectedTitleId);
  const AvatarIcon = selectedAvatar?.icon || User;
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
                  onClick={() => navigate(-1)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-neon animate-pulse-glow">
                  <Crown className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="font-display text-xl font-bold text-primary text-glow">HUNTER PROFILE</h1>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Public Status Window</p>
                </div>
              </div>
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
                  <span 
                    className="text-sm font-bold font-display px-3 py-1 rounded-full"
                    style={{ 
                      backgroundColor: `${rankColor}20`,
                      color: rankColor,
                      border: `1px solid ${rankColor}50`
                    }}
                  >
                    {playerStats.rank}
                  </span>
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
                      <div
                        className="h-32 w-32 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: selectedAvatar?.bgColor || "hsl(var(--secondary))" }}
                      >
                        <AvatarIcon className="h-16 w-16" style={{ color: selectedAvatar?.color }} />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 w-full space-y-4">
                    <div className="space-y-1 text-center md:text-left">
                      <span className="text-xs text-muted-foreground font-display tracking-wider">NAME</span>
                      <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground">
                        {profile.displayName}
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
                          {profile.totalXP.toLocaleString()}
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

          {/* Rank Progression */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <RankProgressionDisplay stats={playerStats} />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
