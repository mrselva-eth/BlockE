import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')
  const preference = searchParams.get('preference')

  if (!address || !preference) {
    return NextResponse.json({ error: 'Address and preference are required' }, { status: 400 })
  }

  try {
    const client = await clientPromise
    const db = client.db('blocke')
    const collection = db.collection('others')

    const user = await collection.findOne({ address: address.toLowerCase() })

    if (user && user[preference as keyof typeof user] !== undefined) {
      return NextResponse.json({ exists: true })
    } else {
      return NextResponse.json({ exists: false })
    }
  } catch (error) {
    console.error(`Error checking preference ${preference}:`, error)
    return NextResponse.json({ error: 'Failed to check preference' }, { status: 500 })
  }
}

