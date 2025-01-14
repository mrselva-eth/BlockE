import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
 try {
   const client = await clientPromise
   const db = client.db('blocke')
   const count = await db.collection('beuids').countDocuments()
   return NextResponse.json({ success: true, totalMinted: count })
 } catch (error) {
   console.error('Error fetching total BlockE UIDs minted:', error)
   return NextResponse.json({ success: false, error: 'Failed to fetch total BlockE UIDs minted' }, { status: 500 })
 }
}

