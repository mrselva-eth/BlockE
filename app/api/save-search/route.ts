import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function POST(request: Request) {
  try {
    const { 
      connectedAddress, 
      searchedAddress,
      resolvedAddress, 
      totalHoldingsETH,
      totalHoldingsUSD,
      gasSpentETH,
      isEns 
    } = await request.json()

    const client = await clientPromise
    const db = client.db('blocke')
    const searches = db.collection('searches')

    // Store the search record
    const result = await searches.updateOne(
      { 
        connectedAddress: connectedAddress.toLowerCase(),
        searchedAddress: searchedAddress.toLowerCase()
      },
      {
        $set: {
          connectedAddress: connectedAddress.toLowerCase(),
          searchedAddress: searchedAddress.toLowerCase(),
          resolvedAddress: resolvedAddress.toLowerCase(),
          totalHoldingsETH,
          totalHoldingsUSD,
          gasSpentETH,
          isEns,
          lastSearched: new Date()
        },
        $inc: { searchCount: 1 }
      },
      { upsert: true }
    )

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('Error saving search:', error)
    return NextResponse.json({ success: false, error: 'Failed to save search' }, { status: 500 })
  }
}

