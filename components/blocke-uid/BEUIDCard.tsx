'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Shield, CheckCircle } from 'lucide-react'
import { useState } from 'react'

interface BEUIDCardProps {
  uid: string;
  formattedUid: string;
  digits: number;
  mintedAt?: Date;
}

export default function BEUIDCard({ uid, formattedUid, digits, mintedAt }: BEUIDCardProps) {
  //const [copied, setCopied] = useState(false)

  //const handleCopy = async () => {
  //  await navigator.clipboard.writeText(formattedUid)
  //  setCopied(true)
  //  setTimeout(() => setCopied(false), 2000)
  //}

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full max-w-md mx-auto"
    >
      <div className="relative bg-gradient-to-br from-[#4F46E5] via-[#7C3AED] to-[#9333EA] p-[2px] rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 backdrop-blur-sm relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Image
                src="/blocke-logo.png"
                alt="BlockE Logo"
                width={32}
                height={32}
                className="rounded-full"
              />
              <h3 className="text-lg font-bold bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent">
                BlockE UID Card
              </h3>
            </div>
            <Shield className="w-6 h-6 text-[#4F46E5]" />
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 dark:text-gray-400">Identifier</label>
              <div className="flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <span className="font-mono text-lg font-semibold text-[#4F46E5] dark:text-[#7C3AED]">
                  {formattedUid}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <label className="text-xs text-gray-500 dark:text-gray-400">Length</label>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{digits} digits</p>
              </div>
              {mintedAt && (
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <label className="text-xs text-gray-500 dark:text-gray-400">Minted</label>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {new Date(mintedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-8 opacity-10">
            <div className="relative w-full h-full">
              <div className="absolute inset-0 bg-[url('/security-pattern.png')] bg-repeat-x animate-slide" />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-xl pointer-events-none transform -rotate-12 scale-95 opacity-0 hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  )
}

