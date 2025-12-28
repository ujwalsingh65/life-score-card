import { Shield, Sword, Flame, Crown, Star, Zap, Award, Target, Sparkles, Skull, Heart, Diamond } from "lucide-react";

// Unlockable avatars with rank requirements
export interface UnlockableAvatar {
  id: string;
  name: string;
  icon: typeof Shield;
  requiredRank: string;
  requiredLevel: number;
  color: string;
  bgColor: string;
}

export const UNLOCKABLE_AVATARS: UnlockableAvatar[] = [
  { id: "default", name: "Novice", icon: Shield, requiredRank: "E-Rank", requiredLevel: 1, color: "hsl(220 10% 60%)", bgColor: "hsl(220 10% 20%)" },
  { id: "warrior", name: "Warrior", icon: Sword, requiredRank: "E-Rank", requiredLevel: 5, color: "hsl(220 70% 55%)", bgColor: "hsl(220 70% 15%)" },
  { id: "flame", name: "Flame Bearer", icon: Flame, requiredRank: "D-Rank", requiredLevel: 11, color: "hsl(16 85% 58%)", bgColor: "hsl(16 85% 15%)" },
  { id: "star", name: "Star Hunter", icon: Star, requiredRank: "D-Rank", requiredLevel: 15, color: "hsl(45 100% 50%)", bgColor: "hsl(45 100% 15%)" },
  { id: "lightning", name: "Lightning", icon: Zap, requiredRank: "C-Rank", requiredLevel: 21, color: "hsl(38 92% 50%)", bgColor: "hsl(38 92% 15%)" },
  { id: "target", name: "Precision", icon: Target, requiredRank: "C-Rank", requiredLevel: 30, color: "hsl(145 70% 45%)", bgColor: "hsl(145 70% 12%)" },
  { id: "champion", name: "Champion", icon: Award, requiredRank: "B-Rank", requiredLevel: 36, color: "hsl(200 100% 50%)", bgColor: "hsl(200 100% 15%)" },
  { id: "diamond", name: "Diamond", icon: Diamond, requiredRank: "B-Rank", requiredLevel: 45, color: "hsl(175 90% 45%)", bgColor: "hsl(175 90% 12%)" },
  { id: "heart", name: "Heart of Steel", icon: Heart, requiredRank: "A-Rank", requiredLevel: 51, color: "hsl(340 70% 55%)", bgColor: "hsl(340 70% 15%)" },
  { id: "sparkle", name: "Radiant", icon: Sparkles, requiredRank: "A-Rank", requiredLevel: 60, color: "hsl(280 100% 65%)", bgColor: "hsl(280 100% 18%)" },
  { id: "skull", name: "Shadow Lord", icon: Skull, requiredRank: "S-Rank", requiredLevel: 66, color: "hsl(260 70% 50%)", bgColor: "hsl(260 70% 12%)" },
  { id: "crown", name: "Monarch", icon: Crown, requiredRank: "SS-Rank", requiredLevel: 81, color: "hsl(45 100% 50%)", bgColor: "hsl(45 100% 12%)" },
];

// Unlockable titles with rank requirements
export interface UnlockableTitle {
  id: string;
  title: string;
  description: string;
  requiredRank: string;
  requiredLevel: number;
  color: string;
}

export const UNLOCKABLE_TITLES: UnlockableTitle[] = [
  { id: "novice", title: "Novice Hunter", description: "Just starting the journey", requiredRank: "E-Rank", requiredLevel: 1, color: "hsl(220 10% 60%)" },
  { id: "determined", title: "The Determined", description: "Shows promise", requiredRank: "E-Rank", requiredLevel: 3, color: "hsl(220 50% 55%)" },
  { id: "persistent", title: "The Persistent", description: "Never gives up", requiredRank: "E-Rank", requiredLevel: 7, color: "hsl(220 70% 55%)" },
  { id: "rising", title: "Rising Star", description: "Climbing the ranks", requiredRank: "D-Rank", requiredLevel: 11, color: "hsl(16 85% 58%)" },
  { id: "dedicated", title: "The Dedicated", description: "Committed to excellence", requiredRank: "D-Rank", requiredLevel: 16, color: "hsl(38 92% 50%)" },
  { id: "skilled", title: "Skilled Hunter", description: "Mastering the craft", requiredRank: "C-Rank", requiredLevel: 21, color: "hsl(45 100% 50%)" },
  { id: "veteran", title: "Battle Veteran", description: "Seasoned warrior", requiredRank: "C-Rank", requiredLevel: 28, color: "hsl(145 70% 45%)" },
  { id: "elite", title: "Elite Hunter", description: "Among the best", requiredRank: "B-Rank", requiredLevel: 36, color: "hsl(200 100% 50%)" },
  { id: "legendary", title: "The Legendary", description: "Stories are told", requiredRank: "B-Rank", requiredLevel: 45, color: "hsl(175 90% 45%)" },
  { id: "master", title: "Quest Master", description: "Unrivaled expertise", requiredRank: "A-Rank", requiredLevel: 51, color: "hsl(340 70% 55%)" },
  { id: "mythic", title: "Mythic Hunter", description: "Beyond mortal limits", requiredRank: "A-Rank", requiredLevel: 60, color: "hsl(280 100% 65%)" },
  { id: "supreme", title: "Supreme Hunter", description: "Peak of power", requiredRank: "S-Rank", requiredLevel: 66, color: "hsl(260 70% 50%)" },
  { id: "transcendent", title: "The Transcendent", description: "Surpassed all limits", requiredRank: "S-Rank", requiredLevel: 75, color: "hsl(280 100% 70%)" },
  { id: "godlike", title: "Godlike Hunter", description: "Power of the gods", requiredRank: "SS-Rank", requiredLevel: 81, color: "hsl(45 100% 55%)" },
  { id: "sovereign", title: "Shadow Sovereign", description: "Ruler of shadows", requiredRank: "SS-Rank", requiredLevel: 90, color: "hsl(280 100% 65%)" },
  { id: "national", title: "National Level Hunter", description: "Pride of the nation", requiredRank: "National", requiredLevel: 96, color: "hsl(45 100% 50%)" },
];

export function isAvatarUnlocked(avatar: UnlockableAvatar, currentLevel: number): boolean {
  return currentLevel >= avatar.requiredLevel;
}

export function isTitleUnlocked(title: UnlockableTitle, currentLevel: number): boolean {
  return currentLevel >= title.requiredLevel;
}

export function getUnlockedAvatars(currentLevel: number): UnlockableAvatar[] {
  return UNLOCKABLE_AVATARS.filter(a => isAvatarUnlocked(a, currentLevel));
}

export function getUnlockedTitles(currentLevel: number): UnlockableTitle[] {
  return UNLOCKABLE_TITLES.filter(t => isTitleUnlocked(t, currentLevel));
}

export function getAvatarById(id: string): UnlockableAvatar | undefined {
  return UNLOCKABLE_AVATARS.find(a => a.id === id);
}

export function getTitleById(id: string): UnlockableTitle | undefined {
  return UNLOCKABLE_TITLES.find(t => t.id === id);
}