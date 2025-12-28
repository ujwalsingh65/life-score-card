import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Lock, User, Tag } from "lucide-react";
import { 
  UNLOCKABLE_AVATARS, 
  UNLOCKABLE_TITLES, 
  isAvatarUnlocked, 
  isTitleUnlocked,
  UnlockableAvatar,
  UnlockableTitle 
} from "@/lib/customization";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

interface ProfileCustomizationProps {
  currentLevel: number;
  selectedAvatarId: string;
  selectedTitleId: string;
  onSave: (avatarId: string, titleId: string) => void;
  saving?: boolean;
}

export function ProfileCustomization({
  currentLevel,
  selectedAvatarId,
  selectedTitleId,
  onSave,
  saving = false,
}: ProfileCustomizationProps) {
  const [tempAvatarId, setTempAvatarId] = useState(selectedAvatarId);
  const [tempTitleId, setTempTitleId] = useState(selectedTitleId);

  const hasChanges = tempAvatarId !== selectedAvatarId || tempTitleId !== selectedTitleId;

  const handleSave = () => {
    onSave(tempAvatarId, tempTitleId);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="avatars" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-secondary/50 border border-primary/20">
          <TabsTrigger value="avatars" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <User className="h-4 w-4" />
            Avatars
          </TabsTrigger>
          <TabsTrigger value="titles" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Tag className="h-4 w-4" />
            Titles
          </TabsTrigger>
        </TabsList>

        {/* Avatars Tab */}
        <TabsContent value="avatars" className="mt-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {UNLOCKABLE_AVATARS.map((avatar, index) => {
              const unlocked = isAvatarUnlocked(avatar, currentLevel);
              const selected = tempAvatarId === avatar.id;
              const Icon = avatar.icon;

              return (
                <motion.button
                  key={avatar.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => unlocked && setTempAvatarId(avatar.id)}
                  disabled={!unlocked}
                  className={cn(
                    "relative flex flex-col items-center p-3 rounded-xl border transition-all",
                    unlocked
                      ? selected
                        ? "border-primary bg-primary/20 shadow-[0_0_15px_hsla(215,100%,55%,0.3)]"
                        : "border-primary/30 bg-secondary/30 hover:bg-secondary/50 hover:border-primary/50"
                      : "border-muted/30 bg-muted/10 opacity-50 cursor-not-allowed"
                  )}
                >
                  {/* Avatar Icon */}
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center mb-2",
                      unlocked ? "" : "grayscale"
                    )}
                    style={{ 
                      backgroundColor: avatar.bgColor,
                      boxShadow: selected && unlocked ? `0 0 15px ${avatar.color}50` : undefined
                    }}
                  >
                    <Icon className="h-6 w-6" style={{ color: avatar.color }} />
                  </div>

                  {/* Name */}
                  <span className={cn(
                    "text-xs font-medium text-center",
                    unlocked ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {avatar.name}
                  </span>

                  {/* Level requirement */}
                  <span className="text-[10px] text-muted-foreground">
                    Lv. {avatar.requiredLevel}
                  </span>

                  {/* Lock/Selected indicator */}
                  {!unlocked ? (
                    <div className="absolute top-1 right-1">
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    </div>
                  ) : selected ? (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  ) : null}
                </motion.button>
              );
            })}
          </div>
        </TabsContent>

        {/* Titles Tab */}
        <TabsContent value="titles" className="mt-4">
          <div className="grid gap-2 max-h-[400px] overflow-y-auto pr-2">
            {UNLOCKABLE_TITLES.map((title, index) => {
              const unlocked = isTitleUnlocked(title, currentLevel);
              const selected = tempTitleId === title.id;

              return (
                <motion.button
                  key={title.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => unlocked && setTempTitleId(title.id)}
                  disabled={!unlocked}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-all text-left",
                    unlocked
                      ? selected
                        ? "border-primary bg-primary/20"
                        : "border-primary/20 bg-secondary/30 hover:bg-secondary/50"
                      : "border-muted/20 bg-muted/10 opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn("font-bold", unlocked ? "" : "text-muted-foreground")}
                        style={{ color: unlocked ? title.color : undefined }}
                      >
                        {title.title}
                      </span>
                      {selected && unlocked && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{title.description}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Lv. {title.requiredLevel}</span>
                    {!unlocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end"
        >
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary hover:bg-primary/90"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </motion.div>
      )}
    </div>
  );
}