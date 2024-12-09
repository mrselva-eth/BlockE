'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { useWallet } from '@/contexts/WalletContext'
import { BE_STAKING_ADDRESS, BE_STAKING_ABI } from '@/utils/beStakingABI'
import { motion, AnimatePresence } from 'framer-motion'
import TransactionRejectedMessage from './TransactionRejectedMessage'

interface Stake {
  amount: bigint
  startTime: bigint
  endTime: bigint
  apr: number
  reward: bigint
  claimed: boolean
}

export default function StakingHistory() {
  const { address } = useWallet()
  const [stakes, setStakes] = useState<Stake[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showRejected, setShowRejected] = useState(false)

  useEffect(() => {
    if (address) {
      fetchStakes()
    }
  }, [address])

  const fetchStakes = async () => {
    try {
      const provider = new ethers.JsonRpcProvider('https://polygon-rpc.com')
      const contract = new ethers.Contract(BE_STAKING_ADDRESS, BE_STAKING_ABI, provider)
      const userStakes = await contract.getUserStakes(address)
      setStakes(userStakes)
    } catch (error) {
      console.error('Error fetching stakes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClaim = async (index: number) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(BE_STAKING_ADDRESS, BE_STAKING_ABI, signer)
      const tx = await contract.claimReward(index)
      await tx.wait()
      fetchStakes()
    } catch (error: any) {
      console.error('Error claiming reward:', error)
      if (error.code === 4001 || (error.info && error.info.error && error.info.error.code === 4001)) {
        setShowRejected(true)
      }
    }
  }

  const handleUnstake = async (index: number) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(BE_STAKING_ADDRESS, BE_STAKING_ABI, signer)
      const tx = await contract.unstake(index)
      await tx.wait()
      fetchStakes()
    } catch (error: any) {
      console.error('Error unstaking:', error)
      if (error.code === 4001 || (error.info && error.info.error && error.info.error.code === 4001)) {
        setShowRejected(true)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto" />
      </div>
    )
  }

  if (stakes.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <h2 className="text-xl font-semibold p-6 border-b">Staking History</h2>
        <div className="p-8 text-center text-gray-500">
          No staking transaction history available
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <h2 className="text-xl font-semibold p-6 border-b">Staking History</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">APR</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Reward</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Remaining</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <AnimatePresence>
              {stakes.map((stake, index) => {
                const isLocked = BigInt(Math.floor(Date.now() / 1000)) < stake.endTime
                return (
                  <motion.tr
                    key={`${index}-${stake.startTime.toString()}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {ethers.formatUnits(stake.amount, 18)} BE
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(Number(stake.startTime) * 1000).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(Number(stake.endTime) * 1000).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {Number(stake.apr) / 100}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {ethers.formatUnits(stake.reward, 18)} BE
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <CountdownTimer endTime={stake.endTime} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleClaim(index)}
                          disabled={isLocked || stake.claimed}
                          className="button"
                        >
                          <span className="inner">Claim</span>
                        </button>
                        <button
                          onClick={() => handleUnstake(index)}
                          disabled={isLocked || stake.claimed}
                          className="button"
                        >
                          <span className="inner">Unstake</span>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      {showRejected && (
        <TransactionRejectedMessage onClose={() => setShowRejected(false)} />
      )}
    </div>
  )
}

function CountdownTimer({ endTime }: { endTime: bigint }) {
  const [timeRemaining, setTimeRemaining] = useState('')

  useEffect(() => {
    const formatTimeRemaining = (endTime: bigint) => {
      const now = BigInt(Math.floor(Date.now() / 1000))
      const remaining = endTime - now
      
      if (remaining <= BigInt(0)) return 'Completed'
      
      const days = Number(remaining / BigInt(86400))
      const hours = Number((remaining % BigInt(86400)) / BigInt(3600))
      const minutes = Number((remaining % BigInt(3600)) / BigInt(60))
      const seconds = Number(remaining % BigInt(60))
      
      return `${days}d ${hours}h ${minutes}m ${seconds}s`
    }

    const timer = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(endTime))
    }, 1000)

    return () => clearInterval(timer)
  }, [endTime])

  return (
    <div className="font-mono">
      {timeRemaining}
    </div>
  )
}

