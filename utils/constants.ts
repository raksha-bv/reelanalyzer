export const API_ENDPOINTS = {
  ANALYZE: "/api/analyze",
  COMPARE: "/api/compare",
  USER: "/api/user",
  HEALTH: "/api/health",
} as const;

export const REEL_CATEGORIES = {
  BEAUTY: "beauty",
  TECH: "tech",
  FITNESS: "fitness",
  FOOD: "food",
  TRAVEL: "travel",
  LIFESTYLE: "lifestyle",
  MUSIC: "music",
  COMEDY: "comedy",
  GENERAL: "general",
} as const;

export const SENTIMENT_TYPES = {
  POSITIVE: "positive",
  NEGATIVE: "negative",
  NEUTRAL: "neutral",
} as const;

export const MAX_REELS_COMPARE = 5;
export const CACHE_DURATION_HOURS = 1;
export const MAX_COMMENTS_ANALYZE = 20;
