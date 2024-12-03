'use client'

import { useState, useEffect } from 'react'
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
      <button
        className="fixed top-4 left-4 z-50 text-gray-600 hover:text-gray-800"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu size={24} />
      </button>
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
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

