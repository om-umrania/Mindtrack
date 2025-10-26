import { NextResponse } from 'next/server'

const mockRecommendations = [
  {
    id: '1',
    userId: '1',
    createdAt: new Date().toISOString(),
    habitName: 'Meditation',
    rationale: 'Based on your reading habit, meditation could help improve focus and reduce stress.'
  },
  {
    id: '2',
    userId: '1',
    createdAt: new Date().toISOString(),
    habitName: 'Walking',
    rationale: 'Since you exercise regularly, adding daily walks could improve your overall fitness.'
  },
  {
    id: '3',
    userId: '1',
    createdAt: new Date().toISOString(),
    habitName: 'Journaling',
    rationale: 'Writing daily reflections could complement your reading habit and boost mental clarity.'
  }
]

export async function GET() {
  return NextResponse.json(mockRecommendations)
}
