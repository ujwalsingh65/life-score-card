import { useEffect, useState, useCallback, useRef } from "react";
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

export function usePushNotifications() {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [appId, setAppId] = useState<string | null>(null);
  const initializingRef = useRef(false);

  // Fetch OneSignal App ID from backend
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("get-onesignal-config");
        
        if (error) {
          console.log("OneSignal config not available:", error);
          setIsLoading(false);
          return;
        }

        if (data?.appId) {
          setAppId(data.appId);
        } else {
          console.log("OneSignal App ID not configured");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch OneSignal config:", error);
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, []);

  // Initialize OneSignal once we have the App ID
  useEffect(() => {
    if (!appId || initializingRef.current) return;

    // Check if push is supported
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      console.log("Push notifications not supported");
      setIsLoading(false);
      return;
    }

    setIsSupported(true);
    initializingRef.current = true;

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
            appId: appId,
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
          });

          setIsLoading(false);
        } catch (error) {
          console.error("Failed to initialize OneSignal:", error);
          setIsLoading(false);
        }
      });
    };
    
    script.onerror = () => {
      console.error("Failed to load OneSignal SDK");
      setIsLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [appId]);

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
    if (user && isSubscribed && !isLoading) {
      registerPlayerId();
    }
  }, [user, isSubscribed, isLoading, registerPlayerId]);

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
