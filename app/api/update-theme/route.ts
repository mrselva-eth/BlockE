import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function POST(request: Request) {
  try {
    const { address, theme } = await request.json()

    if (!address || !theme) {
      return NextResponse.json({ error: 'Address and theme are required' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('blocke')

    await db.collection('others').updateOne( // Update collection name
      { address: address.toLowerCase() },
      { $set: { address: address.toLowerCase(), theme } }, // Include address in the update
      { upsert: true }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating theme:', error)
    return NextResponse.json({ error: 'Failed to update theme' }, { status: 500 })
  }
}

