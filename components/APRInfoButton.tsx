import { useState } from 'react'
import { Info } from 'lucide-react'
import APRInfoModal from './APRInfoModal'

export default function APRInfoButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="p-2 bg-purple-100 rounded-full text-purple-600 hover:bg-purple-200 transition-colors duration-200"
      >
        <Info size={24} />
      </button>
      <APRInfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}

