import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'

interface MintAlertModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function MintAlertModal({ isOpen, onClose }: MintAlertModalProps) {
  const router = useRouter()

  if (!isOpen) return null

  const handleGoHome = () => {
    router.push('/')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-4 max-w-sm w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <div className="text-center pt-2">
          <h2 className="text-xl font-bold mb-3">Mint BE Token</h2>
          
          <p className="mb-4 text-gray-700">
            Switch to our home page to mint BE tokens on Polygon network
          </p>

          <div className="flex justify-center">
            <button onClick={handleGoHome} className="Btn-Container">
              <span className="text">Go Home</span>
              <div className="icon-Container">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 8h14M8 1l7 7-7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

