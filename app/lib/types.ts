export type TargetType = 'boolean' | 'count' | 'duration';

export interface User { 
  id: string; 
  name: string; 
  email: string; 
}

export interface Habit {
  id: string; 
  userId: string; 
  name: string;
  targetType: TargetType; 
  targetValue: number; 
  isActive: boolean;
}

export interface Checkin {
  id: string; 
  habitId: string; 
  date: string; // YYYY-MM-DD
  value: number; // 1 for boolean, integer for counts/duration
}

export interface Nudge {
  id: string; 
  userId: string; 
  createdAt: string;
  channel: 'inapp' | 'email';
  message: string; 
  context: Record<string, unknown>;
}

export interface Recommendation {
  id: string; 
  userId: string; 
  createdAt: string;
  habitName: string; 
  rationale: string;
}

export interface Summary {
  window: '7' | '28' | 'all';
  completionPct: number;
  currentStreaks: Array<{ habitId: string; days: number }>;
  heatmap: Array<{ date: string; value: number }>;
  leaderboard: Array<{ habitId: string; adherence: number }>;
}

export interface LoginRequest {
  email: string;
}

export interface CreateHabitRequest {
  name: string;
  targetType: TargetType;
  targetValue: number;
}

export interface UpsertCheckinsRequest {
  items: Array<{ habitId: string; value: number }>;
}

export interface NudgeRequest {
  context: Record<string, unknown>;
}
