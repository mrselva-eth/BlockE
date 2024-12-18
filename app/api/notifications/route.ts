import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userAddress = searchParams.get('userAddress')

  if (!userAddress) {
    return NextResponse.json({ error: 'User address is required' }, { status: 400 })
  }

  try {
    const client = await clientPromise
    const db = client.db('blocke')
    const notifications = await db.collection('notifications')
      .find({ userAddress: userAddress.toLowerCase() })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(notifications.map(notification => ({
      ...notification,
      _id: notification._id.toString()
    })))
  } catch (error) {
    console.error('Failed to fetch notifications:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { userAddress, type, content } = await request.json()

  if (!userAddress || !type || !content) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const client = await clientPromise
    const db = client.db('blocke')
    const result = await db.collection('notifications').insertOne({
      userAddress: userAddress.toLowerCase(),
      type,
      content,
      read: false,
      createdAt: new Date()
    })

    return NextResponse.json({
      _id: result.insertedId.toString(),
      userAddress: userAddress.toLowerCase(),
      type,
      content,
      read: false,
      createdAt: new Date()
    })
  } catch (error) {
    console.error('Failed to create notification:', error)
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const { notificationId } = await request.json()

  if (!notificationId) {
    return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 })
  }

  try {
    const client = await clientPromise
    const db = client.db('blocke')
    await db.collection('notifications').updateOne(
      { _id: new ObjectId(notificationId) },
      { $set: { read: true } }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to mark notification as read:', error)
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
  }
}

