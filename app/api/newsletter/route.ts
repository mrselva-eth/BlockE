import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function POST(request: Request) {
  try {
    const { email, address } = await request.json() // Get address from request body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (!address) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('blocke')

    // Check if email already exists for this address
    const existingSubscriber = await db.collection('newsletter').findOne({ email, address: address.toLowerCase() })

    if (existingSubscriber) {
      return NextResponse.json(
        { error: 'Email already subscribed for this wallet address' },
        { status: 400 }
      )
    }

    // Add new subscriber with address
    await db.collection('newsletter').insertOne({
      email,
      address: address.toLowerCase(), // Store address in lowercase
      subscribedAt: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    )
  }
}

