import { 
  User, 
  Habit, 
  Summary, 
  Nudge, 
  Recommendation,
  LoginRequest,
  CreateHabitRequest,
  UpsertCheckinsRequest,
  NudgeRequest
} from './types';

const j = (r: Response) => (r.ok ? r.json() : r.text().then(t => { throw new Error(t); }));

export const api = {
  login: (email: string) =>
    fetch('/api/auth/login', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email } as LoginRequest) 
    }).then(j) as Promise<User>,

  getHabits: () =>
    fetch('/api/habits').then(j) as Promise<Habit[]>,

  createHabit: (h: CreateHabitRequest) =>
    fetch('/api/habits', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(h) 
    }).then(j) as Promise<Habit>,

  upsertTodayCheckins: (items: UpsertCheckinsRequest['items']) =>
    fetch('/api/checkins', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items } as UpsertCheckinsRequest) 
    }).then(j) as Promise<void>,

  summary: (window: '7' | '28' | 'all') =>
    fetch(`/api/analytics/summary?window=${window}`).then(j) as Promise<Summary>,

  nudge: (context: Record<string, unknown>) =>
    fetch('/api/ai/nudge', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context } as NudgeRequest) 
    }).then(j) as Promise<Nudge>,

  recommendations: () =>
    fetch('/api/ai/recommendations').then(j) as Promise<Recommendation[]>,
};
