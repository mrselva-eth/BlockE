import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

interface ChatMessage {
 inputMessage: string;
 outputMessage: string;
}

interface BEAIData {
 userAddress: string;
 totalInputMessageCount: number;
 totalOutputMessageCount: number;
 userUsedAvailableCommand: boolean;
 userUsedCommandCount: number;
 chat: ChatMessage[];
}

export async function GET(request: Request) {
 try {
   const { searchParams } = new URL(request.url);
   const userAddress = searchParams.get('address');

   if (!userAddress) {
     return NextResponse.json({ error: 'Address is required' }, { status: 400 });
   }

   const client = await clientPromise;
   const db = client.db('blocke');
   const beaiCollection = db.collection<BEAIData>('beai');

   const beaiData = await beaiCollection.findOne({ userAddress: userAddress.toLowerCase() });

   if (!beaiData) {
     // Return default values if no data is found
     return NextResponse.json({
       totalInputMessageCount: 0,
       totalOutputMessageCount: 0,
       userUsedAvailableCommand: false,
       userUsedCommandCount: 0,
       chat: [],
     });
   }

   return NextResponse.json({
     totalInputMessageCount: beaiData.totalInputMessageCount,
     totalOutputMessageCount: beaiData.totalOutputMessageCount,
     userUsedAvailableCommand: beaiData.userUsedAvailableCommand,
     userUsedCommandCount: beaiData.userUsedCommandCount,
     chat: beaiData.chat,
   });
 } catch (error) {
   console.error('Failed to fetch BEAI data:', error);
   return NextResponse.json({ error: 'Failed to fetch BEAI data' }, { status: 500 });
 }
}

