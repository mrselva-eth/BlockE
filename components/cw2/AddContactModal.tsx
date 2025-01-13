import { useState, useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'

interface AddContactModalProps {
  onClose: () => void
  onAdd: (name: string, address: string) => void
  isFullScreen?: boolean
  contacts?: { contactAddress: string }[]
}

export default function AddContactModal({ onClose, onAdd, isFullScreen = false, contacts = [] }: AddContactModalProps) {
  const { address: walletAddress } = useWallet()
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [addressError, setAddressError] = useState<string | undefined>(undefined)
  const [allContacts, setAllContacts] = useState<string[]>([]); // State to store all contact addresses

  const fetchContacts = useCallback(async () => {
    try {
      const response = await fetch(`/api/contacts?userAddress=${walletAddress}`);
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
      const data = await response.json();
      setAllContacts(data.map((contact: { contactAddress: string }) => contact.contactAddress.toLowerCase()));
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  }, [walletAddress]);

  useEffect(() => {
    if (walletAddress) {
      fetchContacts();
    }
  }, [walletAddress, fetchContacts]);

  const isValidAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!isValidAddress(address)) {
      setAddressError('Invalid wallet address format.')
      return
    }

    if (allContacts.includes(address.toLowerCase())) {
      setAddressError('This address is already in your contact list.')
      return
    }

    try {
      await onAdd(name, address)
      setName('')
      setAddress('')
      setAddressError(undefined) // Reset error message
      onClose()
      // Refresh contacts list after adding a new contact
      fetchContacts();
    } catch (error) {
      console.error('Error adding contact:', error);
      alert('Failed to add contact. Please try again.');
    }
  }

  if (isFullScreen) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
        <div className="bg-[#FAECFA] rounded-xl p-6 w-full max-w-md mx-4 shadow-xl relative">
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
              {addressError && <p className="text-red-500 text-sm">{addressError}</p>}
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
          {addressError && <p className="text-red-500 text-sm">{addressError}</p>}
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

