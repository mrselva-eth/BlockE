import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const senderAddress = searchParams.get('senderAddress')
  const receiverAddress = searchParams.get('receiverAddress')
  const isGroup = searchParams.get('isGroup') === 'true'

  console.log(`Fetching messages for sender: ${senderAddress}, receiver: ${receiverAddress}, isGroup: ${isGroup}`);

  if (!senderAddress || !receiverAddress) {
    return NextResponse.json({ error: 'Sender and receiver addresses are required' }, { status: 400 })
  }

  try {
    const client = await clientPromise
    const db = client.db('blocke')
    
    const query = isGroup
      ? { receiverAddress: receiverAddress.toLowerCase() }
      : {
          $or: [
            { 
              senderAddress: senderAddress.toLowerCase(),
              receiverAddress: receiverAddress.toLowerCase()
            },
            {
              senderAddress: receiverAddress.toLowerCase(),
              receiverAddress: senderAddress.toLowerCase()
            }
          ]
        }

    console.log("MongoDB query:", JSON.stringify(query));

    const messages = await db.collection('messages')
      .find(query)
      .sort({ createdAt: 1 })
      .toArray()

    console.log(`Found ${messages.length} messages`);

    return NextResponse.json(messages.map(message => ({
      ...message,
      _id: message._id.toString()
    })))
  } catch (error) {
    console.error('Failed to fetch messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { senderAddress, receiverAddress, encryptedMessage, isGroup } = await request.json()

  console.log("Received message data:", { senderAddress, receiverAddress, encryptedMessage, isGroup });

  if (!senderAddress || !receiverAddress || !encryptedMessage) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const client = await clientPromise
    const db = client.db('blocke')
    const result = await db.collection('messages').insertOne({
      senderAddress: senderAddress.toLowerCase(),
      receiverAddress: receiverAddress.toLowerCase(),
      encryptedMessage,
      isGroup: isGroup || false,
      createdAt: new Date()
    })

    console.log("Message saved to database:", result.insertedId);

    // Create a notification for the receiver ONLY IF it's a new message
    const existingNotification = await db.collection('notifications').findOne({
      userAddress: receiverAddress.toLowerCase(),
      'content': { $regex: `New message from ${senderAddress}`, $options: 'i' } // Case-insensitive search
    })

    if (!existingNotification) { // Only create if a similar notification doesn't exist
      await db.collection('notifications').insertOne({
        userAddress: receiverAddress.toLowerCase(),
        type: 'newMessage',
        content: `New message from ${senderAddress}`,
        read: false,
        createdAt: new Date()
      })
    } else {
      console.warn('Notification already exists, skipping creation.')
    }

    return NextResponse.json({ 
      _id: result.insertedId.toString(),
      senderAddress: senderAddress.toLowerCase(),
      receiverAddress: receiverAddress.toLowerCase(),
      encryptedMessage,
      isGroup: isGroup || false,
    })
  } catch (error) {
    console.error('Failed to save message:', error)
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 })
  }
}

