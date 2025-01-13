'use client'

import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import Image from 'next/image'
import { useWallet } from '@/contexts/WalletContext'
import { BE_TOKEN_ADDRESS, BE_TOKEN_ABI } from '@/utils/beTokenABI'
import { BE_STAKING_ADDRESS, BE_STAKING_ABI } from '@/utils/beStakingABI'
import StakingHistory from '@/components/StakingHistory'
import TransactionRejectedMessage from '@/components/TransactionRejectedMessage'
import { motion } from 'framer-motion'
import Sidebar from '@/components/Sidebar'
import SocialMediaLinks from '@/components/SocialMediaLinks'
import TransactionStatus from '@/components/TransactionStatus'
import { withWalletProtection } from '@/components/withWalletProtection'
import OverallStakedTokens from '@/components/OverallStakedTokens'
import OverallClaimedTokens from '@/components/OverallClaimedTokens'
import APRInfoButton from '@/components/APRInfoButton'
import UserOverallStakedTokens from '@/components/UserOverallStakedTokens'
import UserOverallClaimedTokens from '@/components/UserOverallClaimedTokens'
import AnimatedStatsNumber from '@/components/AnimatedStatsNumber'; // Import AnimatedStatsNumber
import { StakeData } from '@/types/StakeData'; // Import the type
import { AlertTriangle } from 'lucide-react' // Import AlertTriangle

const stakingPeriods = [
  { days: 1/1440, apr: 1000 }, // 1 minute for testing (1000% APR)
  { days: 15, apr: 227.8 },
  { days: 30, apr: 250 },
  { days: 45, apr: 275 },
  { days: 60, apr: 300 },
  { days: 90, apr: 350 },
]


function BEStaking() {
  const { address, isConnected } = useWallet()
  const [balance, setBalance] = useState('0')
  const [selectedPeriod, setSelectedPeriod] = useState(stakingPeriods[0])
  const [stakeAmount, setStakeAmount] = useState('')
  const [expectedEarnings, setExpectedEarnings] = useState('0')
  const [totalStaked, setTotalStaked] = useState('0')
  const [showRejected, setShowRejected] = useState(false)
  const [isStaking, setIsStaking] = useState(false)
  const [stakeError, setStakeError] = useState('')
  const [transactionPending, setTransactionPending] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showCornerNotification, setShowCornerNotification] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [overallStaked, setOverallStaked] = useState('0')
  const [overallClaimed, setOverallClaimed] = useState('0')
  const [userOverallStaked, setUserOverallStaked] = useState('0')
  const [userOverallClaimed, setUserOverallClaimed] = useState('0')
  const [overallUnstaked, setOverallUnstaked] = useState('0') // New state variable
  const [stakingData, setStakingData] = useState<{
    everStaked: boolean;
    everClaimed: boolean;
    everUnstaked: boolean;
    staked: StakeData[]; // Use the imported type here
    stakeCount: number;
    claimCount: number;
    unstakeCount: number;
  }>(
    {
      everStaked: false,
      everClaimed: false,
      everUnstaked: false,
      staked: [],
      stakeCount: 0,
      claimCount: 0,
      unstakeCount: 0,
    }
  )
  const [stakeCount, setStakeCount] = useState(0);
  const [claimCount, setClaimCount] = useState(0);
  const [unstakeCount, setUnstakeCount] = useState(0);

  const fetchBalance = useCallback(async () => {
    try {
      const provider = new ethers.JsonRpcProvider('https://polygon-rpc.com')
      const contract = new ethers.Contract(BE_TOKEN_ADDRESS, BE_TOKEN_ABI, provider)
      const balance = await contract.balanceOf(address)
      setBalance(ethers.formatUnits(balance, 18))
    } catch (error) {
      console.error('Error fetching balance:', error)
    }
  }, [address])

  const fetchTotalStaked = useCallback(async () => {
    try {
      const provider = new ethers.JsonRpcProvider('https://polygon-rpc.com')
      const contract = new ethers.Contract(BE_STAKING_ADDRESS, BE_STAKING_ABI, provider)
      const stakes = await contract.getUserStakes(address)
      const total = stakes.reduce((acc: bigint, stake: any) => acc + stake.amount, BigInt(0))
      setTotalStaked(ethers.formatUnits(total, 18))
    } catch (error) {
      console.error('Error fetching total staked:', error)
    }
  }, [address])

  const calculateExpectedEarnings = useCallback(() => {
    if (!stakeAmount) {
      setExpectedEarnings('0')
      return
    }

    const amount = parseFloat(stakeAmount)
    const apr = selectedPeriod.apr / 100
    const days = selectedPeriod.days

    const earnings = (amount * apr * days) / 365
    setExpectedEarnings(earnings.toFixed(3))
  }, [stakeAmount, selectedPeriod])

  useEffect(() => {
    if (isConnected && address) {
      fetchBalance()
      fetchTotalStaked()
    }
  }, [isConnected, address, fetchBalance, fetchTotalStaked])

  useEffect(() => {
    calculateExpectedEarnings()
  }, [stakeAmount, selectedPeriod, calculateExpectedEarnings])

  const handleStakeAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '' || (/^\d*\.?\d*$/.test(value) && parseFloat(value) >= 0)) {
      setStakeAmount(value)
      setStakeError('')
    } else {
      setStakeError('Please enter a valid positive number')
    }
  }

  const fetchStakingData = useCallback(async () => {
    if (!address) return

    try {
      const response = await fetch(`/api/staking?address=${address}`)
      if (!response.ok) {
        throw new Error('Failed to fetch staking data')
      }
      const data = await response.json()
      setStakingData(data)

      // Update counts
      setStakeCount(data.stakeCount || 0);
      setClaimCount(data.claimCount || 0);
      setUnstakeCount(data.unstakeCount || 0);
    } catch (error) {
      console.error('Error fetching staking data:', error)
    }
  }, [address])

  useEffect(() => {
    if (isConnected && address) {
      fetchStakingData()
    }
  }, [isConnected, address, fetchStakingData])


  const handleStake = async () => {
    if (!stakeAmount || !isConnected || parseFloat(stakeAmount) <= 0) {
      setStakeError('Please enter a valid stake amount')
      return
    }

    setIsLoading(true)
    setIsStaking(true)
    setIsProcessing(true)
    setTransactionPending(true)
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const beToken = new ethers.Contract(BE_TOKEN_ADDRESS, BE_TOKEN_ABI, signer)
      const staking = new ethers.Contract(BE_STAKING_ADDRESS, BE_STAKING_ABI, signer)

      const amount = ethers.parseUnits(stakeAmount, 18)
      const periodIndex = stakingPeriods.findIndex(p => p.days === selectedPeriod.days)

      const tx1 = await beToken.approve(BE_STAKING_ADDRESS, amount)
      await tx1.wait()

      const tx2 = await staking.stake(amount, periodIndex)
      await tx2.wait()

      setIsProcessing(false)
      setIsCompleted(true)
      setTimeout(() => {
        setIsCompleted(false)
        setShowCornerNotification(true)
      }, 3000)

      fetchBalance()
      fetchTotalStaked()
      setStakeAmount('')
      fetchUserOverallStats()

      const stakeData: StakeData = { // Explicitly type the stakeData variable
        transactionHash: tx2.hash,
        amount: stakeAmount,
        periodIndex,
        startTime: Math.floor(Date.now() / 1000),
        endTime: Math.floor(Date.now() / 1000) + (selectedPeriod.days * 24 * 60 * 60),
        apr: selectedPeriod.apr,
        expectedBE: expectedEarnings,
        claimed: false,
        unstaked: false,
      }

      // Update local stakingData state immediately
      setStakingData(prev => ({
        ...prev,
        everStaked: true,
        staked: [...prev.staked, stakeData],
        stakeCount: prev.stakeCount + 1, // Update stake count
      }))

      try {
        const response = await fetch('/api/staking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address, stakeData }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to save staking data')
        }
      } catch (error: any) {
        // Revert optimistic update
        setStakingData(prev => ({
          ...prev,
          everStaked: false, // Revert everStaked if needed
          staked: prev.staked.filter(s => s.transactionHash !== stakeData.transactionHash), // Remove the stakeData from the array
          stakeCount: prev.stakeCount -1, // Revert stake count
        }))
        console.error('Error saving stake data:', error)
        alert(`Failed to save staking data: ${error.message}`)
      }
    } catch (error: any) {
      console.error('Staking error:', error)
      setIsProcessing(false)
      if (error.code === 4001 || (error.info && error.info.error && error.info.error.code === 4001)) {
        setShowRejected(true)
      } else {
        alert(`Staking failed: ${error.message || 'Unknown error'}`)
      }
    } finally {
      setIsStaking(false)
      setTransactionPending(false)
      setIsLoading(false)
    }
  }

  const fetchOverallStats = useCallback(async () => {
    try {
      const provider = new ethers.JsonRpcProvider('https://polygon-rpc.com')
      const contract = new ethers.Contract(BE_STAKING_ADDRESS, BE_STAKING_ABI, provider)
      
      // Get all stakes for all users
      const filter = contract.filters.Staked()
      const events = await contract.queryFilter(filter)
      
      let totalStaked = ethers.parseUnits('0', 18)
      let totalClaimed = ethers.parseUnits('0', 18)
      let totalUnstaked = ethers.parseUnits('0', 18) // New variable

      for (const event of events) {
        totalStaked = totalStaked + ('args' in event ? event.args.amount : BigInt(0))
      }

      // Get all claim events
      const claimFilter = contract.filters.RewardClaimed()
      const claimEvents = await contract.queryFilter(claimFilter)

      for (const event of claimEvents) {
        totalClaimed = totalClaimed + ('args' in event ? event.args.reward : BigInt(0))
      }

      const unstakeFilter = contract.filters.Unstaked() // Filter for Unstaked events
      const unstakeEvents = await contract.queryFilter(unstakeFilter)

      for (const event of unstakeEvents) {
        totalUnstaked = totalUnstaked + ('args' in event ? event.args.amount : BigInt(0)) // Accumulate unstaked amounts
      }

      setOverallStaked(ethers.formatUnits(totalStaked, 18))
      setOverallClaimed(ethers.formatUnits(totalClaimed, 18))
      setOverallUnstaked(ethers.formatUnits(totalUnstaked, 18)) // Set the new state variable
    } catch (error) {
      console.error('Error fetching overall stats:', error)
    }
  }, [])

  const fetchUserOverallStats = useCallback(async () => {
    if (!address) return;
    try {
      const provider = new ethers.JsonRpcProvider('https://polygon-rpc.com')
      const contract = new ethers.Contract(BE_STAKING_ADDRESS, BE_STAKING_ABI, provider)
      
      const userStakes = await contract.getUserStakes(address)
      
      let totalStaked = ethers.parseUnits('0', 18)
      let totalClaimed = ethers.parseUnits('0', 18)

      for (const stake of userStakes) {
        totalStaked = totalStaked + stake.amount
        if (stake.claimed) {
          totalClaimed = totalClaimed + stake.reward
        }
      }

      setUserOverallStaked(ethers.formatUnits(totalStaked, 18))
      setUserOverallClaimed(ethers.formatUnits(totalClaimed, 18))
    } catch (error) {
      console.error('Error fetching user overall stats:', error)
    }
  }, [address])

  const handleStakeUpdate = useCallback(() => {
    fetchBalance()
    fetchTotalStaked()
    fetchUserOverallStats()
  }, [fetchBalance, fetchTotalStaked, fetchUserOverallStats])

  useEffect(() => {
    if (isConnected) {
      fetchOverallStats()
      fetchUserOverallStats()
      handleStakeUpdate()
    }
  }, [isConnected, fetchOverallStats, fetchUserOverallStats, handleStakeUpdate])


  const progressPercentage = Math.min((parseFloat(totalStaked) / 1000000) * 100, 100)

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Wave background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-white" /> {/* Update 1 */}
        <Image
          src="/wave-background.png"
          alt="Background"
          layout="fill"
          objectFit="cover"
          className="opacity-50"
        />
      </div>
      <div className="relative z-10">
        {isConnected && <Sidebar />}
        <main className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-12 gap-8 mb-8">
              <div className="col-span-4 space-y-4">
                {/* Overall Staked BE */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-[#4F46E5]"> {/* Update 2 */}
                  <div className="flex items-center gap-2 mb-2">
                    <Image
                      src="/blocke-logo.png"
                      alt="BE Token"
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    <span className="text-lg font-medium text-black dark:text-white">Overall Staked BE:</span>
                  </div>
                  <p className="text-3xl font-bold text-purple-600">
                    <AnimatedStatsNumber value={overallStaked} /> BE
                  </p>
                </div>

                {/* Overall Claimed BE */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-[#4F46E5]"> {/* Update 2 */}
                  <div className="flex items-center gap-2 mb-2">
                    <Image
                      src="/blocke-logo.png"
                      alt="BE Token"
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    <span className="text-lg font-medium text-black dark:text-white">Overall Claimed BE:</span>
                  </div>
                  <p className="text-3xl font-bold text-purple-600">
                    <AnimatedStatsNumber value={overallClaimed} /> BE
                  </p>
                </div>

                {/* Overall Unstaked BE */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-[#4F46E5]">
                  <div className="flex items-center gap-2 mb-2">
                    <Image
                      src="/blocke-logo.png"
                      alt="BE Token"
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    <span className="text-lg font-medium text-black dark:text-white">Overall Unstaked BE:</span>
                  </div>
                  <p className="text-3xl font-bold text-purple-600">
                    <AnimatedStatsNumber value={overallUnstaked} /> BE
                  </p>
                </div>

                {/* Stake Count */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-[#4F46E5]">
                  <div className="flex items-center gap-2 mb-2">
                    <Image
                      src="/blocke-logo.png"
                      alt="BE Token"
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    <span className="text-lg font-medium text-black dark:text-white">Stake Count:</span>
                  </div>
                  <p className="text-3xl font-bold text-purple-600">
                    {stakeCount}
                  </p>
                </div>

                {/* Claim Count */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-[#4F46E5]">
                  <div className="flex items-center gap-2 mb-2">
                    <Image
                      src="/blocke-logo.png"
                      alt="BE Token"
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    <span className="text-lg font-medium text-black dark:text-white">Claim Count:</span>
                  </div>
                  <p className="text-3xl font-bold text-purple-600">
                    {claimCount}
                  </p>
                </div>

                {/* Unstake Count */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-[#4F46E5]">
                  <div className="flex items-center gap-2 mb-2">
                    <Image
                      src="/blocke-logo.png"
                      alt="BE Token"
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    <span className="text-lg font-medium text-black dark:text-white">Unstake Count:</span>
                  </div>
                  <p className="text-3xl font-bold text-purple-600">
                    {unstakeCount}
                  </p>
                </div>

                {/* Your Staked BE */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-[#4F46E5]"> {/* Update 2 */}
                  <div className="flex items-center gap-2 mb-2">
                    <Image
                      src="/blocke-logo.png"
                      alt="BE Token"
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    <span className="text-lg font-medium text-black dark:text-white">Your Staked BE:</span>
                  </div>
                  <p className="text-3xl font-bold text-purple-600">
                    <AnimatedStatsNumber value={userOverallStaked} /> BE
                  </p>
                </div>

                {/* Your Claimed BE */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-[#4F46E5]"> {/* Update 2 */}
                  <div className="flex items-center gap-2 mb-2">
                    <Image
                      src="/blocke-logo.png"
                      alt="BE Token"
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    <span className="text-lg font-medium text-black dark:text-white">Your Claimed BE:</span>
                  </div>
                  <p className="text-3xl font-bold text-purple-600">
                    <AnimatedStatsNumber value={userOverallClaimed} /> BE
                  </p>
                </div>
              </div>
              <div className="col-span-8">
                <div className="flex justify-between items-start mb-8">
                 <h1 className="text-4xl font-bold text-black dark:text-black">
                   BE Token Staking
                  </h1>
                  <APRInfoButton />
                </div>

                <div className="mb-8">
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden border-2 border-[#4F46E5]">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-sm text-gray-600">
                    <span>0 BE</span>
                    <span>{parseFloat(totalStaked).toFixed(2)} / 1,000,000 BE ({progressPercentage.toFixed(2)}%)</span>
                  </div>
                </div>

                <div className="flex items-center justify-center mb-8 gap-2 bg-white dark:bg-gray-800 rounded-xl p-4 border border-purple-200 text-black dark:text-white">
                  <Image
                    src="/blocke-logo.png"
                    alt="BE Token"
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                  <span className="text-lg font-semibold">
                    Available BE Balance: {parseFloat(balance).toFixed(2)}
                  </span>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-[#4F46E5]"> {/* Update 3 */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                      Stake BE Tokens
                    </label>
                    <input
                      type="text"
                      value={stakeAmount}
                      onChange={handleStakeAmountChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                      placeholder="Enter amount to stake"
                    />
                    {stakeError && <p className="mt-2 text-sm text-red-600">{stakeError}</p>}
                  </div>

                  <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                      Select Staking Lock Period
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {stakingPeriods.map((period) => (
                        <button
                          key={period.days}
                          onClick={() => setSelectedPeriod(period)}
                          className={`px-4 py-2 rounded-lg ${
                            selectedPeriod.days === period.days
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                          }`}
                        >
                          {period.days < 1 ? `${Math.round(period.days * 1440)} minute${period.days * 1440 > 1 ? 's' : ''}` : `${period.days} days`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-8">
                    <div className="max-w-xs mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-center text-white">
                      <div className="text-sm mb-1">Annual Percentage Rate</div>
                      <div className="text-4xl font-bold">{selectedPeriod.apr.toFixed(2)}%</div>
                      <div className="text-sm mt-2">APR</div>
                    </div>
                  </div>

                  <div className="mb-8 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Image
                        src="/blocke-logo.png"
                        alt="BE Token"
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                      <span className="text-lg font-medium">Expected BE Earnings:</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600 mt-2">
                      {expectedEarnings} BE
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={handleStake}
                      disabled={isLoading}
                      className="button w-full"
                    >
                      <span className="inner">
                        {isLoading ? 'Staking...' : 'STAKE BE'}
                      </span>
                      <span className="points_wrapper">
                        {[...Array(10)].map((_, i) => (
                          <span key={i} className="point"></span>
                        ))}
                      </span>
                      <span className="fold"></span>
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-black dark:text-white">
                  <h2 className="text-2xl font-semibold mb-6 text-purple-600 dark:text-purple-400">Staking History</h2>
                  <StakingHistory onStakeUpdate={handleStakeUpdate} stakingData={stakingData} transactionPending={transactionPending} />
                </div>

                {showRejected && (
                  <TransactionRejectedMessage onClose={() => setShowRejected(false)} />
                )}
                {(isProcessing || isCompleted) && !showCornerNotification && (
                  <TransactionStatus
                    isProcessing={isProcessing}
                    isCompleted={isCompleted}
                    onClose={() => {
                      setIsProcessing(false)
                      setIsCompleted(false)
                      setShowCornerNotification(true)
                    }}
                  />
                )}
                {showCornerNotification && (
                  <TransactionStatus
                    isProcessing={false}
                    isCompleted={true}
                    onClose={() => setShowCornerNotification(false)}
                    isCornerNotification={true}
                  />
                )}
              </div>
            </div>
          </div>
        </main>
        <SocialMediaLinks />
      </div>
    </div>
  )
}

export default withWalletProtection(BEStaking)

