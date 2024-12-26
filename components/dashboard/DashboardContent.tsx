'use client'

import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import ENSName from './ENSName'
import TransactionDetails from './TransactionDetails'
import TotalHoldings from './TotalHoldings'
import GasSpent from './GasSpent'
import Portfolio from './Portfolio'
import { useWallet } from '@/contexts/WalletContext'

interface DashboardContentProps {
  address: string
}

const CEO_ADDRESS = '0x603fbF99674B8ed3305Eb6EA5f3491F634A402A6'

export default function DashboardContent({ address }: DashboardContentProps) {
  const { address: connectedAddress } = useWallet()
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null)
  const [ensName, setEnsName] = useState<string | null>(null)
  const [isValidInput, setIsValidInput] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const calculateGasSpent = async (address: string, provider: ethers.Provider) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY
      const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.status === '1') {
        const totalGasSpent = data.result.reduce((total: number, tx: any) => {
          return total + (parseInt(tx.gasUsed) * parseInt(tx.gasPrice))
        }, 0)
        return ethers.formatEther(totalGasSpent.toString())
      }
      return '0'
    } catch (error) {
      console.error('Error calculating gas spent:', error)
      return '0'
    }
  }

  const saveSearchDetails = useCallback(async (
    searchedAddress: string, 
    resolvedAddr: string,
    totalHoldingsETH: number,
    totalHoldingsUSD: number,
    gasSpentETH: string,
    isEns: boolean
  ) => {
    try {
      const response = await fetch('/api/save-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          connectedAddress: connectedAddress || CEO_ADDRESS,
          searchedAddress,
          resolvedAddress: resolvedAddr,
          totalHoldingsETH,
          totalHoldingsUSD,
          gasSpentETH,
          isEns,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save search details')
      }
    } catch (error) {
      console.error('Error saving search details:', error)
    }
  }, [connectedAddress])

  useEffect(() => {
    const resolveAddressOrENS = async () => {
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

          const ethBalance = await provider.getBalance(resolvedAddr)
          const ethHoldings = parseFloat(ethers.formatEther(ethBalance))

          const ethPriceResponse = await fetch('/api/eth-price')
          const ethPriceData = await ethPriceResponse.json()
          const ethPrice = ethPriceData.price || 2000

          const totalHoldingsUSD = ethHoldings * ethPrice

          const gasSpent = await calculateGasSpent(resolvedAddr, provider)

          await saveSearchDetails(
            address,
            resolvedAddr,
            ethHoldings,
            totalHoldingsUSD,
            gasSpent,
            !!resolvedENS
          )
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
    }

    resolveAddressOrENS()
  }, [address, connectedAddress, saveSearchDetails])

  if (!address) {
    return (
      <div className="text-center text-gray-600 p-8 bg-white/80 rounded-xl shadow-lg backdrop-blur-sm">
        <p className="text-xl">Enter an ENS name or Ethereum address to view dashboard</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="animate-pulse bg-white/80 rounded-xl p-4 w-full">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-white/80 rounded-xl p-6">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
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
    <div className="space-y-6 max-w-4xl mx-auto">
      <ENSName address={resolvedAddress} ensName={ensName} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TransactionDetails address={resolvedAddress} />
        <TotalHoldings address={resolvedAddress} />
        <GasSpent address={resolvedAddress} />
        <Portfolio address={resolvedAddress} />
      </div>
    </div>
  )
}

