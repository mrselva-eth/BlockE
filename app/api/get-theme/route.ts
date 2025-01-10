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

    const user = await db.collection('users').findOne({ address: address.toLowerCase() })

    if (user && user.theme) {
      return NextResponse.json({ theme: user.theme })
    } else {
      return NextResponse.json({ theme: 'light' }) // Default theme
    }
  } catch (error) {
    console.error('Error fetching theme:', error)
    return NextResponse.json({ error: 'Failed to fetch theme' }, { status: 500 })
  }
}

