import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface FixedTimeContextType {
  isFixedTimeMode: boolean;
  setFixedTimeMode: (enabled: boolean) => void;
}

const FixedTimeContext = createContext<FixedTimeContextType | undefined>(undefined);

export function FixedTimeProvider({ children }: { children: ReactNode }) {
  const [isFixedTimeMode, setIsFixedTimeMode] = useState(() => {
    const stored = localStorage.getItem("pipo-fixed-time-mode");
    return stored === "true";
  });

  useEffect(() => {
    localStorage.setItem("pipo-fixed-time-mode", String(isFixedTimeMode));
  }, [isFixedTimeMode]);

  const setFixedTimeMode = (enabled: boolean) => {
    setIsFixedTimeMode(enabled);
  };

  return (
    <FixedTimeContext.Provider value={{ isFixedTimeMode, setFixedTimeMode }}>
      {children}
    </FixedTimeContext.Provider>
  );
}

export function useFixedTime() {
  const context = useContext(FixedTimeContext);
  if (context === undefined) {
    throw new Error("useFixedTime must be used within a FixedTimeProvider");
  }
  return context;
}
