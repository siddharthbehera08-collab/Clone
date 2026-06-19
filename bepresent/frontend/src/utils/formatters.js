export const formatTime = (seconds) => {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
};

export const formatMinutes = (minutes) => {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

export const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const formatDayLabel = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "short" }).charAt(0);
};

export const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

export const xpToNextLevel = (level) => level * 500;
export const xpProgress = (totalXP, level) => {
  const base = (level - 1) * 500;
  const cap = level * 500;
  return Math.min(100, Math.floor(((totalXP - base) / (cap - base)) * 100));
};
