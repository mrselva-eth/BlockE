import { useState, useEffect, useCallback } from 'react'
import { Search, Plus } from 'lucide-react'
import AddContactModal from './AddContactModal'
import { useWallet } from '@/contexts/WalletContext'

interface Contact {
  _id: string;
  contactName: string;
  contactAddress: string;
}

interface ContactsMenuProps {
  onSelectContact: (contact: Contact) => void;
  selectedContact: Contact | null;
  onShowAddContact: () => void;
}

export default function ContactsMenu({ onSelectContact, selectedContact, onShowAddContact }: ContactsMenuProps) {
  const { address } = useWallet()
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddContact, setShowAddContact] = useState(false)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchContacts = useCallback(async () => {
    if (!address) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/contacts?userAddress=${address}`)
      if (!response.ok) {
        throw new Error('Failed to fetch contacts')
      }
      const fetchedContacts = await response.json()
      setContacts(fetchedContacts)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch contacts:', err)
      setError('Failed to load contacts. Please try again.')
      setContacts([])
    } finally {
      setIsLoading(false)
    }
  }, [address])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-3)}`
  }

  const filteredContacts = contacts.filter(contact =>
    contact.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.contactAddress.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-4 bg-[#FAECFA]">
      <div className="flex items-center mb-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search contacts..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
        <button
          className="ml-2 p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-colors"
          onClick={onShowAddContact}
        >
          <Plus size={20} />
        </button>
      </div>
      <div className="space-y-2 max-h-[calc(100vh-16rem)] overflow-y-auto contacts-scrollbar">
        {isLoading ? (
          <div className="text-center py-4 text-gray-500">Loading contacts...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">{error}</div>
        ) : filteredContacts.length > 0 ? (
          filteredContacts.map((contact) => (
            <div
              key={contact._id}
              className={`p-2 rounded-lg cursor-pointer transition-colors border-b border-gray-200 ${
                selectedContact?._id === contact._id
                  ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-500'
                  : 'bg-white hover:bg-gray-50'
              }`}
              onClick={() => onSelectContact(contact)}
            >
              <p className="font-semibold">{contact.contactName}</p>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">{truncateAddress(contact.contactAddress)}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(contact.contactAddress);
                    // Show temporary success message
                    const target = e.currentTarget;
                    target.textContent = 'Copied!';
                    setTimeout(() => {
                      target.textContent = 'Copy';
                    }, 2000);
                  }}
                  className="text-xs text-purple-600 hover:text-purple-700 px-2 py-1 rounded-md hover:bg-purple-50"
                >
                  Copy
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">No contacts found</div>
        )}
      </div>
    </div>
  )
}

