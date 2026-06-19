export const COLORS = {
  // Background
  bg: "#0A0A0F",
  bgCard: "#12121A",
  bgElevated: "#1A1A26",

  // Brand
  primary: "#6C63FF",
  primaryLight: "#8B85FF",
  primaryDark: "#4A43CC",
  accent: "#FF6B6B",
  success: "#4ADE80",
  warning: "#FBBF24",

  // Text
  textPrimary: "#F0EFFF",
  textSecondary: "#8B8BA8",
  textMuted: "#4A4A6A",

  // Borders
  border: "#1E1E30",
  borderLight: "#2A2A40",
};

export const LEVEL_NAMES = [
  "Distracted Goblin",
  "Occasional Human",
  "Weekend Warrior",
  "Focus Apprentice",
  "Decent Attempter",
  "Consistently Less Trash",
  "Grind Activating",
  "Certified Focused",
  "Academic Weapon",
  "Sigma Study Mode",
  "Peak Specimen",
];

export const getLevelName = (level) =>
  LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)];

export const getXPForNextLevel = (level) => level * 500;
export const getXPProgress = (totalXP, level) => {
  const base = (level - 1) * 500;
  const next = level * 500;
  return ((totalXP - base) / (next - base)) * 100;
};

export const FONT = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 40,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};
