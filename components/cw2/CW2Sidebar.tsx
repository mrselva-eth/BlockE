'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, Home, LayoutDashboard, Coins, Binary, Bot, ArrowLeftRight, BarChart2, MessageCircle, Network, ImageIcon, FishIcon as Whale, FuelIcon as GasPump } from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'

const CEO_ADDRESS = '0x603fbF99674B8ed3305Eb6EA5f3491F634A402A6'

const allSidebarItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'BE Staking', href: '/be-staking', icon: Coins },
  { name: 'CW²', href: '/cw2', icon: Binary },
  { name: 'BlockE AI', href: '/blocke-ai', icon: Bot },
  { name: 'Cex and Dex', href: '/cex-and-dex', icon: ArrowLeftRight },
  { name: 'Predictive Analytics', href: '/predictive-analytics', icon: BarChart2, ceoOnly: true },
  { name: 'Social Media Sentiment Analysis', href: '/sentiment-analysis', icon: MessageCircle, ceoOnly: true },
  { name: 'Wallet Clustering', href: '/wallet-clustering', icon: Network, ceoOnly: true },
  { name: 'NFT Analytics', href: '/nft-analytics', icon: ImageIcon, ceoOnly: true },
  { name: 'Whale Alert', href: '/whale-alert', icon: Whale, ceoOnly: true },
  { name: 'Gas Price Forecasting', href: '/gas-price-forecasting', icon: GasPump, ceoOnly: true },
]

interface CW2SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CW2Sidebar({ isOpen, onClose }: CW2SidebarProps) {
  const { address } = useWallet()
  const isCEO = address?.toLowerCase() === CEO_ADDRESS.toLowerCase()
  const sidebarItems = allSidebarItems.filter(item => !item.ceoOnly || isCEO)

  return (
    <div
      className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-30 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <nav className="p-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={24} className="text-gray-600" />
          <span className="sr-only">Close Sidebar</span>
        </button>
        <ul className="space-y-2 mt-8">
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
  )
}

