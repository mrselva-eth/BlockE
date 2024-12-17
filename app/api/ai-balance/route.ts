import { NextResponse } from 'next/server'
import { getAIBalance, updateAIBalance } from '@/lib/mongodb'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 })
  }

  try {
    const balance = await getAIBalance(address.toLowerCase())
    return NextResponse.json({ balance })
  } catch (error) {
    console.error('Error fetching AI balance:', error)
    return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { address, amount } = await request.json()

  if (!address || amount === undefined) {
    return NextResponse.json({ error: 'Address and amount are required' }, { status: 400 })
  }

  try {
    const currentBalance = await getAIBalance(address.toLowerCase())
    const newBalance = currentBalance + amount
    await updateAIBalance(address.toLowerCase(), newBalance)

    return NextResponse.json({ newBalance })
  } catch (error) {
    console.error('Error updating AI balance:', error)
    return NextResponse.json({ error: 'Failed to update balance' }, { status: 500 })
  }
}

