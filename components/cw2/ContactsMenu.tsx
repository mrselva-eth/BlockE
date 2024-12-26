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
}

export default function ContactsMenu({ onSelectContact, selectedContact }: ContactsMenuProps) {
  const { address } = useWallet()
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddContact, setShowAddContact] = useState(false)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [error, setError] = useState<string | null>(null)

  const fetchContacts = useCallback(() => {
    if (!address) return;

    fetch(`/api/contacts?userAddress=${address}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch contacts')
        }
        return response.json()
      })
      .then(fetchedContacts => {
        setContacts(fetchedContacts)
      })
      .catch(err => {
        console.error('Failed to fetch contacts:', err)
        setError('Failed to load contacts. Please try again.')
      })
  }, [address])

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 5)}...${addr.slice(-3)}`
  }

  useEffect(() => {
    if (address) {
      fetchContacts()
    }
  }, [address, fetchContacts])

  const handleAddContact = async (name: string, contactAddress: string) => {
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: address,
          contactName: name,
          contactAddress: contactAddress,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add contact')
      }

      setShowAddContact(false)
      await fetchContacts()
    } catch (err) {
      console.error('Failed to add contact:', err)
      setError('Failed to add contact. Please try again.')
    }
  }

  const filteredContacts = contacts.filter(contact =>
    contact.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.contactAddress.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-4">
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
          onClick={() => setShowAddContact(true)}
        >
          <Plus size={20} />
        </button>
      </div>
      <div className="space-y-2">
        {filteredContacts.map((contact) => (
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
            <p className="text-sm text-gray-600">{truncateAddress(contact.contactAddress)}</p>
          </div>
        ))}
      </div>
      {error && (
        <p className="text-red-500 mt-2 text-sm">{error}</p>
      )}
      {showAddContact && (
        <AddContactModal 
          onClose={() => setShowAddContact(false)} 
          onAdd={handleAddContact} 
          isFullScreen={true}
        />
      )}
    </div>
  )
}

