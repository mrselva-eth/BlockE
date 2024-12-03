'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

const sidebarItems = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'CW²', href: '/cw2' },
  { name: 'BlockE AI', href: '/blocke-ai' },
  { name: 'Cex and Dex', href: '/cex-and-dex' },
  { name: 'Predictive Analytics', href: '/predictive-analytics' },
  { name: 'Social Media Sentiment Analysis', href: '/sentiment-analysis' },
  { name: 'Wallet Clustering', href: '/wallet-clustering' },
  { name: 'NFT Analytics', href: '/nft-analytics' },
  { name: 'Whale Alert', href: '/whale-alert' },
  { name: 'Gas Price Forecasting', href: '/gas-price-forecasting' },
]

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {!isOpen && (
        <button
          className="fixed left-4 top-1/2 transform -translate-y-1/2 z-40 text-gray-600 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-all duration-300 group"
          onClick={() => setIsOpen(true)}
          onMouseEnter={() => setIsOpen(true)}
        >
          <Menu size={24} className="animate-pulse" />
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Menu
          </span>
        </button>
      )}
      <div
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-30 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        onMouseLeave={() => setIsOpen(false)}
      >
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
          onClick={() => setIsOpen(false)}
        >
          <X size={24} />
        </button>
        <nav className="mt-16">
          <ul>
            {sidebarItems.map((item) => (
              <li key={item.name} className="mb-2">
                <Link
                  href={item.href}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  )
}

