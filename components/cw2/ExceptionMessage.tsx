import React from 'react'
import { AlertCircle } from 'lucide-react'

interface ExceptionMessageProps {
  message: string
  onClose: () => void
}

const ExceptionMessage: React.FC<ExceptionMessageProps> = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 text-center relative">
        <button
          onClick={onClose}
          className="absolute right-2 top-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <AlertCircle size={24} className="text-red-600" />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-red-600 font-poppins">Exception Occurred</h2>
        <p className="mb-6 text-gray-700">{message}</p>
        <button
          onClick={onClose}
          className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default ExceptionMessage

