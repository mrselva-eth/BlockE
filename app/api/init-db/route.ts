import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/initMongoDB'

export async function POST(request: Request) {
  try {
    await initializeDatabase()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to initialize database:', error)
    return NextResponse.json(
      { error: 'Failed to initialize database' },
      { status: 500 }
    )
  }
}

