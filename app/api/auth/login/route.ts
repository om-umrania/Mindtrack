import { NextRequest, NextResponse } from 'next/server'

// Mock data
const mockUser = {
  id: '1',
  name: 'Demo User',
  email: 'demo@example.com'
}

const mockHabits = [
  {
    id: '1',
    userId: '1',
    name: 'Drink Water',
    targetType: 'count' as const,
    targetValue: 8,
    isActive: true
  },
  {
    id: '2',
    userId: '1',
    name: 'Exercise',
    targetType: 'boolean' as const,
    targetValue: 1,
    isActive: true
  },
  {
    id: '3',
    userId: '1',
    name: 'Read',
    targetType: 'duration' as const,
    targetValue: 30,
    isActive: true
  }
]

const mockSummary = {
  window: '7' as const,
  completionPct: 75,
  currentStreaks: [
    { habitId: '1', days: 5 },
    { habitId: '2', days: 3 }
  ],
  heatmap: [
    { date: '2024-01-01', value: 1 },
    { date: '2024-01-02', value: 0.8 },
    { date: '2024-01-03', value: 0.6 }
  ],
  leaderboard: [
    { habitId: '1', adherence: 85 },
    { habitId: '2', adherence: 70 },
    { habitId: '3', adherence: 60 }
  ]
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  return NextResponse.json(mockUser)
}
