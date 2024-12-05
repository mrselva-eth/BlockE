'use client'

import { X } from 'lucide-react'

interface NetworkSwitchModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitch: () => Promise<void>
  targetNetwork: string
}

export default function NetworkSwitchModal({
  isOpen,
  onClose,
  onSwitch,
  targetNetwork
}: NetworkSwitchModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Network Switch Required</h2>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Please switch to {targetNetwork} network to continue
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={onSwitch}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Switch Network
        </button>
      </div>
    </div>
  )
}

