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
  const initRef = useRef(false);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  // Fetch OneSignal App ID from backend
  useEffect(() => {
    let mounted = true;

    const fetchConfig = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("get-onesignal-config");
        
        if (!mounted) return;
        
        if (error || !data?.appId) {
          console.log("OneSignal config not available");
          setIsLoading(false);
          return;
        }

        setAppId(data.appId);
      } catch (error) {
        console.error("Failed to fetch OneSignal config:", error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchConfig();

    return () => {
      mounted = false;
    };
  }, []);

  // Initialize OneSignal once we have the App ID
  useEffect(() => {
    if (!appId || initRef.current) return;

    // Check if push is supported
    if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
      console.log("Push notifications not supported");
      setIsLoading(false);
      return;
    }

    setIsSupported(true);
    initRef.current = true;

    // Load OneSignal SDK with SRI for supply chain security
    const script = document.createElement("script");
    script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    // Note: SRI hash should be updated if OneSignal SDK version changes
    // This provides protection against CDN compromise attacks
    script.crossOrigin = "anonymous";
    script.defer = true;
    scriptRef.current = script;

    script.onload = () => {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async function(OneSignal) {
        if (!OneSignal) {
          setIsLoading(false);
          return;
        }
        
        try {
          await OneSignal.init({
            appId: appId,
            allowLocalhostAsSecureOrigin: true,
            notifyButton: { enable: false },
          });

          const enabled = await OneSignal.isPushNotificationsEnabled();
          setIsSubscribed(enabled);
          setIsLoading(false);

          OneSignal.on("subscriptionChange", (subscribed: boolean) => {
            setIsSubscribed(subscribed);
          });
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
      if (scriptRef.current?.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
      }
    };
  }, [appId]);

  // Register player ID with backend when subscribed
  useEffect(() => {
    if (!user || !isSubscribed || isLoading || !window.OneSignal) return;

    const registerPlayer = async () => {
      try {
        const playerId = await window.OneSignal?.getUserId();
        if (!playerId) return;

        console.log("Registering player ID:", playerId);
        await supabase.functions.invoke("register-push-token", {
          body: { playerId },
        });
        console.log("Push token registered successfully");
      } catch (error) {
        console.error("Error registering player ID:", error);
      }
    };

    registerPlayer();
  }, [user, isSubscribed, isLoading]);

  // Request permission
  const requestPermission = useCallback(async () => {
    if (!window.OneSignal) return false;

    try {
      await window.OneSignal.showSlidedownPrompt();
      const enabled = await window.OneSignal.isPushNotificationsEnabled();
      setIsSubscribed(enabled);
      return enabled;
    } catch (error) {
      console.error("Failed to request permission:", error);
      return false;
    }
  }, []);

  // Toggle subscription
  const toggleSubscription = useCallback(async () => {
    if (!window.OneSignal) {
      console.log("OneSignal not initialized");
      return;
    }

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
