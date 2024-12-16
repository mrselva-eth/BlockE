import { NextResponse } from 'next/server'
import { getAIBalance, updateAIBalance } from '@/lib/mongodb'

export async function POST(request: Request) {
  const { address, balance } = await request.json()

  if (!address || balance === undefined) {
    return NextResponse.json({ error: 'Address and balance are required' }, { status: 400 })
  }

  try {
    const currentBalance = await getAIBalance(address.toLowerCase())
    const newBalance = currentBalance + balance
    await updateAIBalance(address.toLowerCase(), newBalance)
    return NextResponse.json({ success: true, balance: newBalance })
  } catch (error) {
    console.error('Error syncing balance:', error)
    if (error instanceof Error) {
      if ('code' in error && error.code === 8000) {
        return NextResponse.json({ error: 'Insufficient database permissions. Please contact support.' }, { status: 500 })
      }
      return NextResponse.json({ error: error.message || 'Failed to sync balance' }, { status: 500 })
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 })
  }
}

