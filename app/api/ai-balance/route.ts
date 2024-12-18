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
    return NextResponse.json({ balance: user?.balance || 0 })
  } catch (error) {
    console.error('Error in getAIBalance:', error)
    return NextResponse.json({ error: 'Failed to fetch AI balance' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { address, newBalance } = await request.json()

  if (!address || newBalance === undefined) {
    return NextResponse.json({ error: 'Address and new balance are required' }, { status: 400 })
  }

  try {
    const client = await clientPromise
    const db = client.db('blocke')
    await db.collection('users').updateOne(
      { address: address.toLowerCase() },
      { 
        $set: { 
          address: address.toLowerCase(),
          balance: newBalance,
          lastUpdated: new Date()
        }
      },
      { upsert: true }
    )
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in updateAIBalance:', error)
    return NextResponse.json({ error: 'Failed to update AI balance' }, { status: 500 })
  }
}

