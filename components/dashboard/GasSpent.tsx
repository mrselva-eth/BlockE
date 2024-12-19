'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { Fuel } from 'lucide-react'
import Image from 'next/image'

export default function GasSpent({ address }: { address: string }) {
  const [gasSpent, setGasSpent] = useState<string>('0')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchGasSpent = async () => {
      const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY
      const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`

      try {
        const response = await fetch(url)
        const data = await response.json()
        if (data.status === '1') {
          const totalGasSpent = data.result.reduce((total: number, tx: any) => {
            return total + (parseInt(tx.gasUsed) * parseInt(tx.gasPrice))
          }, 0)
          const formattedGas = ethers.formatEther(totalGasSpent.toString())
          setGasSpent(parseFloat(formattedGas).toFixed(4))
        }
      } catch (error) {
        console.error('Error fetching gas spent:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchGasSpent()
  }, [address])

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
        <div className="h-7 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg p-6 border border-purple-100 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/gasspent.gif"
          alt="Gas Spent Background"
          layout="fill"
          objectFit="cover"
          quality={100}
          className="opacity-30"
        />
      </div>
      <div className="relative z-10">
        <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
          <Fuel className="w-6 h-6" />
          Total Gas Spent
        </h2>

        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-gray-900">{gasSpent}</p>
          <p className="text-lg text-gray-600">ETH</p>
        </div>
      </div>
    </div>
  )
}

