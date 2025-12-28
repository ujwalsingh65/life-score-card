import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

declare global {
  interface Window {
    OneSignal?: {
      init: (config: {
        appId: string;
        allowLocalhostAsSecureOrigin?: boolean;
        notifyButton?: { enable: boolean };
      }) => Promise<void>;
      getUserId: () => Promise<string | null>;
      isPushNotificationsEnabled: () => Promise<boolean>;
      setSubscription: (enabled: boolean) => Promise<void>;
      showSlidedownPrompt: () => Promise<void>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
    };
    OneSignalDeferred?: ((OneSignal: Window["OneSignal"]) => void)[];
  }
}

const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID;

export function usePushNotifications() {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize OneSignal
  useEffect(() => {
    if (!ONESIGNAL_APP_ID) {
      console.log("OneSignal App ID not configured");
      setIsLoading(false);
      return;
    }

    // Check if push is supported
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      console.log("Push notifications not supported");
      setIsLoading(false);
      return;
    }

    setIsSupported(true);

    // Load OneSignal SDK
    const script = document.createElement("script");
    script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    script.defer = true;
    script.onload = async () => {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async function(OneSignal) {
        if (!OneSignal) return;
        
        try {
          await OneSignal.init({
            appId: ONESIGNAL_APP_ID,
            allowLocalhostAsSecureOrigin: true,
            notifyButton: {
              enable: false,
            },
          });

          // Check subscription status
          const enabled = await OneSignal.isPushNotificationsEnabled();
          setIsSubscribed(enabled);

          // Listen for subscription changes
          OneSignal.on("subscriptionChange", async (isSubscribed: boolean) => {
            setIsSubscribed(isSubscribed);
            if (isSubscribed && user) {
              await registerPlayerId();
            }
          });

          setIsLoading(false);
        } catch (error) {
          console.error("Failed to initialize OneSignal:", error);
          setIsLoading(false);
        }
      });
    };
    
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Register player ID with backend
  const registerPlayerId = useCallback(async () => {
    if (!window.OneSignal || !user) return;

    try {
      const playerId = await window.OneSignal.getUserId();
      if (!playerId) {
        console.log("No player ID available");
        return;
      }

      console.log("Registering player ID:", playerId);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase.functions.invoke("register-push-token", {
        body: { playerId },
      });

      if (error) {
        console.error("Failed to register push token:", error);
      } else {
        console.log("Push token registered successfully");
      }
    } catch (error) {
      console.error("Error registering player ID:", error);
    }
  }, [user]);

  // Register when user logs in and is subscribed
  useEffect(() => {
    if (user && isSubscribed) {
      registerPlayerId();
    }
  }, [user, isSubscribed, registerPlayerId]);

  // Request permission
  const requestPermission = useCallback(async () => {
    if (!window.OneSignal) return false;

    try {
      await window.OneSignal.showSlidedownPrompt();
      const enabled = await window.OneSignal.isPushNotificationsEnabled();
      setIsSubscribed(enabled);
      
      if (enabled) {
        await registerPlayerId();
      }
      
      return enabled;
    } catch (error) {
      console.error("Failed to request permission:", error);
      return false;
    }
  }, [registerPlayerId]);

  // Toggle subscription
  const toggleSubscription = useCallback(async () => {
    if (!window.OneSignal) return;

    try {
      if (isSubscribed) {
        await window.OneSignal.setSubscription(false);
        setIsSubscribed(false);
      } else {
        await requestPermission();
      }
    } catch (error) {
      console.error("Failed to toggle subscription:", error);
    }
  }, [isSubscribed, requestPermission]);

  return {
    isSubscribed,
    isSupported,
    isLoading,
    requestPermission,
    toggleSubscription,
  };
}
