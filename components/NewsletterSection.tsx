'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Check, X } from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'

export default function NewsletterSection() {
  const { address } = useWallet() // Get connected wallet address
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          address // Include wallet address in request body
        }),
      })

      if (!response.ok) {
        const data = await response.json() // Get error message from response
        throw new Error(data.error || 'Subscription failed')
      }

      setStatus('success')
      setMessage('Thanks for subscribing! Welcome to the BlockE community!')
      setEmail('')
    } catch (error: any) { // Type error as any
      setStatus('error')
      setMessage(error.message || 'Subscription failed. Please try again.') // Use error message from the error object
    }
  }

  return (
    <div className="py-20">
      <div className="container mx-auto px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blockchain-blue to-blockchain-purple bg-clip-text text-transparent">
            Stay Updated
          </h2>
          <p className="text-xl mb-8 text-gray-600 dark:text-gray-300">
            Subscribe to our newsletter for the latest updates, features, and announcements.
          </p>

          <form onSubmit={handleSubmit} className="relative">
            <div className="flex max-w-md mx-auto">
              <div className="relative flex-grow">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-l-lg border-2 border-r-0 border-purple-200 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-6 py-3 bg-gradient-to-r from-blockchain-blue to-blockchain-purple text-white rounded-r-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Subscribe
              </button>
            </div>
          </form>

          <AnimatePresence mode="wait">
            {status !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mt-4 p-4 ${
                  status === 'success' ? 'text-green-800' : 'text-red-800'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {status === 'success' ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <X className="w-5 h-5" />
                  )}
                  {message}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

