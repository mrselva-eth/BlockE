import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

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
    const skip = (page - 1) * limit

    const [transactions, totalCount] = await Promise.all([
      db.collection('transactions')
        .find({ address: address.toLowerCase() })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('transactions')
        .countDocuments({ address: address.toLowerCase() })
    ])

    return NextResponse.json({
      transactions: transactions.map(tx => ({
        ...tx,
        _id: tx._id.toString()
      })),
      total: totalCount,
      success: true
    })
  } catch (error) {
    console.error('Error in getTransactions:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch transactions',
      success: false
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const body = await request.json()
  const { address, type, amount, txHash } = body

  if (!address || !type || amount === undefined || !txHash) {
    return NextResponse.json({ 
      error: 'Missing required fields',
      success: false 
    }, { status: 400 })
  }

  try {
    const client = await clientPromise
    const db = client.db('blocke')
    
    const result = await db.collection('transactions').insertOne({
      address: address.toLowerCase(),
      type,
      amount,
      txHash,
      timestamp: new Date()
    })

    return NextResponse.json({ 
      success: true,
      transaction: {
        _id: result.insertedId.toString(),
        address: address.toLowerCase(),
        type,
        amount,
        txHash,
        timestamp: new Date()
      }
    })
  } catch (error) {
    console.error('Error in addTransaction:', error)
    return NextResponse.json({ 
      error: 'Failed to add transaction',
      success: false 
    }, { status: 500 })
  }
}

