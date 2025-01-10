import React from 'react'
import { X } from 'lucide-react'
import Image from 'next/image'

interface TransactionRejectedMessageProps {
  onClose: () => void
}

const TransactionRejectedMessage: React.FC<TransactionRejectedMessageProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 text-center relative">
        <button
          onClick={onClose}
          className="absolute right-2 top-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X size={24} className="text-indigo-600 hover:text-purple-600" />
        </button>
        <Image
          src="/rejected.gif"
          alt="Transaction Rejected"
          width={200}
          height={200}
          className="mx-auto mb-4"
        />
        <h2 className="text-2xl font-bold mb-4 text-red-600 font-poppins">Transaction Rejected</h2>
        <p className="mb-6 text-gray-700">You have rejected the transaction in your wallet. Please try again if you wish to proceed.</p>
        <button
          onClick={onClose}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-purple-600 hover:to-indigo-600 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default TransactionRejectedMessage

