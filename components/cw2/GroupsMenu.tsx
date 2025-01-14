'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Users, Upload, AlertCircle, Trash2 } from 'lucide-react'
import MembersListModal from './MembersListModal'
import { useWallet } from '@/contexts/WalletContext'
import { createGroup as createGroupOnChain, getBalance, deleteGroup } from '@/utils/cw2ContractInteractions'
import { ethers } from 'ethers'
import Image from 'next/image'
import ExceptionMessage from './ExceptionMessage'

interface Group {
  _id: string;
  groupName: string;
  members: string[];
  creatorAddress: string;
  groupLogo?: string;
}

interface GroupsMenuProps {
  onSelectGroup: (group: Group) => void;
  selectedGroup: Group | null;
  onShowCreateGroup: () => void;
  onShowMembersList: (group: Group) => void;
}

export default function GroupsMenu({ onSelectGroup, selectedGroup, onShowCreateGroup, onShowMembersList }: GroupsMenuProps) {
  const { address } = useWallet()
  const [searchTerm, setSearchTerm] = useState('')
  const [showMembersModal, setShowMembersModal] = useState(false)
  const [selectedGroupForMembers, setSelectedGroupForMembers] = useState<Group | null>(null)
  const [groups, setGroups] = useState<Group[]>([])
  const [error, setError] = useState<string | null>(null)
  const [balance, setBalance] = useState<string>('0')
  const [showMembersAlert, setShowMembersAlert] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [exceptionMessage, setExceptionMessage] = useState<string | null>(null)

  const fetchGroups = useCallback(async () => {
    try {
      const response = await fetch(`/api/groups?userAddress=${address}`)
      if (!response.ok) {
        throw new Error('Failed to fetch groups')
      }
      const fetchedGroups = await response.json()
      setGroups(fetchedGroups)
    } catch (err) {
      console.error('Failed to fetch groups:', err)
      setError('Failed to load groups. Please try again.')
    }
  }, [address])

  const fetchBalance = useCallback(async () => {
    try {
      const userBalance = await getBalance(address!)
      setBalance(userBalance)
    } catch (err) {
      console.error('Failed to fetch balance:', err)
    }
  }, [address])

  useEffect(() => {
    if (address) {
      fetchGroups()
      fetchBalance()
    }
  }, [address, fetchGroups, fetchBalance])

  const handleCreateGroup = async (name: string, members: string[]) => {
    setError(null)
    try {
      const groupCreationCost = ethers.parseEther('100')
      if (ethers.parseEther(balance) < groupCreationCost) {
        throw new Error('Insufficient balance to create a group. You need at least 100 BE tokens.')
      }

      await createGroupOnChain()
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
      })

      if (!response.ok) {
        throw new Error('Failed to create group')
      }

      await fetchGroups()
      await fetchBalance()
    } catch (err: any) {
      console.error('Failed to create group:', err)
      setError(err.message || 'Failed to create group. Please try again.')
    }
  }

  const handleMembersClick = (group: Group, event: React.MouseEvent) => {
    event.stopPropagation()
    if (group.creatorAddress.toLowerCase() !== address?.toLowerCase()) {
      setExceptionMessage("Only group creators can view member details")
    } else {
      setSelectedGroupForMembers(group)
      onShowMembersList(group)
    }
  }

  const handleLogoUpload = async (file: File) => {
    if (!selectedGroupForMembers) return

    try {
      setUploading(true)
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = error => reject(error)
      })

      const response = await fetch('/api/groups', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId: selectedGroupForMembers._id,
          groupLogo: base64,
          userAddress: address
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update group logo')
      }

      await fetchGroups()
    } catch (err) {
      console.error('Failed to upload logo:', err)
      setError('Failed to upload logo. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteGroup = async (groupId: string) => {
    try {
      await deleteGroup(groupId)
      const response = await fetch(`/api/groups/${groupId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete group from database')
      }
      fetchGroups()
    } catch (error: any) {
      console.error('Failed to delete group:', error)
      setError(error.message || 'Failed to delete group. Please try again.')
    }
  }

  const filteredGroups = groups.filter(group =>
    group.groupName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-4 bg-[#FAECFA]">
      <div className="flex items-center mb-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search groups..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
        <button
          className="ml-2 p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-colors"
          onClick={onShowCreateGroup}
        >
          <Plus size={20} />
        </button>
      </div>
      <div className="mb-4">
        <p className="text-sm text-gray-600">Available Balance: {balance} BE</p>
      </div>
      <div className="space-y-2 max-h-[calc(100vh-16rem)] overflow-y-auto contacts-scrollbar">
        {filteredGroups.map((group) => (
          <div
            key={group._id}
            className={`p-2 rounded-lg cursor-pointer transition-colors border-b border-gray-200 ${
              selectedGroup?._id === group._id
                ? 'bg-blue-100 border-2 border-blue-500'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            onClick={() => onSelectGroup(group)}
          >
            <div className="relative flex items-center gap-2">
              {group.groupLogo ? (
                <Image
                  src={group.groupLogo}
                  alt={group.groupName}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <Users size={20} className="text-gray-500" />
                </div>
              )}
              <div className="flex-grow">
                <p className="font-semibold">{group.groupName}</p>
                <div className="flex items-center text-sm text-gray-600">
                  <button
                    onClick={(e) => handleMembersClick(group, e)}
                    className="flex items-center hover:text-blue-500"
                  >
                    <Users size={16} className="mr-1" />
                    {group.members.length} members
                  </button>
                </div>
              </div>
              {group.creatorAddress.toLowerCase() === address?.toLowerCase() && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteGroup(group._id)
                  }}
                  className="absolute top-2 right-2 p-1 rounded-full hover:bg-red-100 text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {error && (
        <p className="text-red-500 mt-2 text-sm">{error}</p>
      )}
      {exceptionMessage && (
        <ExceptionMessage 
          message={exceptionMessage} 
          onClose={() => setExceptionMessage(null)} 
        />
      )}
    </div>
  )
}

