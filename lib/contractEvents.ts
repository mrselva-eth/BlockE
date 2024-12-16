import { ethers } from 'ethers'
import { BE_AI_CONTRACT_ADDRESS, BE_AI_CONTRACT_ABI } from '@/utils/beAiContractABI'
import { addTransaction, updateAIBalance, getAIBalance } from './mongodb'

const POLYGON_RPC_URL = process.env.NEXT_PUBLIC_POLYGON_RPC_URL || 'https://polygon-rpc.com'

export async function setupContractEventListeners() {
  const provider = new ethers.JsonRpcProvider(POLYGON_RPC_URL)
  const contract = new ethers.Contract(BE_AI_CONTRACT_ADDRESS, BE_AI_CONTRACT_ABI, provider)

  contract.on('Deposit', async (user: string, amount: bigint, event: any) => {
    try {
      const amountInEther = Number(ethers.formatEther(amount))
      console.log(`Deposit event detected for user ${user}, amount: ${amountInEther} BE`)
      
      await addTransaction({
        address: user.toLowerCase(),
        type: 'deposit',
        amount: amountInEther,
        txHash: event.transactionHash,
      })

      // Fetch current balance from MongoDB
      const currentBalance = await getAIBalance(user.toLowerCase())
      
      // Add the new deposit to the current balance
      const newBalance = currentBalance + amountInEther
      
      // Update user's balance in MongoDB
      await updateAIBalance(user.toLowerCase(), newBalance)
      console.log(`Updated balance for user ${user}: ${newBalance} BE`)
    } catch (error) {
      console.error('Error processing deposit event:', error)
    }
  })

  contract.on('Withdrawal', async (user: string, amount: bigint, event: any) => {
    try {
      const amountInEther = Number(ethers.formatEther(amount))
      console.log(`Withdrawal event detected for user ${user}, amount: ${amountInEther} BE`)
      
      await addTransaction({
        address: user.toLowerCase(),
        type: 'withdraw',
        amount: amountInEther,
        txHash: event.transactionHash,
      })

      // Update user's balance in MongoDB
      const currentBalance = await contract.balanceOf(user)
      const balanceInEther = Number(ethers.formatEther(currentBalance))
      await updateAIBalance(user.toLowerCase(), balanceInEther)
      console.log(`Updated balance for user ${user}: ${balanceInEther} BE`)
    } catch (error) {
      console.error('Error processing withdrawal event:', error)
    }
  })

  console.log('Contract event listeners set up successfully')
}

