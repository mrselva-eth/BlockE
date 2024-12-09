'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { ethers } from 'ethers'

const ETH_CHAIN_ID = '0x1'
const POLYGON_CHAIN_ID = '0x89'

export default function NetworkSwitchAlert() {
  const [showAlert, setShowAlert] = useState(false)
  const [targetNetwork, setTargetNetwork] = useState<'Ethereum' | 'Polygon' | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const checkNetwork = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const network = await provider.getNetwork()
        const chainId = '0x' + network.chainId.toString(16)

        const requiredChainId = pathname === '/dashboard' ? ETH_CHAIN_ID : POLYGON_CHAIN_ID
        const requiredNetwork = pathname === '/dashboard' ? 'Ethereum' : 'Polygon'

        if (chainId !== requiredChainId) {
          setTargetNetwork(requiredNetwork)
          setShowAlert(true)
        } else {
          setShowAlert(false)
        }
      }
    }

    checkNetwork()

    // Add event listener for network changes
    if (window.ethereum) {
      window.ethereum.on('chainChanged', checkNetwork)
      return () => {
        window.ethereum.removeListener('chainChanged', checkNetwork)
      }
    }
  }, [pathname])

  const handleSwitchNetwork = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: targetNetwork === 'Ethereum' ? ETH_CHAIN_ID : POLYGON_CHAIN_ID }],
        })
      } catch (error) {
        console.error('Failed to switch network:', error)
      }
    }
  }

  if (!showAlert) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <p className="text-lg font-medium text-gray-900 mb-4 font-poppins text-center">
          Please switch to {targetNetwork} network
        </p>
        <button
          onClick={handleSwitchNetwork}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-4 rounded-full transition-all duration-300 hover:from-purple-600 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-poppins"
        >
          Switch to {targetNetwork}
        </button>
      </div>
    </div>
  )
}

