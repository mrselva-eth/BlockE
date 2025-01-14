import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
 try {
   const client = await clientPromise
   const db = client.db('blocke')
   const result = await db.collection('beai').aggregate([
     {
       $group: {
         _id: null,
         totalOutputMessages: { $sum: "$totalOutputMessageCount" },
       },
     },
   ]).toArray()

   const totalQueries = result.length > 0 ? result[0].totalOutputMessages : 0

   return NextResponse.json({ success: true, totalQueries })
 } catch (error) {
   console.error('Error fetching total AI queries:', error)
   return NextResponse.json({ success: false, error: 'Failed to fetch total AI queries' }, { status: 500 })
 }
}

