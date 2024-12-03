'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Home } from 'lucide-react'

const sidebarItems = [
  { name: 'Home', href: '/', icon: Home },
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY })
      if (event.clientX < 50) {
        setIsOpen(true)
      } else if (event.clientX > 250 && isOpen) {
        setIsOpen(false)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isOpen])

  return (
    <>
      {!isOpen && (
        <button
          className="fixed left-4 top-1/2 transform -translate-y-1/2 z-40 text-gray-600 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-all duration-300"
          onMouseEnter={() => setIsOpen(true)}
        >
          <Menu size={24} className="animate-pulse" />
          <span className="sr-only">Open Menu</span>
        </button>
      )}
      <div
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-30 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        onMouseLeave={() => setIsOpen(false)}
      >
        <nav className="p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="flex items-center px-4 py-2 text-gray-700 rounded hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  {item.icon && <item.icon className="mr-2 h-5 w-5" />}
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

