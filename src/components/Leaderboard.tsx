import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Crown, Medal, Award, User, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { calculatePlayerStats, getRankColor } from "@/lib/xp";
import { getAvatarById, getTitleById } from "@/lib/customization";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  id: string;
  displayName: string;
  totalXP: number;
  level: number;
  rank: string;
  selectedAvatarId: string;
  selectedTitleId: string;
}

interface LeaderboardProps {
  currentUserId?: string;
}

export function Leaderboard({ currentUserId }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch player stats ordered by XP
        const { data: statsData, error: statsError } = await supabase
          .from("player_stats")
          .select("id, total_xp")
          .order("total_xp", { ascending: false })
          .limit(50);

        if (statsError) throw statsError;

        if (!statsData || statsData.length === 0) {
          setEntries([]);
          setLoading(false);
          return;
        }

        // Fetch profiles for display names and customization using secure view
        const userIds = statsData.map(s => s.id);
        const { data: profilesData, error: profilesError } = await supabase
          .from("leaderboard_profiles")
          .select("id, display_name, selected_avatar_id, selected_title_id")
          .in("id", userIds);

        if (profilesError) throw profilesError;

        // Combine data
        const profileMap = new Map(
          (profilesData || []).map(p => [p.id, {
            displayName: p.display_name,
            avatarId: p.selected_avatar_id || "default",
            titleId: p.selected_title_id || "novice"
          }])
        );

        const leaderboardEntries: LeaderboardEntry[] = statsData.map(stat => {
          const playerStats = calculatePlayerStats(stat.total_xp);
          const profile = profileMap.get(stat.id);
          return {
            id: stat.id,
            displayName: profile?.displayName || "Anonymous Hunter",
            totalXP: stat.total_xp,
            level: playerStats.level,
            rank: playerStats.rank,
            selectedAvatarId: profile?.avatarId || "default",
            selectedTitleId: profile?.titleId || "novice",
          };
        });

        setEntries(leaderboardEntries);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setError("Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankIcon = (position: number) => {
    switch (position) {
      case 0:
        return <Crown className="h-5 w-5 text-yellow-400" />;
      case 1:
        return <Medal className="h-5 w-5 text-gray-300" />;
      case 2:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground w-5 text-center">{position + 1}</span>;
    }
  };

  const getPositionStyle = (position: number) => {
    switch (position) {
      case 0:
        return "bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border-yellow-500/40 shadow-[0_0_20px_hsla(45,100%,50%,0.2)]";
      case 1:
        return "bg-gradient-to-r from-gray-400/20 to-gray-300/10 border-gray-400/40";
      case 2:
        return "bg-gradient-to-r from-amber-600/20 to-orange-500/10 border-amber-600/40";
      default:
        return "bg-secondary/30 border-primary/20";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>{error}</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No hunters on the leaderboard yet!</p>
        <p className="text-sm mt-2">Complete quests to be the first!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Hunter Leaderboard
        </h3>
        <span className="text-sm text-muted-foreground">Top 50 Hunters</span>
      </div>

      {/* Top 3 Podium */}
      {entries.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {/* 2nd Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center pt-6"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-400 to-gray-300 flex items-center justify-center border-2 border-gray-300">
                <User className="h-8 w-8 text-gray-700" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-800">
                2
              </div>
            </div>
            <p className="mt-3 text-sm font-bold text-foreground truncate max-w-full px-2">
              {entries[1].displayName}
            </p>
            <p className="text-xs text-muted-foreground">Lv. {entries[1].level}</p>
            <p className="text-xs font-bold text-primary">{entries[1].totalXP.toLocaleString()} XP</p>
          </motion.div>

          {/* 1st Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <div className="relative">
              <Crown className="absolute -top-4 left-1/2 -translate-x-1/2 h-6 w-6 text-yellow-400" />
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center border-2 border-yellow-300 shadow-[0_0_20px_hsla(45,100%,50%,0.4)]">
                <User className="h-10 w-10 text-yellow-900" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center text-sm font-bold text-yellow-900">
                1
              </div>
            </div>
            <p className="mt-3 text-sm font-bold text-foreground truncate max-w-full px-2">
              {entries[0].displayName}
            </p>
            <p className="text-xs" style={{ color: getRankColor(entries[0].rank) }}>
              {entries[0].rank}
            </p>
            <p className="text-sm font-bold text-primary">{entries[0].totalXP.toLocaleString()} XP</p>
          </motion.div>

          {/* 3rd Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center pt-8"
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-600 to-orange-500 flex items-center justify-center border-2 border-amber-500">
                <User className="h-7 w-7 text-amber-900" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-amber-600 flex items-center justify-center text-xs font-bold text-amber-100">
                3
              </div>
            </div>
            <p className="mt-3 text-sm font-bold text-foreground truncate max-w-full px-2">
              {entries[2].displayName}
            </p>
            <p className="text-xs text-muted-foreground">Lv. {entries[2].level}</p>
            <p className="text-xs font-bold text-primary">{entries[2].totalXP.toLocaleString()} XP</p>
          </motion.div>
        </div>
      )}

      {/* Full List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {entries.map((entry, index) => {
          const isCurrentUser = entry.id === currentUserId;
          const avatar = getAvatarById(entry.selectedAvatarId);
          const title = getTitleById(entry.selectedTitleId);
          const AvatarIcon = avatar?.icon || User;
          
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className={cn(
                "flex items-center gap-4 p-3 rounded-lg border transition-all",
                getPositionStyle(index),
                isCurrentUser && "ring-2 ring-primary ring-offset-2 ring-offset-background"
              )}
            >
              {/* Position */}
              <div className="w-8 flex items-center justify-center">
                {getRankIcon(index)}
              </div>

              {/* Avatar with customization */}
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ 
                  backgroundColor: avatar?.bgColor || `${getRankColor(entry.rank)}30`,
                  border: `2px solid ${avatar?.color || getRankColor(entry.rank)}` 
                }}
              >
                <AvatarIcon className="h-5 w-5" style={{ color: avatar?.color || getRankColor(entry.rank) }} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={cn(
                    "font-bold truncate",
                    isCurrentUser && "text-primary"
                  )}>
                    {entry.displayName}
                    {isCurrentUser && <span className="ml-2 text-xs">(You)</span>}
                  </p>
                </div>
                <p className="text-xs" style={{ color: title?.color || getRankColor(entry.rank) }}>
                  {title?.title || entry.rank}
                </p>
              </div>

              {/* Stats */}
              <div className="text-right">
                <p className="font-bold text-primary">{entry.totalXP.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">XP</p>
              </div>

              {/* Level */}
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center font-bold"
                style={{ 
                  backgroundColor: `${getRankColor(entry.rank)}20`,
                  color: getRankColor(entry.rank)
                }}
              >
                {entry.level}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}