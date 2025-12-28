import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, User, Save, Loader2 } from "lucide-react";
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
import { calculatePlayerStats } from "@/lib/xp";
import { getAvatarById, getTitleById } from "@/lib/customization";

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

      // Fetch player stats for level
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

      setIsFetching(false);
    };

    fetchProfile();
  }, [user, navigate]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
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

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

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

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-primary/20">
        <div className="container max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold font-display text-primary">HUNTER PROFILE</h1>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Profile Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-primary/20 bg-card">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4">
                {/* Avatar Display */}
                <div className="relative">
                  {avatarUrl ? (
                    <Avatar className="h-24 w-24 border-4" style={{ borderColor: selectedAvatar?.color || "hsl(var(--primary))" }}>
                      <AvatarImage src={avatarUrl} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <User className="h-10 w-10" />
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div
                      className="h-24 w-24 rounded-full flex items-center justify-center border-4"
                      style={{ 
                        backgroundColor: selectedAvatar?.bgColor || "hsl(var(--secondary))",
                        borderColor: selectedAvatar?.color || "hsl(var(--primary))",
                        boxShadow: `0 0 20px ${selectedAvatar?.color || "hsl(var(--primary))"}40`
                      }}
                    >
                      <AvatarIcon className="h-12 w-12" style={{ color: selectedAvatar?.color }} />
                    </div>
                  )}
                  <button
                    onClick={handleAvatarClick}
                    disabled={isUploading}
                    className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
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
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {/* Name and Title */}
                <div className="text-center">
                  <h2 className="text-xl font-bold text-foreground">
                    {displayName || "Anonymous Hunter"}
                  </h2>
                  <p 
                    className="font-semibold"
                    style={{ color: selectedTitle?.color }}
                  >
                    {selectedTitle?.title || "Novice Hunter"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Level {playerStats.level} • {playerStats.rank}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Basic Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-primary/20 bg-card">
            <CardHeader>
              <CardTitle className="text-primary">Basic Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                  maxLength={50}
                />
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="w-full"
              >
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
          <Card className="border-primary/20 bg-card">
            <CardHeader>
              <CardTitle className="text-primary">Customize Your Hunter</CardTitle>
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
      </main>
    </div>
  );
}
