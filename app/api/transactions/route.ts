import { NextResponse } from 'next/server'
import { getTransactions, addTransaction } from '@/lib/mongodb'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')?.toLowerCase()
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '2')

  if (!address) {
    return NextResponse.json({ 
      success: false,
      error: 'Address is required',
      transactions: [],
      total: 0
    }, { status: 400 })
  }

  try {
    const { transactions, total } = await getTransactions(address, page, limit)
    return NextResponse.json({
      success: true,
      transactions: transactions || [],
      total: total || 0
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch transactions',
      transactions: [],
      total: 0
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const body = await request.json()
  const { address, type, amount, txHash } = body

  if (!address || !type || amount === undefined || !txHash) {
    return NextResponse.json({ 
      success: false,
      error: 'Missing required fields' 
    }, { status: 400 })
  }

  try {
    await addTransaction({ 
      address: address.toLowerCase(),
      type,
      amount,
      txHash,
      timestamp: new Date().toISOString()
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error adding transaction:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to add transaction' 
    }, { status: 500 })
  }
}

