'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import type { StakeData } from '@/types/StakeData';

interface StakingData {
  everStaked: boolean;
  everClaimed: boolean;
  everUnstaked: boolean;
  staked: StakeData[];
  stakeCount: number;
  claimCount: number;
  unstakeCount: number;
}

export function useStakingData(address: string | undefined | null) {
  const [stakingData, setStakingData] = useState<StakingData>({
    everStaked: false,
    everClaimed: false,
    everUnstaked: false,
    staked: [],
    stakeCount: 0,
    claimCount: 0,
    unstakeCount: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStakingData = useCallback(async () => {
    if (!address) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/staking?address=${address}`)
      if (!response.ok) {
        throw new Error('Failed to fetch staking data')
      }
      const data = await response.json()
      setStakingData(data)
    } catch (err) {
      console.error('Error fetching staking data:', err)
      setError('Failed to fetch staking data. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }, [address])

  useEffect(() => {
    fetchStakingData()
  }, [fetchStakingData])

  return { stakingData, isLoading, error }
}

