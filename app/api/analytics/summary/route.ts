import { NextRequest, NextResponse } from 'next/server'

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const window = searchParams.get('window') as '7' | '28' | 'all' || '7'
  
  return NextResponse.json({
    ...mockSummary,
    window
  })
}
