import { NextRequest, NextResponse } from 'next/server'

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

export async function GET() {
  return NextResponse.json(mockHabits)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  const newHabit = {
    id: Math.random().toString(36).substr(2, 9),
    userId: '1',
    name: body.name,
    targetType: body.targetType,
    targetValue: body.targetValue,
    isActive: true
  }
  
  return NextResponse.json(newHabit)
}
