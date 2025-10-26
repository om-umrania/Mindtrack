import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  // Mock successful check-in
  console.log('Check-ins received:', body.items)
  
  return NextResponse.json({ success: true })
}
