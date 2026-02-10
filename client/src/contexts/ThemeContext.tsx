import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeColors = {
  primary: string;
  accent: string;
};

export type ThemeMode = "light" | "dark";

type ThemeContextType = {
  colors: ThemeColors;
  themeMode: ThemeMode;
  updateColors: (newColors: Partial<ThemeColors>) => void;
  setThemeMode: (mode: ThemeMode) => void;
  resetColors: () => void;
};

// Use Hex for color input compatibility
const defaultColors: ThemeColors = {
  primary: "#3b82f6", // Approximate of hsl(221, 83%, 53%)
  accent: "#f472b6", // Approximate of hsl(330, 85%, 65%)
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("pipo-theme-mode");
    if (saved === "dark" || saved === "light") return saved;
    
    return "light";
  });

  const [colors, setColors] = useState<ThemeColors>(() => {
    const saved = localStorage.getItem("pipo-custom-colors");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure we migrate from old HSL strings if they exist
        if (parsed.primary?.startsWith("hsl") || parsed.accent?.startsWith("hsl")) {
          return defaultColors;
        }
        return parsed;
      } catch (e) {
        return defaultColors;
      }
    }
    return defaultColors;
  });

  useEffect(() => {
    const root = document.documentElement;
    
    if (themeMode === "dark") {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
      root.style.setProperty("--app-background", "#0B0F14");
      root.style.setProperty("--background", "215 32% 6%"); // #0B0F14
      root.style.setProperty("--foreground", "220 14% 91%"); // #E5E7EB
      root.style.setProperty("--bg-main", "#0B0F14");
      root.style.setProperty("--bg-surface", "#111827");
      root.style.setProperty("--bg-card", "#1F2933");
      root.style.setProperty("--border-color", "#2E3440");
      root.style.setProperty("--text-main", "#E5E7EB");
      root.style.setProperty("--text-muted", "#9CA3AF");
      root.style.setProperty("--primary-color", "#6366F1");
      root.style.setProperty("--hover-color", "#4F46E5");

      root.style.setProperty("--card", "210 22% 16%"); // #1F2933
      root.style.setProperty("--card-foreground", "220 14% 91%"); // #E5E7EB
      root.style.setProperty("--popover", "210 22% 16%");
      root.style.setProperty("--popover-foreground", "220 14% 91%");
      root.style.setProperty("--secondary", "222 21% 11%"); // #111827 - Surface
      root.style.setProperty("--secondary-foreground", "220 14% 91%");
      root.style.setProperty("--muted", "222 21% 11%");
      root.style.setProperty("--muted-foreground", "215 14% 65%"); // #9CA3AF
      root.style.setProperty("--accent", hexToHsl(colors.accent));
      root.style.setProperty("--accent-foreground", "0 0% 100%");
      root.style.setProperty("--border", "220 16% 22%"); // #2E3440
      root.style.setProperty("--input", "220 16% 22%");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
      root.style.setProperty("--app-background", "#FFFFFF");
      root.style.setProperty("--background", "220 30% 98%");
      root.style.setProperty("--foreground", "0 0% 0%");
      root.style.setProperty("--bg-main", "#FFFFFF");
      root.style.setProperty("--bg-surface", "#F9FAFB");
      root.style.setProperty("--bg-card", "#FFFFFF");
      root.style.setProperty("--border-color", "#E5E7EB");
      root.style.setProperty("--text-main", "#111827");
      root.style.setProperty("--text-muted", "#6B7280");
      root.style.setProperty("--primary-color", "#6366F1");
      root.style.setProperty("--hover-color", "#4F46E5");
    }

    root.style.setProperty("--primary", hexToHsl(colors.primary));
    root.style.setProperty("--ring", hexToHsl(colors.primary));
    root.style.setProperty("--chart-1", hexToHsl(colors.primary));
    root.style.setProperty("--sidebar-primary", hexToHsl(colors.primary));
    root.style.setProperty("--sidebar-ring", hexToHsl(colors.primary));
    
    root.style.setProperty("--accent", hexToHsl(colors.accent));
    root.style.setProperty("--chart-4", hexToHsl(colors.accent));
    
    localStorage.setItem("pipo-custom-colors", JSON.stringify(colors));
    localStorage.setItem("pipo-theme-mode", themeMode);
  }, [colors, themeMode]);

  const updateColors = (newColors: Partial<ThemeColors>) => {
    setColors((prev) => ({ ...prev, ...newColors }));
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
  };

  const resetColors = () => {
    setColors(defaultColors);
  };

  return (
    <ThemeContext.Provider value={{ colors, themeMode, updateColors, setThemeMode, resetColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Helper to convert hex to HSL format for CSS variables
function hexToHsl(hex: string): string {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
