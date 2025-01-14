import { NextResponse } from 'next/server'
import { ethers } from 'ethers'
import { BE_TOKEN_ADDRESS, BE_TOKEN_ABI } from '@/utils/beTokenABI'

export async function GET() {
 try {
   const provider = new ethers.JsonRpcProvider('https://polygon-rpc.com')
   const contract = new ethers.Contract(BE_TOKEN_ADDRESS, BE_TOKEN_ABI, provider)
   const totalSupply = await contract.totalSupply()
   return NextResponse.json({ success: true, totalMinted: Number(ethers.formatUnits(totalSupply, 18)) })
 } catch (error) {
   console.error('Error fetching total BE minted:', error)
   return NextResponse.json({ success: false, error: 'Failed to fetch total BE minted' }, { status: 500 })
 }
}

