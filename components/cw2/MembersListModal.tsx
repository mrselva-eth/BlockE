'use client'

import { useState } from 'react'
import { X, Upload, Users } from 'lucide-react'
import Image from 'next/image'

interface Member {
  address: string;
}

interface MembersListModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupName: string;
  members: string[];
  creatorAddress: string;
  groupLogo?: string;
  onLogoUpload: (file: File) => Promise<void>;
  isCreator: boolean;
}

export default function MembersListModal({
  isOpen,
  onClose,
  groupName,
  members,
  creatorAddress,
  groupLogo,
  onLogoUpload,
  isCreator
}: MembersListModalProps) {
  const [uploading, setUploading] = useState(false)

  if (!isOpen) return null

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      await onLogoUpload(file)
    } catch (error) {
      console.error('Failed to upload logo:', error)
    } finally {
      setUploading(false)
    }
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-[#e0e7ff] rounded-xl p-6 w-full max-w-md mx-4 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="mt-4">
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              {groupLogo ? (
                <Image
                  src={groupLogo}
                  alt={groupName}
                  width={80}
                  height={80}
                  className="rounded-full"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                  <Users size={32} className="text-gray-400" />
                </div>
              )}
              {isCreator && (
                <label className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow-lg cursor-pointer hover:bg-gray-100">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleLogoChange}
                    disabled={uploading}
                  />
                  <Upload size={16} className={`${uploading ? 'animate-pulse' : ''}`} />
                </label>
              )}
            </div>
            <h3 className="mt-2 text-lg font-semibold">{groupName}</h3>
            <p className="text-sm text-gray-500">{members.length} members</p>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {members.map((member) => (
              <div
                key={member}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users size={16} className="text-gray-400" />
                  </div>
                  <span className="text-sm font-medium">{truncateAddress(member)}</span>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    member.toLowerCase() === creatorAddress.toLowerCase()
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {member.toLowerCase() === creatorAddress.toLowerCase() ? 'Owner' : 'Member'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

