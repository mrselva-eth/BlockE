import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
 try {
   const client = await clientPromise
   const db = client.db('blocke')
   const count = await db.collection('profiles').countDocuments()
   return NextResponse.json({ success: true, count })
 } catch (error) {
   console.error('Error fetching total users:', error)
   return NextResponse.json({ success: false, error: 'Failed to fetch total users' }, { status: 500 })
 }
}

