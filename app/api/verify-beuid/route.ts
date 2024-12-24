import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ethers } from 'ethers'
import { BLOCKE_UID_CONTRACT_ADDRESS, BLOCKE_UID_ABI } from '@/utils/blockEUIDContract'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 })
  }

  try {
    const client = await clientPromise
    const db = client.db('blocke')

    // First check MongoDB for existing data
    const storedData = await db.collection('beuids')
      .find({ address: address.toLowerCase() })
      .toArray()

    if (storedData && storedData.length > 0) {
      const ownedUIDs = storedData.map(doc => ({
        uid: doc.uid,
        formattedUid: doc.formattedUid,
        digits: doc.uid.length
      }))

      return NextResponse.json({ 
        success: true,
        ownedUIDs: ownedUIDs,
        beuidCount: ownedUIDs.length,
        hasUID: true
      })
    }

    // If no data in MongoDB, return empty result
    return NextResponse.json({ 
      success: true,
      ownedUIDs: [],
      beuidCount: 0,
      hasUID: false
    })

  } catch (error) {
    console.error('Error verifying BEUID ownership:', error)
    return NextResponse.json({ 
      error: 'Verification failed',
      success: false,
      hasUID: false,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

