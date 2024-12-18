import { useState } from 'react'
import { X } from 'lucide-react'

interface AddContactModalProps {
  onClose: () => void
  onAdd: (name: string, address: string) => void
  isFullScreen?: boolean
}

export default function AddContactModal({ onClose, onAdd, isFullScreen = false }: AddContactModalProps) {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd(name, address)
  }

  if (isFullScreen) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
        <div className="bg-white rounded-xl p-6 w-96 max-w-[90vw] mx-4 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Add New Contact</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
              <X size={24} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Contact Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Wallet Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors font-medium"
            >
              Add Contact
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Add New Contact</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Contact Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Wallet Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors font-medium"
        >
          Add Contact
        </button>
      </form>
    </div>
  )
}

