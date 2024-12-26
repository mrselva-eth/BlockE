'use client'

import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { useWallet } from '@/contexts/WalletContext'
import { BE_STAKING_ADDRESS, BE_STAKING_ABI } from '@/utils/beStakingABI'
import { motion, AnimatePresence } from 'framer-motion'
import TransactionRejectedMessage from './TransactionRejectedMessage'
import { Link, Loader2 } from 'lucide-react'
import { getTransactionStatus } from '@/utils/polygonscanApi'

interface Stake {
  amount: bigint
  startTime: bigint
  endTime: bigint
  apr: bigint
  reward: bigint
  claimed: boolean
  unstaked: boolean
}

interface StakeWithTx extends Stake {
  transactionHash?: string
  transactionStatus?: 'pending' | 'success' | 'failed'
}

interface StakingHistoryProps {
  onStakeUpdate: () => void
  transactionPending: boolean
}

export default function StakingHistory({ onStakeUpdate, transactionPending }: StakingHistoryProps) {
  const { address } = useWallet()
  const [stakes, setStakes] = useState<StakeWithTx[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showRejected, setShowRejected] = useState(false)
  const [unstaking, setUnstaking] = useState<number | null>(null)

  const fetchStakes = useCallback(async () => {
    if (!address) return

    setIsLoading(true)
    try {
      const provider = new ethers.JsonRpcProvider('https://polygon-rpc.com')
      const contract = new ethers.Contract(BE_STAKING_ADDRESS, BE_STAKING_ABI, provider)
    
      const filter = contract.filters.Staked(address)
      const events = await contract.queryFilter(filter)

      const userStakes = await contract.getUserStakes(address)
      const stakesWithTx: StakeWithTx[] = userStakes.map((stake: Stake, index: number) => ({
        amount: stake.amount || BigInt(0),
        startTime: stake.startTime || BigInt(0),
        endTime: stake.endTime || BigInt(0),
        apr: stake.apr || BigInt(0),
        reward: stake.reward || BigInt(0),
        claimed: stake.claimed || false,
        unstaked: stake.unstaked || false,
        transactionHash: events[index]?.transactionHash,
        transactionStatus: events[index]?.transactionHash ? 'success' : 'pending'
      }))
      
      setStakes(stakesWithTx)
    } catch (error) {
      console.error('Error fetching stakes:', error)
    } finally {
      setIsLoading(false)
    }
  }, [address])

  useEffect(() => {
    if (address) {
      fetchStakes()
    }
  }, [address, fetchStakes])

  useEffect(() => {
    if (transactionPending) {
      fetchStakes()
    }
  }, [transactionPending, fetchStakes])

  useEffect(() => {
    const checkTransactionStatuses = async () => {
      const updatedStakes = await Promise.all(
        stakes.map(async (stake) => {
          if (stake.transactionHash && stake.transactionStatus === 'pending') {
            const status = await getTransactionStatus(stake.transactionHash)
            return {
              ...stake,
              transactionStatus: status ? 'success' : 'failed'
            } as StakeWithTx
          }
          return stake
        })
      )
      setStakes(updatedStakes)
    }

    const interval = setInterval(checkTransactionStatuses, 5000)
    return () => clearInterval(interval)
  }, [stakes])


  const handleClaim = async (index: number) => {
    if (!address) return

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(BE_STAKING_ADDRESS, BE_STAKING_ABI, signer)
      const tx = await contract.claimReward(index)
      
      const updatedStakes = [...stakes]
      updatedStakes[index] = {
        ...updatedStakes[index],
        transactionHash: tx.hash,
        transactionStatus: 'pending'
      } as StakeWithTx
      setStakes(updatedStakes)

      await tx.wait()
      fetchStakes()
      onStakeUpdate()
    } catch (error: any) {
      console.error('Error claiming reward:', error)
      if (error.code === 4001 || (error.info && error.info.error && error.info.error.code === 4001)) {
        setShowRejected(true)
      } else {
        alert(`Claim failed: ${error.message || 'Unknown error'}`)
      }
    }
  }

  const handleUnstake = async (index: number) => {
    if (!address) return

    setUnstaking(index)
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(BE_STAKING_ADDRESS, BE_STAKING_ABI, signer)

      const userStakes = await contract.getUserStakes(address)
      if (!userStakes[index]) {
        throw new Error('Invalid stake index')
      }

      const stake = userStakes[index]
      const currentTime = Math.floor(Date.now() / 1000)
      if (BigInt(currentTime) < stake.endTime) {
        throw new Error('Lock period not ended')
      }

      if (stake.unstaked) {
        throw new Error('Already unstaked')
      }

      const tx = await contract.unstake(index, {
        gasLimit: 500000
      })

      const updatedStakes = [...stakes]
      updatedStakes[index] = {
        ...updatedStakes[index],
        transactionHash: tx.hash,
        transactionStatus: 'pending'
      } as StakeWithTx
      setStakes(updatedStakes)

      await tx.wait()
      await fetchStakes()
      onStakeUpdate()
    } catch (error: any) {
      console.error('Unstake error:', error)
      let errorMessage = error.reason || error.message || 'Unknown error occurred'
      if (errorMessage.includes('execution reverted')) {
        errorMessage = 'Transaction failed: Please ensure the lock period has ended and you haven\'t already unstaked'
      }
      alert(`Unstake failed: ${errorMessage}`)
    } finally {
      setUnstaking(null)
    }
  }

  const TransactionLink = ({ hash, status }: { hash?: string, status?: string }) => {
    if (!hash) return <span className="text-gray-400">Pending...</span>

    return (
      <a 
        href={`https://polygonscan.com/tx/${hash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-[#4F46E5] hover:text-[#9333EA] transition-colors group"
      >
        {status === 'pending' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Link className="w-4 h-4 group-hover:scale-110 transition-transform" />
        )}
        <span className="underline">
          {status === 'pending' ? 'Pending' : 'View'}
        </span>
      </a>
    )
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
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
                      <TransactionLink 
                        hash={stake.transactionHash} 
                        status={stake.transactionStatus} 
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {ethers.formatUnits(stake.amount, 18)} BE
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(Number(stake.startTime) * 1000).toLocaleString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(Number(stake.endTime) * 1000).toLocaleString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true
                      })}
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
                          disabled={isLocked || stake.claimed || stake.unstaked}
                          className={`button ${(stake.claimed || stake.unstaked) ? 'opacity-50' : ''}`}
                        >
                          <span className="inner">
                            {stake.claimed ? 'Claimed' : 'Claim'}
                          </span>
                        </button>
                        <button
                          onClick={() => handleUnstake(index)}
                          disabled={isLocked || stake.unstaked || unstaking === index}
                          className={`button ${stake.unstaked || unstaking === index ? 'opacity-50' : ''}`}
                        >
                          <span className="inner">
                            {unstaking === index ? 'Unstaking...' : stake.unstaked ? 'Unstaked' : 'Unstake'}
                          </span>
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

      if (days > 0) {
        return `${days}d ${hours}h ${minutes}m ${seconds}s`
      } else if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`
      } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`
      } else {
        return `${seconds}s`
      }
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

