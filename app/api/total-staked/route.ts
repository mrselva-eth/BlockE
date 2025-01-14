import { NextResponse } from 'next/server'
import { ethers } from 'ethers'
import { BE_STAKING_ADDRESS, BE_STAKING_ABI } from '@/utils/beStakingABI'

export async function GET() {
  try {
    const provider = new ethers.JsonRpcProvider('https://polygon-rpc.com')
    const contract = new ethers.Contract(BE_STAKING_ADDRESS, BE_STAKING_ABI, provider)
    
    const filter = contract.filters.Staked()
    const events = await contract.queryFilter(filter)

    let totalStaked = BigInt(0)
    for (const event of events) {
      // Type guard to ensure event has args property
      if ('args' in event && event.args) {
        totalStaked += event.args.amount || BigInt(0);
      }
    }

    return NextResponse.json({
      success: true,
      totalStaked: ethers.formatUnits(totalStaked, 18),
    })
  } catch (error) {
    console.error('Error fetching total staked BE:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch total staked BE' }, { status: 500 })
  }
}

