'use client'

import { Fragment, useState, useEffect, useCallback } from 'react'
import { Menu, LogOut, Instagram, Youtube, Linkedin, Github, Twitter, DiscIcon as Discord, AlertCircle } from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'
import { useTheme } from 'next-themes'
import { useProfile } from '@/hooks/useProfile'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

const CEO_ADDRESS = '0x603fbF99674B8ed3305Eb6EA5f3491F634A402A6'

export default function NavbarProfile() {
  const { address, disconnectWallet, loggedOut, setLoggedOut } = useWallet()
  const [showDropdown, setShowDropdown] = useState(false)
  const { theme } = useTheme()
  const { profileData, isLoading, error, refetch: refetchProfile } = useProfile(address || "") // Provide default value for address
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const isCEO = address?.toLowerCase() === CEO_ADDRESS.toLowerCase()
  const defaultImage = isCEO ? '/ceo.png' : '/user.png' // Set default image based on CEO status

  const handleLogout = async () => {
    if (address) {
      try {
        await fetch('/api/others', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address, action: 'logout' }),
        });
      } catch (error) {
        console.error('Error logging out:', error);
      }
    }

    disconnectWallet();
    setShowDropdown(false);
    setLoggedOut(true);
  };

  const truncate = (str: string | undefined, len: number) => {
    if (!str) return ''
    return str.length > len ? `${str.substring(0, len / 2)}...${str.substring(str.length - len / 2)}` : str
  }

  useEffect(() => {
    if (showDropdown && address) {
      refetchProfile()
    }
  }, [showDropdown, address, refetchProfile])

  const fetchProfileImage = useCallback(async () => {
    if (!address) return; // Return early if address is not available

    try {
      const response = await fetch(`/api/profile?address=${address}`)
      if (response.ok) {
        const data = await response.json()
        setProfileImage(data.profile?.profileImage || null) // Set to null if no profile image
      }
    } catch (error) {
      console.error('Error fetching profile image:', error)
    }
  }, [address])

  useEffect(() => {
    if (address) {
      fetchProfileImage()
    }
  }, [address, fetchProfileImage])

  useEffect(() => {
    if (profileData?.profileImage) {
      setProfileImage(profileData.profileImage)
    }
  }, [profileData?.profileImage])

  useEffect(() => {
    // Reset loggedOut state when address changes (user connects a different wallet)
    if (address) {
      setLoggedOut(false);
    }
  }, [address, setLoggedOut]);

  if (!address) return null // Return null if address is not available

  const socialLinkIcons = {
    instagram: Instagram,
    youtube: Youtube,
    linkedin: Linkedin,
    github: Github,
    twitter: Twitter,
    discord: Discord,
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors overflow-hidden relative"
      >
        {/* Always show an image, defaulting to user.png or ceo.png */}
        <Image
          src={profileImage || defaultImage}
          alt="Profile"
          width={28}
          height={28}
          className="rounded-full border-2 border-purple-500"
        />
      </button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-800 rounded-md shadow-lg py-2 z-20 border border-purple-200 dark:border-purple-800`}
            style={{ background: theme === 'dark' ? '#1f2937' : 'white' }}
          >
            {isLoading ? (
              <p className="text-center py-2 text-sm text-black dark:text-black">Loading...</p>
            ) : error ? (
              <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <AlertCircle className="text-red-600 dark:text-red-600" />
                <p className="text-sm text-red-600">Error loading profile</p>
              </div>
            ) : profileData ? (
              <>
                <div className="flex items-center px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3 relative">
                    {profileData.profileImage ? (
                      <Image
                        src={profileData.profileImage || "/placeholder.svg"}
                        alt="Profile"
                        fill
                        className="object-cover rounded-full"
                      />
                    ) : (
                      <Image
                        src={isCEO ? '/ceo.png' : '/user.png'}
                        alt="Profile"
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-black">{profileData.name || truncate(address, 12)}</p>
                    <p className="text-xs text-gray-500 dark:text-black">{truncate(address, 12)}</p>
                  </div>
                </div>
                {profileData.bio && (
                  <p className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    {profileData.bio}
                  </p>
                )}
                {profileData.email && (
                  <a href={`mailto:${profileData.email}`} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 block">
                    {truncate(profileData.email, 24)}
                  </a>
                )}
                {/* Social Media Links */}
                {profileData.socialLinks && (
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex gap-4 mt-2">
                    {Object.entries(profileData.socialLinks).map(([platform, link]) => {
                      if (!link) return null;
                      const Icon = socialLinkIcons[platform as keyof typeof socialLinkIcons] || Fragment;
                      return (
                        <a
                          key={platform}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-500 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
                        >
                          <Icon size={20} />
                        </a>
                      );
                    })}
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-500 dark:hover:bg-gray-700 flex items-center mt-2"
                >
                  <LogOut size={18} className="mr-2" />
                  Log out
                </button>
              </>
            ) : (
              <p className="text-center py-2 text-sm text-gray-600 dark:text-gray-400">No profile found</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

