import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

interface BEAITAction {
  type: 'deposit' | 'withdraw';
  transactionHash: string;
  amount: number;
  timestamp: Date;
}

interface BEAITData {
  _id: ObjectId;
  userAddress: string;
  depositCount: number;
  withdrawCount: number;
  actions: BEAITAction[];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '2')

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 })
  }

  try {
    const client = await clientPromise
    const db = client.db('blocke')
    const beaitCollection = db.collection<BEAITData>('beait')

    const beaitData = await beaitCollection.findOne({ userAddress: address.toLowerCase() })

    if (!beaitData) {
      return NextResponse.json({
        success: true,
        depositCount: 0,
        withdrawCount: 0,
        actions: [],
        totalCount: 0
      })
    }

    const skip = (page - 1) * limit

    // Paginate actions
    const paginatedActions = beaitData.actions.slice(skip, skip + limit)

    return NextResponse.json({
      success: true,
      depositCount: beaitData.depositCount,
      withdrawCount: beaitData.withdrawCount,
      actions: paginatedActions,
      totalCount: beaitData.actions.length
    })
  } catch (error) {
    console.error('Failed to fetch BEAIT data:', error)
    return NextResponse.json({ error: 'Failed to fetch BEAIT data', success: false }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { address, type, amount, txHash } = await request.json()

    if (!address || !type || amount === undefined || !txHash) {
      return NextResponse.json({ error: 'Missing required fields', success: false }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('blocke')
    const beaitCollection = db.collection<BEAITData>('beait')

    const action: BEAITAction = {
      type,
      transactionHash: txHash,
      amount,
      timestamp: new Date(),
    }

    const updateResult = await beaitCollection.updateOne(
      { userAddress: address.toLowerCase() },
      {
        $inc: {
          [`${type}Count`]: 1,
        },
        $push: { actions: action },
      },
      { upsert: true }
    )

    if (updateResult.upsertedCount === 1) {
      // New document created, fetch and return the entire document
      const newBEAITData = await beaitCollection.findOne({ userAddress: address.toLowerCase() })
      return NextResponse.json({ success: true, data: newBEAITData })
    } else if (updateResult.modifiedCount === 1) {
      return NextResponse.json({ success: true, action })
    } else {
      return NextResponse.json({ error: 'Failed to update BEAIT data', success: false }, { status: 500 })
    }
  } catch (error) {
    console.error('Failed to record BEAIT action:', error)
    return NextResponse.json({ error: 'Failed to record action', success: false }, { status: 500 })
  }
}

