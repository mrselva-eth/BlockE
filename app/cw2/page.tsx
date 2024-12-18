'use client'

import { useState } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import CW2Header from '@/components/cw2/CW2Header'
import ContactsMenu from '@/components/cw2/ContactsMenu'
import GroupsMenu from '@/components/cw2/GroupsMenu'
import ChatInterface from '@/components/cw2/ChatInterface'
import AvailableBalance from '@/components/cw2/AvailableBalance'
import DepositWithdrawModal from '@/components/cw2/DepositWithdrawModal'
import CW2Sidebar from '@/components/cw2/CW2Sidebar'
import Image from 'next/image'

interface Contact {
  _id: string;
  contactName: string;
  contactAddress: string;
}

interface Group {
  _id: string;
  groupName: string;
  members: string[];
  creatorAddress: string;
}

export default function CW2Page() {
  const { isConnected } = useWallet()
  const [activeMenu, setActiveMenu] = useState<'contacts' | 'groups'>('contacts')
  const [showDepositWithdraw, setShowDepositWithdraw] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [showSidebar, setShowSidebar] = useState(false)

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-lg text-gray-600">Please connect your wallet to access CW2</p>
      </div>
    )
  }

  const handleMenuChange = (menu: 'contacts' | 'groups') => {
    setActiveMenu(menu)
    setSelectedContact(null)
    setSelectedGroup(null)
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <CW2Sidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <CW2Header 
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          activeMenu={activeMenu}
          handleMenuChange={handleMenuChange}
        />
        <div className="flex-1 flex relative">
          {/* Background Image */}
          <div className="absolute inset-0 -z-10">
            <Image
              src="/cw2background.png"
              alt="CW2 Background"
              layout="fill"
              objectFit="cover"
              quality={100}
              priority
            />
          </div>

          <div className="w-80 bg-white/90 backdrop-blur-sm border-r border-purple-200 flex flex-col">
            <div className="flex-1 overflow-hidden">
              {activeMenu === 'contacts' ? (
                <ContactsMenu onSelectContact={setSelectedContact} selectedContact={selectedContact} />
              ) : (
                <GroupsMenu onSelectGroup={setSelectedGroup} selectedGroup={selectedGroup} />
              )}
            </div>
          </div>
          
          <div className="flex-1 bg-white/80 backdrop-blur-sm">
            <ChatInterface 
              selectedContact={selectedContact}
              selectedGroup={selectedGroup}
              isGroup={activeMenu === 'groups'}
            />
          </div>
        </div>
      </div>
      <AvailableBalance onDepositWithdrawClick={() => setShowDepositWithdraw(true)} />
      {showDepositWithdraw && (
        <DepositWithdrawModal onClose={() => setShowDepositWithdraw(false)} />
      )}
    </div>
  )
}

