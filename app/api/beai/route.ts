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

export async function POST(request: Request) {
  try {
    const { userAddress, messages, commandUsage } = await request.json() as {
      userAddress: string;
      messages: ChatMessage[];
      commandUsage: { used: boolean; count: number };
    };

    const client = await clientPromise;
    const db = client.db('blocke');
    const beaiCollection = db.collection<BEAIData>('beai');

    const existingData = await beaiCollection.findOne({ userAddress: userAddress.toLowerCase() });

    if (existingData) {
      // Update existing document
      const updatedChat = [...existingData.chat, ...messages];
      await beaiCollection.updateOne(
        { userAddress: userAddress.toLowerCase() },
        {
          $set: {
            totalInputMessageCount: existingData.totalInputMessageCount + messages.filter(msg => msg.inputMessage).length,
            totalOutputMessageCount: existingData.totalOutputMessageCount + messages.filter(msg => msg.outputMessage).length,
            userUsedAvailableCommand: commandUsage.used || existingData.userUsedAvailableCommand,
            userUsedCommandCount: existingData.userUsedCommandCount + commandUsage.count,
            chat: updatedChat,
          },
        }
      );
    } else {
      // Create new document
      const newBEAIData: BEAIData = {
        userAddress: userAddress.toLowerCase(),
        totalInputMessageCount: messages.filter(msg => msg.inputMessage).length,
        totalOutputMessageCount: messages.filter(msg => msg.outputMessage).length,
        userUsedAvailableCommand: commandUsage.used,
        userUsedCommandCount: commandUsage.count,
        chat: messages,
      };
      await beaiCollection.insertOne(newBEAIData);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save BEAI data:', error);
    return NextResponse.json({ error: 'Failed to save BEAI data' }, { status: 500 });
  }
}

