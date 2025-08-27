export interface DemoResponse {
  message: string;
}

export interface Pick {
  id: string;
  player: string;
  propType: string;
  line: number;
  side: "Over" | "Under";
  game: string;
  tipoff: string;
  analysis: string;
  confidence: number;
  odds?: string;
  sportsbook?: string;
  sport?: string;
}

export interface PremiumPick extends Pick {
  analytics?: string;
  stakePercent: number;
  result: "Pending" | "Win" | "Loss";
}

export interface UserRole {
  clerkUserId: string;
  role: "admin" | "premium" | null;
  createdAt?: string;
}

export interface CreatePickRequest {
  sportCode: string;
  gameId?: string;
  tier: "free" | "premium";
  player: string;
  propType: string;
  propLine: number;
  side: "Over" | "Under";
  analysisShort: string;
  analysisLong?: string;
  confidencePct?: number;
  stakePct?: number;
  odds?: string;
  sportsbook?: string;
  createdByUserId: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
