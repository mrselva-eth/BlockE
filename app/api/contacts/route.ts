import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userAddress = searchParams.get('userAddress')

  if (!userAddress) {
    return NextResponse.json({ error: 'User address is required' }, { status: 400 })
  }

  try {
    const client = await clientPromise
    const db = client.db('blocke')

    const contacts = await db.collection('contacts').aggregate([
      {
        $match: { userAddress: userAddress.toLowerCase() }
      },
      {
        $group: {
          _id: "$contactAddress",
          contactName: { $first: "$contactName" },
          contactAddress: { $first: "$contactAddress" },
          createdAt: { $first: "$createdAt" }
        }
      },
      {
        $project: {
          _id: { $toString: "$_id" }, // Convert _id to string
          contactName: 1,
          contactAddress: 1,
          createdAt: 1
        }
      }
    ]).toArray()

    return NextResponse.json(contacts)
  } catch (error) {
    console.error('Failed to fetch contacts:', error)
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { userAddress, contactName, contactAddress } = await request.json()

  if (!userAddress || !contactName || !contactAddress) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const client = await clientPromise
    const db = client.db('blocke')

    // Check if contact already exists
    const existingContact = await db.collection('contacts').findOne({
      userAddress: userAddress.toLowerCase(),
      contactAddress: contactAddress.toLowerCase()
    })

    if (existingContact) {
      return NextResponse.json({ error: 'Contact already exists' }, { status: 400 })
    }

    const result = await db.collection('contacts').insertOne({
      userAddress: userAddress.toLowerCase(),
      contactName,
      contactAddress: contactAddress.toLowerCase(),
      createdAt: new Date()
    })

    return NextResponse.json({ 
      _id: result.insertedId.toString(),
      userAddress: userAddress.toLowerCase(),
      contactName,
      contactAddress: contactAddress.toLowerCase(),
    })
  } catch (error) {
    console.error('Failed to add contact:', error)
    return NextResponse.json({ error: 'Failed to add contact' }, { status: 500 })
  }
}

