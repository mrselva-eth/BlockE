import React from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle } from 'lucide-react'

const BlockEUIDAlert: React.FC = () => {
  const router = useRouter()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
        <AlertTriangle className="mx-auto mb-4 text-yellow-500" size={48} />
        <h2 className="text-2xl font-bold mb-4 text-gray-800">BlockE UID Required</h2>
        <p className="mb-6 text-gray-600">
          You need a BlockE UID to access this page. BlockE UID is the key to unlock all features of the BlockE project.
        </p>
        <button
          onClick={() => router.push('/blocke-uid')}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-colors"
        >
          Get BlockE UID
        </button>
      </div>
    </div>
  )
}

export default BlockEUIDAlert

