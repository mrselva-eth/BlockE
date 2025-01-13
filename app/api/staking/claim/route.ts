import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function POST(request: Request) {
 const { address, txHash } = await request.json()

 if (!address || !txHash) {
   return NextResponse.json({ error: 'Address and txHash are required' }, { status: 400 })
 }

 try {
   const client = await clientPromise
   const db = client.db('blocke')

   const result = await db.collection('staking').updateOne({
     address: address.toLowerCase(),
     'staked.transactionHash': txHash
   }, {
     $set: {
       'staked.$.claimed': true,
       everClaimed: true // Set everClaimed to true
     },
     $inc: { claimCount: 1 }, // Increment claimCount
   })

   if (result.modifiedCount === 0) {
     // Handle the case where the update didn't find a matching document
     console.warn('No matching stake found for claim update')
   }

   return NextResponse.json({ success: true })
 } catch (error) {
   console.error('Error updating claim status:', error)
   return NextResponse.json({ error: 'Failed to update claim status' }, { status: 500 })
 }
}

