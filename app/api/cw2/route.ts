import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

interface CW2Action {
  type: 'deposit' | 'withdraw';
  transactionHash: string;
  amount: number;
  timestamp: Date;
}

interface CW2Data {
  _id: ObjectId;
  userAddress: string;
  depositCount: number;
  withdrawCount: number;
  actions: CW2Action[];
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
    const cw2Collection = db.collection<CW2Data>('cw2')

    const cw2Data = await cw2Collection.findOne({ userAddress: address.toLowerCase() })

    if (!cw2Data) {
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
    const paginatedActions = cw2Data.actions.slice(skip, skip + limit)

    return NextResponse.json({
      success: true,
      depositCount: cw2Data.depositCount,
      withdrawCount: cw2Data.withdrawCount,
      actions: paginatedActions,
      totalCount: cw2Data.actions.length
    })
  } catch (error) {
    console.error('Failed to fetch CW2 data:', error)
    return NextResponse.json({ error: 'Failed to fetch CW2 data', success: false }, { status: 500 })
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
    const cw2Collection = db.collection<CW2Data>('cw2')

    const action: CW2Action = {
      type,
      transactionHash: txHash,
      amount,
      timestamp: new Date(),
    }

    const updateResult = await cw2Collection.updateOne(
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
      const newCW2Data = await cw2Collection.findOne({ userAddress: address.toLowerCase() })
      return NextResponse.json({ success: true, data: newCW2Data })
    } else if (updateResult.modifiedCount === 1) {
      return NextResponse.json({ success: true, action })
    } else {
      return NextResponse.json({ error: 'Failed to update CW2 data', success: false }, { status: 500 })
    }
  } catch (error) {
    console.error('Failed to record CW2 action:', error)
    return NextResponse.json({ error: 'Failed to record action', success: false }, { status: 500 })
  }
}

