'use client'

import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import ENSName from './ENSName'
import TransactionDetails from './TransactionDetails'
import TotalHoldings from './TotalHoldings'
import GasSpent from './GasSpent'
import ActivityHeatmap from './ActivityHeatmap'
import TransactionHistory from './TransactionHistory'
import PortfolioPerformance from './PortfolioPerformance'
import TokenTransferHistory from './TokenTransferHistory'
import NFTHoldings from './NFTHoldings'
import { useWallet } from '@/contexts/WalletContext'

interface DashboardContentProps {
  address: string
}

export default function DashboardContent({ address }: DashboardContentProps) {
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null)
  const [ensName, setEnsName] = useState<string | null>(null)
  const [isValidInput, setIsValidInput] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resolveAddressOrENS = useCallback(async () => {
    if (!address) {
      setResolvedAddress(null)
      setEnsName(null)
      setIsValidInput(false)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const provider = new ethers.JsonRpcProvider(
        `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`
      )

      let resolvedAddr: string | null = null
      let resolvedENS: string | null = null

      if (address.endsWith('.eth')) {
        resolvedAddr = await provider.resolveName(address)
        if (resolvedAddr) {
          resolvedENS = address
        }
      } else if (ethers.isAddress(address)) {
        resolvedAddr = address
        resolvedENS = await provider.lookupAddress(address)
      }

      if (resolvedAddr) {
        setResolvedAddress(resolvedAddr)
        setEnsName(resolvedENS)
        setIsValidInput(true)
      } else {
        setError('Invalid Ethereum address or ENS name')
        setIsValidInput(false)
      }
    } catch (err) {
      console.error('Error resolving address or ENS:', err)
      setError('Error resolving address or ENS. Please try again.')
      setIsValidInput(false)
    } finally {
      setIsLoading(false)
    }
  }, [address])

  useEffect(() => {
    resolveAddressOrENS()
  }, [resolveAddressOrENS])

  if (!address) {
    return (
      <div className="text-center text-gray-600 p-8 bg-white/80 rounded-xl shadow-lg backdrop-blur-sm">
        <p className="text-xl">Enter an ENS name, Ethereum address, or BE UID to view dashboard</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white/80 rounded-xl p-6 h-48">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-8 bg-white/80 rounded-xl shadow-lg backdrop-blur-sm">
        <p className="text-xl">{error}</p>
      </div>
    )
  }

  if (!isValidInput || !resolvedAddress) {
    return (
      <div className="text-center text-red-500 p-8 bg-white/80 rounded-xl shadow-lg backdrop-blur-sm">
        <p className="text-xl">Invalid Ethereum address or ENS name</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Header with ENS Name */}
      <ENSName address={resolvedAddress} ensName={ensName} />

      {/* Top Row - Quick Stats */}
      <div className="grid grid-cols-3 gap-2">
        <TransactionDetails address={resolvedAddress} />
        <TotalHoldings address={resolvedAddress} />
        <GasSpent address={resolvedAddress} />
      </div>

      {/* Middle Row - Activity and Portfolio */}
      <div className="grid grid-cols-2 gap-2">
        <ActivityHeatmap address={resolvedAddress} />
        <PortfolioPerformance address={resolvedAddress} />
      </div>

      {/* Transaction History Section */}
      <TransactionHistory address={resolvedAddress} />

      {/* Token Transfers Section */}
      <TokenTransferHistory address={resolvedAddress} />

      {/* NFT Holdings Section */}
      <NFTHoldings address={resolvedAddress} />
    </div>
  )
}

