import { NextResponse } from 'next/server'
import { migrateToNewSchema } from '@/lib/migrationUtils'

export async function POST() {
  try {
    await migrateToNewSchema()
    return NextResponse.json({ success: true, message: 'Migration completed successfully' })
  } catch (error) {
    console.error('Migration failed:', error)
    return NextResponse.json(
      { success: false, error: 'Migration failed' },
      { status: 500 }
    )
  }
}

