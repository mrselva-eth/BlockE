import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

interface OthersData {
 address: string;
 loggedOut: boolean;
 visitedPages: string[];
 connectedAddressSearched: boolean;
}

export async function POST(request: Request) {
 try {
   const { address, action, page } = await request.json()

   if (!address) {
     return NextResponse.json({ error: 'Address is required' }, { status: 400 })
   }

   const client = await clientPromise
   const db = client.db('blocke')
   const collection = db.collection<OthersData>('others')

   switch (action) {
     case 'logout':
       await collection.updateOne(
         { address: address.toLowerCase() },
         { $set: { loggedOut: true } },
         { upsert: true }
       )
       break
     case 'pageVisit':
       if (!page) {
         return NextResponse.json({ error: 'Page is required for page visit action' }, { status: 400 })
       }
       await collection.updateOne(
         { address: address.toLowerCase() },
         { $addToSet: { visitedPages: page } },
         { upsert: true }
       )
       break
     case 'connectedAddressSearch':
       await collection.updateOne(
         { address: address.toLowerCase() },
         { $set: { connectedAddressSearched: true } },
         { upsert: true }
       )
       break
     default:
       return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
   }


   return NextResponse.json({ success: true })
 } catch (error) {
   console.error('Error updating "others" data:', error)
   return NextResponse.json({ error: 'Failed to update data' }, { status: 500 })
 }
}

