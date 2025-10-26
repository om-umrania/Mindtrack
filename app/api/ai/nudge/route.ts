import { NextRequest, NextResponse } from 'next/server'

const mockNudges = [
  "Great job on your consistency! Keep up the momentum! 🔥",
  "Remember: small steps lead to big changes. You've got this! 💪",
  "Your streak is looking strong! Don't break it now! ⚡",
  "Consistency beats perfection every time. Keep going! 🌟",
  "Every habit check-in is a win. Celebrate your progress! 🎉"
]

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  const randomNudge = mockNudges[Math.floor(Math.random() * mockNudges.length)]
  
  const nudge = {
    id: Math.random().toString(36).substr(2, 9),
    userId: '1',
    createdAt: new Date().toISOString(),
    channel: 'inapp' as const,
    message: randomNudge,
    context: body.context
  }
  
  return NextResponse.json(nudge)
}
