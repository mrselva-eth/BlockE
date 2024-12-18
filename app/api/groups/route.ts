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
    const groups = await db.collection('groups')
      .find({
        $or: [
          { creatorAddress: userAddress.toLowerCase() },
          { members: userAddress.toLowerCase() }
        ]
      })
      .toArray()

    return NextResponse.json(groups.map(group => ({
      ...group,
      _id: group._id.toString()
    })))
  } catch (error) {
    console.error('Failed to fetch groups:', error)
    return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { creatorAddress, groupName, members, groupLogo } = await request.json()

  if (!creatorAddress || !groupName || !members) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const client = await clientPromise
    const db = client.db('blocke')
    const result = await db.collection('groups').insertOne({
      creatorAddress: creatorAddress.toLowerCase(),
      groupName,
      members: members.map((m: string) => m.toLowerCase()),
      groupLogo,
      createdAt: new Date()
    })

    return NextResponse.json({ 
      _id: result.insertedId.toString(),
      creatorAddress: creatorAddress.toLowerCase(),
      groupName,
      members: members.map((m: string) => m.toLowerCase()),
      groupLogo
    })
  } catch (error) {
    console.error('Failed to create group:', error)
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 })
  }
}

// Add endpoint to update group logo
export async function PATCH(request: Request) {
  const { groupId, groupLogo, userAddress } = await request.json()

  if (!groupId || !groupLogo || !userAddress) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const client = await clientPromise
    const db = client.db('blocke')
    
    // Check if user is the creator
    const group = await db.collection('groups').findOne({
      _id: new ObjectId(groupId),
      creatorAddress: userAddress.toLowerCase()
    })

    if (!group) {
      return NextResponse.json({ error: 'Unauthorized to update group' }, { status: 403 })
    }

    await db.collection('groups').updateOne(
      { _id: new ObjectId(groupId) },
      { $set: { groupLogo } }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update group logo:', error)
    return NextResponse.json({ error: 'Failed to update group logo' }, { status: 500 })
  }
}

