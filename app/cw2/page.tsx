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
import AddContactModal from '@/components/cw2/AddContactModal'; // Import the AddContactModal component
import CreateGroupModal from '@/components/cw2/CreateGroupModal'; // Import CreateGroupModal
import MembersListModal from '@/components/cw2/MembersListModal';
import { withWalletProtection } from '@/components/withWalletProtection'

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
  groupLogo?: string; // Add groupLogo property to the Group interface
}

function CW2Page() {
  const { isConnected, address } = useWallet()
  const [activeMenu, setActiveMenu] = useState<'contacts' | 'groups'>('contacts')
  const [showDepositWithdraw, setShowDepositWithdraw] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [showSidebar, setShowSidebar] = useState(false)
  const [showAddContact, setShowAddContact] = useState(false) // Add state for AddContactModal
  const [showCreateGroup, setShowCreateGroup] = useState(false) // Add state for CreateGroupModal
  const [showMembersListModal, setShowMembersListModal] = useState(false);
  const [selectedGroupForMembers, setSelectedGroupForMembers] = useState<Group | null>(null);

  const handleAddContact = async (name: string, contactAddress: string) => {
    if (!isConnected || !address) {
      alert("Please connect your wallet first.");
      return;
    }

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
      });

      if (!response.ok) {
        throw new Error('Failed to add contact');
      }

      // Close the modal
      setShowAddContact(false);
      
      // Trigger a refresh of the contacts list
      window.dispatchEvent(new CustomEvent('refreshContacts'));
    } catch (error) {
      console.error('Error adding contact:', error);
      alert('Failed to add contact. Please try again.');
    }
  };

  const handleShowMembersList = (group: Group) => {
    setSelectedGroupForMembers(group);
    setShowMembersListModal(true);
  };


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
          </div>

          <div className="w-80 bg-[#FAECFA] backdrop-blur-sm border-r border-purple-200 flex flex-col">
            <div className="flex-1 overflow-hidden">
              {activeMenu === 'contacts' ? (
                <ContactsMenu 
                  onSelectContact={setSelectedContact} 
                  selectedContact={selectedContact}
                  onShowAddContact={() => setShowAddContact(true)}
                />
              ) : (
                <GroupsMenu 
                  onSelectGroup={setSelectedGroup} 
                  selectedGroup={selectedGroup}
                  onShowCreateGroup={() => setShowCreateGroup(true)}
                  onShowMembersList={handleShowMembersList}
                />
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
      {showAddContact && (
        <AddContactModal 
          onClose={() => setShowAddContact(false)} 
          onAdd={handleAddContact}
          isFullScreen={true}
        />
      )}
      {showCreateGroup && (
        <CreateGroupModal 
          onClose={() => setShowCreateGroup(false)}
          onCreate={async (name, members) => {
            try {
              const response = await fetch('/api/groups', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  creatorAddress: address,
                  groupName: name,
                  members: members,
                }),
              });

              if (!response.ok) {
                throw new Error('Failed to create group');
              }

              setShowCreateGroup(false);
            } catch (error) {
              console.error('Failed to create group:', error);
            }
          }}
        />
      )}
      {showMembersListModal && selectedGroupForMembers && (
        <MembersListModal
          isOpen={showMembersListModal}
          onClose={() => setShowMembersListModal(false)}
          groupName={selectedGroupForMembers.groupName}
          members={selectedGroupForMembers.members}
          creatorAddress={selectedGroupForMembers.creatorAddress}
          groupLogo={selectedGroupForMembers.groupLogo}
          onLogoUpload={async (file) => {
            // Implement logo upload logic here
            console.log('Logo upload not implemented yet');
          }}
          isCreator={selectedGroupForMembers.creatorAddress.toLowerCase() === address?.toLowerCase()}
        />
      )}
    </div>
  )
}

export default withWalletProtection(CW2Page)

