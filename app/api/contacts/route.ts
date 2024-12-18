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
    const contacts = await db.collection('contacts')
      .find({ userAddress: userAddress.toLowerCase() })
      .toArray()

    return NextResponse.json(contacts.map(contact => ({
      ...contact,
      _id: contact._id.toString()
    })))
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

