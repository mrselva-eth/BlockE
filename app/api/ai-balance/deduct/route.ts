import { NextResponse } from 'next/server'
import { getAIBalance, updateAIBalance } from '@/lib/mongodb'

export async function POST(request: Request) {
  const { address } = await request.json()

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 })
  }

  try {
    const currentBalance = await getAIBalance(address)
    if (currentBalance <= 0) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    const newBalance = currentBalance - 1
    await updateAIBalance(address, newBalance)

    return NextResponse.json({ newBalance })
  } catch (error) {
    console.error('Error deducting AI balance:', error)
    return NextResponse.json({ error: 'Failed to deduct balance' }, { status: 500 })
  }
}

