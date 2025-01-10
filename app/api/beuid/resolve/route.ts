import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const uid = searchParams.get('uid')

  if (!uid) {
    return NextResponse.json({ error: 'UID is required' }, { status: 400 })
  }

  try {
    const client = await clientPromise
    const db = client.db('blocke')
    
    // Clean up the UID input
    const cleanUid = uid.replace('.BE', '').toLowerCase()
    
    // Find the BEUID document
    const beuid = await db.collection('beuids').findOne({
      $or: [
        { uid: cleanUid },
        { formattedUid: uid.toLowerCase() }
      ]
    })

    if (beuid) {
      return NextResponse.json({
        success: true,
        address: beuid.address,
        uid: beuid.uid,
        formattedUid: beuid.formattedUid
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'BE UID not found' 
      })
    }
  } catch (error) {
    console.error('Error resolving BE UID:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to resolve BE UID' 
    }, { status: 500 })
  }
}

