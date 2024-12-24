import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 })
  }

  try {
    const client = await clientPromise
    const db = client.db('blocke')
    
    // Find all BEUIDs for the address
    const result = await db.collection('beuids').find({ 
      address: address.toLowerCase() 
    }).toArray()

    if (result && result.length > 0) {
      // Transform the data to match expected format
      const ownedUIDs = result.map(doc => ({
        uid: doc.uid,
        formattedUid: doc.formattedUid,
        digits: doc.uid.length
      }))

      return NextResponse.json({
        success: true,
        ownedUIDs: ownedUIDs,
        beuidCount: ownedUIDs.length
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        ownedUIDs: [], 
        beuidCount: 0 
      })
    }
  } catch (error) {
    console.error('Error fetching BEUIDs:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch BEUIDs',
      success: false 
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { address, uid } = await request.json()

    if (!address || !uid) {
      return NextResponse.json({ error: 'Address and UID are required' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('blocke')
    
    // Insert new BEUID document
    const result = await db.collection('beuids').insertOne({
      address: address.toLowerCase(),
      uid: uid,
      formattedUid: `${uid}.BE`,
      mintedAt: new Date()
    })

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('Error storing BEUID:', error)
    return NextResponse.json({ error: 'Failed to store BEUID' }, { status: 500 })
  }
}

