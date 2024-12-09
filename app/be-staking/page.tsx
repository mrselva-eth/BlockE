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

const stakingPeriods = [
  { days: 1/1440, apr: 1000 }, // 1 minute for testing (1000% APR)
  { days: 15, apr: 227.8 },
  { days: 30, apr: 250 },
  { days: 45, apr: 275 },
  { days: 60, apr: 300 },
  { days: 90, apr: 350 },
]

export default function BEStaking() {
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

  useEffect(() => {
    if (isConnected && address) {
      fetchBalance()
      fetchTotalStaked()
    }
  }, [isConnected, address])

  useEffect(() => {
    calculateExpectedEarnings()
  }, [stakeAmount, selectedPeriod])

  const fetchBalance = async () => {
    try {
      const provider = new ethers.JsonRpcProvider('https://polygon-rpc.com')
      const contract = new ethers.Contract(BE_TOKEN_ADDRESS, BE_TOKEN_ABI, provider)
      const balance = await contract.balanceOf(address)
      setBalance(ethers.formatUnits(balance, 18))
    } catch (error) {
      console.error('Error fetching balance:', error)
    }
  }

  const fetchTotalStaked = async () => {
    try {
      const provider = new ethers.JsonRpcProvider('https://polygon-rpc.com')
      const contract = new ethers.Contract(BE_STAKING_ADDRESS, BE_STAKING_ABI, provider)
      const stakes = await contract.getUserStakes(address)
      const total = stakes.reduce((acc: bigint, stake: any) => acc + stake.amount, BigInt(0))
      setTotalStaked(ethers.formatUnits(total, 18))
    } catch (error) {
      console.error('Error fetching total staked:', error)
    }
  }

  const calculateExpectedEarnings = () => {
    if (!stakeAmount) {
      setExpectedEarnings('0')
      return
    }

    const amount = parseFloat(stakeAmount)
    const apr = selectedPeriod.apr / 100
    const days = selectedPeriod.days
    
    const earnings = (amount * apr * days) / 365
    setExpectedEarnings(earnings.toFixed(3))
  }

  const handleStakeAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '' || (/^\d*\.?\d*$/.test(value) && parseFloat(value) >= 0)) {
      setStakeAmount(value)
      setStakeError('')
    } else {
      setStakeError('Please enter a valid positive number')
    }
  }

  const handleStake = async () => {
    if (!stakeAmount || !isConnected || parseFloat(stakeAmount) <= 0) {
      setStakeError('Please enter a valid stake amount')
      return
    }

    setIsStaking(true)
    setTransactionPending(true)
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const beToken = new ethers.Contract(BE_TOKEN_ADDRESS, BE_TOKEN_ABI, signer)
      const staking = new ethers.Contract(BE_STAKING_ADDRESS, BE_STAKING_ABI, signer)

      const amount = ethers.parseUnits(stakeAmount, 18)
      const periodIndex = stakingPeriods.findIndex(p => p.days === selectedPeriod.days)

      // Approve tokens
      const tx1 = await beToken.approve(BE_STAKING_ADDRESS, amount)
      await tx1.wait()

      // Stake tokens
      const tx2 = await staking.stake(amount, periodIndex)
      await tx2.wait()

      // Refresh data
      fetchBalance()
      fetchTotalStaked()
      setStakeAmount('')
    } catch (error: any) {
      console.error('Staking error:', error)
      if (error.code === 4001 || (error.info && error.info.error && error.info.error.code === 4001)) {
        setShowRejected(true)
      } else {
        alert(`Staking failed: ${error.message || 'Unknown error'}`)
      }
    } finally {
      setIsStaking(false)
      setTransactionPending(false)
    }
  }

  const handleStakeUpdate = useCallback(() => {
    fetchBalance()
    fetchTotalStaked()
  }, [fetchBalance, fetchTotalStaked])

  const progressPercentage = Math.min((parseFloat(totalStaked) / 1000000) * 100, 100)

  return (
    <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/staking-background.png')" }}>
      {isConnected && <Sidebar />}
      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto border border-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 bg-white shadow-xl">
          <h1 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            BE Token Staking
          </h1>

          {/* Progress Pipeline */}
          <div className="mb-8">
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden border border-purple-200">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1 }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>0 BE</span>
              <span>Max: 1,000,000 BE</span>
            </div>
          </div>

          {/* Available Balance */}
          <div className="flex items-center justify-center mb-8 gap-2">
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

          {/* Staking Form */}
          <div className="bg-white rounded-xl p-6 mb-8">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stake BE Tokens
              </label>
              <input
                type="text"
                value={stakeAmount}
                onChange={handleStakeAmountChange}
                className={`w-full p-3 border ${stakeError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                placeholder="Enter amount to stake"
              />
              {stakeError && <p className="mt-2 text-sm text-red-600">{stakeError}</p>}
            </div>

            {/* Lock Period Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Staking Lock Period
              </label>
              <div className="flex flex-wrap gap-3">
                {stakingPeriods.map((period) => (
                  <button
                    key={period.days}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      selectedPeriod.days === period.days
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {period.days < 1 ? `${Math.round(period.days * 1440)} minute${period.days * 1440 > 1 ? 's' : ''}` : `${period.days} days`}
                  </button>
                ))}
              </div>
            </div>

            {/* APR Display */}
            <div className="mb-8">
              <div className="max-w-xs mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-center text-white">
                <div className="text-sm mb-1">Annual Percentage Rate</div>
                <div className="text-4xl font-bold">{selectedPeriod.apr.toFixed(2)}%</div>
                <div className="text-sm mt-2">APR</div>
              </div>
            </div>

            {/* Expected Earnings */}
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

            {/* Stake Button */}
            <button
              onClick={handleStake}
              disabled={isStaking || !stakeAmount || parseFloat(stakeAmount) <= 0}
              className="button w-full"
            >
              <div className="points_wrapper">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="point" />
                ))}
              </div>
              <span className="inner">
                {isStaking ? 'Staking...' : 'Stake'}
              </span>
              <span className="fold" />
            </button>
          </div>

          {/* Staking History */}
          <StakingHistory onStakeUpdate={handleStakeUpdate} transactionPending={transactionPending} />

          {/* Transaction Rejected Message */}
          {showRejected && (
            <TransactionRejectedMessage onClose={() => setShowRejected(false)} />
          )}
        </div>
      </main>
      <SocialMediaLinks />
    </div>
  )
}

