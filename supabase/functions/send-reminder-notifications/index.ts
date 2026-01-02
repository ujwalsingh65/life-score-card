import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate CRON_SECRET for authentication
    const CRON_SECRET = Deno.env.get("CRON_SECRET");
    if (!CRON_SECRET) {
      console.error("CRON_SECRET not configured");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for authorization header with cron secret
    const authHeader = req.headers.get("authorization");
    const providedSecret = authHeader?.replace("Bearer ", "");
    
    if (providedSecret !== CRON_SECRET) {
      console.error("Unauthorized: Invalid or missing cron secret");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ONESIGNAL_APP_ID = Deno.env.get("ONESIGNAL_APP_ID");
    const ONESIGNAL_REST_API_KEY = Deno.env.get("ONESIGNAL_REST_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
      throw new Error("OneSignal credentials not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get current time (HH:MM format)
    const now = new Date();
    const currentHour = now.getUTCHours().toString().padStart(2, "0");
    const currentMinute = now.getUTCMinutes().toString().padStart(2, "0");
    const currentTime = `${currentHour}:${currentMinute}:00`;
    
    console.log(`Checking for reminders at ${currentTime} UTC`);

    // Get habits with reminders set for current time
    const { data: habits, error: habitsError } = await supabase
      .from("habits")
      .select(`
        id,
        name,
        icon,
        user_id,
        target_days,
        reminder_time
      `)
      .not("reminder_time", "is", null);

    if (habitsError) {
      console.error("Error fetching habits:", habitsError);
      throw habitsError;
    }

    console.log(`Found ${habits?.length || 0} habits with reminders`);

    // Filter habits that match current time and day
    const currentDayOfWeek = now.getUTCDay();
    const habitsToNotify = habits?.filter((habit) => {
      const reminderTime = habit.reminder_time;
      // Check if reminder time matches (within the same minute)
      const timeMatches = reminderTime?.startsWith(`${currentHour}:${currentMinute}`);
      // Check if today is a target day
      const dayMatches = habit.target_days?.includes(currentDayOfWeek);
      return timeMatches && dayMatches;
    }) || [];

    console.log(`${habitsToNotify.length} habits to notify`);

    // Get user profiles with OneSignal player IDs
    const userIds = [...new Set(habitsToNotify.map((h) => h.user_id))];
    
    if (userIds.length === 0) {
      return new Response(
        JSON.stringify({ message: "No notifications to send", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, onesignal_player_id")
      .in("id", userIds)
      .not("onesignal_player_id", "is", null);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    const playerIdMap = new Map(
      profiles?.map((p) => [p.id, p.onesignal_player_id]) || []
    );

    // Send notifications
    let sentCount = 0;
    for (const habit of habitsToNotify) {
      const playerId = playerIdMap.get(habit.user_id);
      if (!playerId) {
        console.log(`No player ID for user ${habit.user_id}`);
        continue;
      }

      const response = await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${ONESIGNAL_REST_API_KEY}`,
        },
        body: JSON.stringify({
          app_id: ONESIGNAL_APP_ID,
          include_player_ids: [playerId],
          headings: { en: "Quest Reminder 🎯" },
          contents: { en: `${habit.icon} Time to complete: ${habit.name}` },
          url: Deno.env.get("SITE_URL") || "https://lovable.dev",
        }),
      });

      if (response.ok) {
        sentCount++;
        console.log(`Sent notification for habit ${habit.id} to player ${playerId}`);
      } else {
        const errorText = await response.text();
        console.error(`Failed to send notification: ${errorText}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        message: "Notifications processed", 
        sent: sentCount,
        total: habitsToNotify.length 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-reminder-notifications:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
