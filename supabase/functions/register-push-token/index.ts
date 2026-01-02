import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// Allowed origins for CORS - restrict to known domains
const allowedOrigins = [
  "https://lovable.dev",
  "https://fdljfwseyawrcgcloysn.lovableproject.com",
  "http://localhost:5173",
  "http://localhost:4173",
  "http://localhost:8080",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Credentials": "true",
  };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Create Supabase client with user's JWT
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get user from JWT
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { playerId } = await req.json();

    // Validate playerId is present and is a string
    if (!playerId || typeof playerId !== "string") {
      throw new Error("Player ID is required");
    }

    // OneSignal player IDs are UUIDs (8-4-4-4-12 format)
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_REGEX.test(playerId)) {
      console.error(`Invalid player ID format received`);
      throw new Error("Invalid player ID format");
    }

    // Additional length check for safety
    if (playerId.length > 100) {
      throw new Error("Player ID too long");
    }

    // Update the user's profile with the OneSignal player ID
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ 
        onesignal_player_id: playerId,
        updated_at: new Date().toISOString() 
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating profile:", updateError);
      throw updateError;
    }

    // Successfully registered player ID

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in register-push-token:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: errorMessage === "Unauthorized" ? 401 : 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
