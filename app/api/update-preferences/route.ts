import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function POST(request: Request) {
 try {
   const { address, autoDisconnect, theme } = await request.json()

   if (!address || autoDisconnect === undefined || theme === undefined) { // Check if all fields are present
     return NextResponse.json({ error: 'Address, autoDisconnect, and theme are required' }, { status: 400 })
   }

   const client = await clientPromise
   const db = client.db('blocke')

   await db.collection('others').updateOne(
     { address: address.toLowerCase() },
     { $set: { address: address.toLowerCase(), autoDisconnect, theme, updatedAt: new Date() } }, // Add timestamp
     { upsert: true }
   )

   return NextResponse.json({ success: true })
 } catch (error) {
   console.error('Error updating preferences:', error)
   return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
 }
}

