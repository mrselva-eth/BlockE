import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 })
  }

  try {
    const client = await clientPromise
    const db = client.db('blocke')
    const othersData = await db.collection('others').findOne({ address: address.toLowerCase() })

    if (!othersData) {
      return NextResponse.json({ loggedOut: false, visitedPages: [] })
    }

    return NextResponse.json({
      loggedOut: othersData.loggedOut || false,
      visitedPages: othersData.visitedPages || [],
    })
  } catch (error) {
    console.error('Error fetching others data:', error)
    return NextResponse.json({ error: 'Failed to fetch others data' }, { status: 500 })
  }
}

