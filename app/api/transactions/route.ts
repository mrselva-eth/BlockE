import { NextResponse } from 'next/server'
import { getTransactions, addTransaction } from '@/lib/mongodb'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')?.toLowerCase()
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '3')

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 })
  }

  try {
    const { transactions, total } = await getTransactions(address, page, limit)
    return NextResponse.json({ transactions, total })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const body = await request.json()
  const { address, type, amount, txHash } = body

  if (!address || !type || amount === undefined || !txHash) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    await addTransaction({ address, type, amount, txHash })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error adding transaction:', error)
    return NextResponse.json({ error: 'Failed to add transaction' }, { status: 500 })
  }
}

