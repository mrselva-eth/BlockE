'use client'

import { X } from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'

export default function NetworkWarningModal() {
  const { isConnected, isCorrectNetwork, switchNetwork } = useWallet()

  if (!isConnected || isCorrectNetwork) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Network Switch Required</h2>
          <button className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                BlockE is only available on Ethereum Mainnet
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={switchNetwork}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Switch Network
        </button>
      </div>
    </div>
  )
}

