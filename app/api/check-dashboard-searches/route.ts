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
    const searchesCollection = db.collection('searches')

    const searchDoc = await searchesCollection.findOne({ connectedAddress: address.toLowerCase() })

    if (!searchDoc) {
      return NextResponse.json({ count: 0 })
    }

    return NextResponse.json({ count: searchDoc.totalSearchedCount })
  } catch (error) {
    console.error('Error fetching search count:', error)
    return NextResponse.json({ error: 'Failed to fetch search count' }, { status: 500 })
  }
}

