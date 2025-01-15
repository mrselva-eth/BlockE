'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { Instagram, Youtube, Linkedin, Edit2, Camera, Trash2, AlertCircle, Github, Twitter } from 'lucide-react'
import Image from 'next/image'
import { useBlockEUID } from '@/hooks/useBlockEUID'; // Import useBlockEUID

const CEO_ADDRESS = '0x603fbF99674B8ed3305Eb6EA5f3491F634A402A6'

interface Profile {
address: string;
name?: string;
beuid?: string;
profileImage?: string;
bio?: string;
instagramLink?: string;
youtubeLink?: string;
linkedinLink?: string;
email?: string;
githubLink?: string;
twitterLink?: string;
discordUsername?: string;
}

interface ProfileContentProps {
hasUID: boolean;
}

export default function ProfileContent({ hasUID }: ProfileContentProps) {
const { address } = useWallet()
const [isEditing, setIsEditing] = useState(false)
const [profile, setProfile] = useState<Profile>({ address: '' }) // Initialize with empty profile
const [previewImage, setPreviewImage] = useState<string | null>(null)
const [isLoading, setIsLoading] = useState(true); // Added isLoading state
const isCEO = address?.toLowerCase() === CEO_ADDRESS.toLowerCase()
const { ownedUIDs, refetchUIDs } = useBlockEUID(); // Access ownedUIDs and refetchUIDs

const fetchProfile = useCallback(async () => {
  setIsLoading(true); // Set loading to true before fetching
  if (!address) {
    setIsLoading(false)
    return
  }

  try {
    const response = await fetch(`/api/profile?address=${address}`)
    if (response.ok) {
      const data = await response.json()
      if (data.profile) {
        setProfile(data.profile)
      }
    }
  } catch (error) {
    console.error('Error fetching profile:', error)
  } finally {
    if (address) {
      refetchUIDs();
    }
    setIsLoading(false)
  }
}, [address, refetchUIDs])

useEffect(() => {
  fetchProfile()
}, [fetchProfile])

// Call refetchUIDs after successful profile fetch to update ownedUIDs
useEffect(() => {
  if (profile) {
    refetchUIDs();
  }
}, [profile, refetchUIDs]);

// Add hasUID check at the beginning
if (!hasUID) {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 max-w-lg">
        <div className="flex items-start">
          <AlertCircle className="text-yellow-400 mt-0.5 mr-3" size={20} />
          <div>
            <p className="text-yellow-700 font-medium">Access Restricted</p>
            <p className="text-yellow-600 mt-1">
              You need to own a BlockE UID to access the Profile page. Please mint a BlockE UID first.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const defaultImage = isCEO ? '/ceo.png' : '/user.png'

const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }
}

const handleRemoveImage = () => {
  setPreviewImage(null)
}

const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  const formData = new FormData(e.currentTarget)
  formData.append('address', address || '')

  try {
    const response = await fetch('/api/profile', {
      method: 'POST',
      body: formData,
    })

    if (response.ok) {
      // Refetch profile data after successful save
      await fetchProfile(); // Await the fetchProfile call
      setIsEditing(false)
      setPreviewImage(null) // Reset preview image after saving
    } else {
      throw new Error('Failed to save profile')
    }
  } catch (error) {
    console.error('Error saving profile:', error)
    alert('Failed to save profile. Please try again.')
  }
}


return (
  <div className="flex items-center justify-center min-h-[calc(100vh-16rem)] w-full"> {/* Added w-full */}
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg w-full max-w-2xl">
      {isLoading ? ( // Show loading state while fetching profile
        <div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : !isEditing ? ( // Show profile preview card when not editing
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-6">
            <div className="relative w-20 h-20 rounded-full overflow-hidden">
              <Image
                src={profile?.profileImage || defaultImage}
                alt="Profile"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">{profile?.name || 'Unnamed User'}</h2>
              <p className="text-gray-600 mb-4">{profile?.bio || 'No bio yet.'}</p> {/* Display "No bio yet" if bio is empty */}
              <div className="flex gap-4">
                {profile?.instagramLink && (
                  <a
                    href={profile.instagramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-500 hover:text-pink-600"
                  >
                    <Instagram size={24} />
                  </a>
                )}
                {profile?.youtubeLink && (
                  <a
                    href={profile.youtubeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-500 hover:text-red-600"
                  >
                    <Youtube size={24} />
                  </a>
                )}
                {profile?.linkedinLink && (
                  <a
                    href={profile.linkedinLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 hover:text-blue-800"
                  >
                    <Linkedin size={24} />
                  </a>
                )}
                {profile?.githubLink && (
                  <a href={profile.githubLink} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:text-gray-900 dark:text-gray-200 dark:hover:text-gray-100">
                    <Github size={24} />
                  </a>
                )}
                {profile?.twitterLink && (
                  <a href={profile.twitterLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-500">
                    <Twitter size={24} />
                  </a>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <Edit2 size={20} />
          </button>
        </div>
      ) : ( // Show editing form when isEditing is true
        <form onSubmit={handleSave} className="grid grid-cols-2 gap-8 w-full">
          <div className="space-y-6">
            <div className="flex-shrink-0 mb-6">
              <div className="relative">
                <Image
                  src={previewImage || profile.profileImage || defaultImage}
                  alt="Profile Preview"
                  width={120}
                  height={120}
                  className="rounded-full"
                />
                <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="file"
                    name="profileImage"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <Camera size={20} className="text-gray-600" />
                </label>
                {(previewImage || profile.profileImage) && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-0 right-0 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50"
                  >
                    <Trash2 size={20} className="text-red-600" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={profile.name}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  name="bio"
                  defaultValue={profile.bio}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={4}
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={profile.email}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
              <div className="flex items-center">
                <Instagram size={20} className="mr-2 text-pink-500" />
                <input
                  type="text"
                  name="instagramLink"
                  defaultValue={profile.instagramLink}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">YouTube</label>
              <div className="flex items-center">
                <Youtube size={20} className="mr-2 text-red-500" />
                <input
                  type="text"
                  name="youtubeLink"
                  defaultValue={profile.youtubeLink}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
              <div className="flex items-center">
                <Linkedin size={20} className="mr-2 text-blue-500" />
                <input
                  type="text"
                  name="linkedinLink"
                  defaultValue={profile.linkedinLink}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GitHub</label>
              <div className="flex items-center">
                <Github size={20} className="mr-2 text-gray-500" />
                <input
                  type="text"
                  name="githubLink"
                  defaultValue={profile.githubLink}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
              <div className="flex items-center">
                <Twitter size={20} className="mr-2 text-gray-500" />
                <input
                  type="text"
                  name="twitterLink"
                  defaultValue={profile.twitterLink}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
          <div className="col-span-2 flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false)
                setPreviewImage(null)
              }}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button type="submit" className="btn-23">
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      )}

      {profile && !isEditing && ( // Show edit button when not editing and profile exists
        <div className="absolute top-8 right-8">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Edit2 size={20} />
          </button>
        </div>
      )}
    </div>
  </div>
)
}

