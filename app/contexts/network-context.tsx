import * as Network from "expo-network";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";

type NetworkContextValue = {
  isOnline: boolean;
};

const NetworkContext = createContext<NetworkContextValue | undefined>(undefined);

export const NetworkProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(() =>
    Platform.OS === "web" && typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }

    let active = true;
    void Network.getNetworkStateAsync().then((state) => {
      if (active && state.isConnected !== undefined) setIsOnline(state.isConnected);
    });
    const subscription = Network.addNetworkStateListener((state) => {
      if (state.isConnected !== undefined) setIsOnline(state.isConnected);
    });
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  const value = useMemo(() => ({ isOnline }), [isOnline]);
  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
};

export const useNetwork = () => {
  const value = useContext(NetworkContext);
  if (!value) throw new Error("useNetwork must be used within NetworkProvider");
  return value;
};
