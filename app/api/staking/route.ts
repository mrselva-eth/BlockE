import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ethers } from 'ethers'
import type { StakeData } from '@/types/StakeData'; // Import the type

interface StakingData {
  address: string;
  everStaked: boolean;
  stakeCount: number; // New field
  everClaimed: boolean;
  claimCount: number; // New field
  everUnstaked: boolean;
  unstakeCount: number; // New field
  staked: StakeData[];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 })
  }

  try {
    const client = await clientPromise
    const db = client.db('blocke')
    const stakingData = await db.collection<StakingData>('staking').findOne({ address: address.toLowerCase() })

    if (!stakingData) {
      return NextResponse.json({
        everStaked: false,
        everClaimed: false,
        everUnstaked: false,
        staked: [],
        stakeCount: 0,
        claimCount: 0,
        unstakeCount: 0,
      })
    }

    return NextResponse.json({
      everStaked: stakingData.everStaked || false,
      everClaimed: stakingData.everClaimed || false,
      everUnstaked: stakingData.everUnstaked || false,
      staked: stakingData.staked || [],
      stakeCount: stakingData.stakeCount || 0,
      claimCount: stakingData.claimCount || 0,
      unstakeCount: stakingData.unstakeCount || 0,
    })
  } catch (error) {
    console.error('Error fetching staking data:', error)
    return NextResponse.json({ error: 'Failed to fetch staking data' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { address, stakeData }: { address: string; stakeData: StakeData } = await request.json()

    if (!address || !stakeData) {
      return NextResponse.json({ error: 'Address and stake data are required' }, { status: 400 })
    }

    try {
      const client = await clientPromise
      const db = client.db('blocke')

      const stakeDataAsPlainObject = JSON.parse(JSON.stringify(stakeData));

      await db.collection<StakingData>('staking').updateOne(
        { address: address.toLowerCase() },
        {
          $set: {
            address: address.toLowerCase(),
            everStaked: true,
          },
          $inc: { stakeCount: 1 },
          $push: { staked: stakeDataAsPlainObject }
        },
        { upsert: true }
      )

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Error saving staking data:', error)
      return NextResponse.json({ error: 'Failed to save staking data' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error in POST request:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { address, txHash } = await request.json()

  if (!address || !txHash) {
    return NextResponse.json({ error: 'Address and txHash are required' }, { status: 400 })
  }

  try {
    const client = await clientPromise
    const db = client.db('blocke')

    const result = await db.collection<StakingData>('staking').updateOne({
      address: address.toLowerCase(),
      'staked.transactionHash': txHash
    }, {
      $set: {
        'staked.$.claimed': true,
      },
      $inc: { claimCount: 1 }
    })

    if (result.modifiedCount === 0) {
      console.warn('No matching stake found for claim update')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating claim status:', error)
    return NextResponse.json({ error: 'Failed to update claim status' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { address, txHash } = await request.json()

  if (!address || !txHash) {
    return NextResponse.json({ error: 'Address and txHash are required' }, { status: 400 })
  }

  try {
    const client = await clientPromise
    const db = client.db('blocke')

    const result = await db.collection<StakingData>('staking').updateOne({
      address: address.toLowerCase(),
      'staked.transactionHash': txHash
    }, {
      $set: {
        'staked.$.unstaked': true,
      },
      $inc: { unstakeCount: 1 }
    })

    if (result.modifiedCount === 0) {
      console.warn('No matching stake found for unstake update')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating unstake status:', error)
    return NextResponse.json({ error: 'Failed to update unstake status' }, { status: 500 })
  }
}

