import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'

interface TransactionStatusProps {
  isProcessing: boolean
  isCompleted: boolean
  onClose: () => void
  message?: string
  isCornerNotification?: boolean
}

const TransactionStatus: React.FC<TransactionStatusProps> = ({
  isProcessing,
  isCompleted,
  onClose,
  message,
  isCornerNotification = false,
}) => {
  const [show, setShow] = useState(true)

  useEffect(() => {
    if (isCornerNotification && isCompleted) {
      const timer = setTimeout(() => {
        setShow(false)
        onClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isCompleted, isCornerNotification, onClose])

  if (!show) return null

  const containerClass = isCornerNotification
    ? 'fixed bottom-20 right-4 w-64 bg-white rounded-lg shadow-lg z-50'
    : 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'

  const contentClass = isCornerNotification
    ? 'p-4'
    : 'bg-white rounded-lg p-8 max-w-md w-full mx-4 relative'

  return (
    <div className={containerClass}>
      <div className={contentClass}>
        {!isCornerNotification && (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        )}
        <div className="flex flex-col items-center">
          <Image
            src={isProcessing ? "/processing.gif" : "/completed.gif"}
            alt={isProcessing ? "Processing" : "Completed"}
            width={100}
            height={100}
            className="mb-4"
          />
          <p className="text-lg font-semibold text-center">
            {message || (isProcessing ? "Transaction Processing" : "Transaction Completed")}
          </p>
        </div>
      </div>
    </div>
  )
}

export default TransactionStatus

