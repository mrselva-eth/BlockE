'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { X, Home, LayoutDashboard, Coins, Binary, Bot, ArrowLeftRight, BarChart2, MessageCircle, Network, ImageIcon, FishIcon as Whale, FuelIcon as GasPump, Gift } from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'
import { usePathname } from 'next/navigation';

const CEO_ADDRESS = '0x603fbF99674B8ed3305Eb6EA5f3491F634A402A6'

const allSidebarItems = [
 { name: 'Home', href: '/', icon: Home },
 { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
 { name: 'BE Staking', href: '/be-staking', icon: Coins },
 { name: 'CW²', href: '/cw2', icon: Binary },
 { name: 'BlockE AI', href: '/blocke-ai', icon: Bot },
 { name: 'Cex and Dex', href: '/cex-and-dex', icon: ArrowLeftRight },
 { name: 'BE Drop', href: '/be-drop', icon: Gift }, // BE Drop menu item
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
 const pathname = usePathname();

 const handlePageVisit = useCallback((href: string) => {
  if (address) {
    fetch('/api/others', { // Update API endpoint
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, action: 'pageVisit', page: href }),
    }).catch(error => console.error('Error logging page visit:', error))
  }
}, [address])

 return (
   <div
     className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out z-30 overflow-y-auto ${
       isOpen ? 'translate-x-0' : '-translate-x-full'
     }`}
   >
     <nav className="p-4 custom-scrollbar">
       <button
         onClick={onClose}
         className="absolute top-4 right-4 p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-colors"
       >
         <X size={24} />
         <span className="sr-only">Close Sidebar</span>
       </button>
       <ul className="space-y-2 mt-8">
         {sidebarItems.map((item) => (
           <li key={item.name}>
             <Link
               href={item.href}
               onClick={() => handlePageVisit(item.href)} // Add onClick handler
               className={`flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors relative ${
                 pathname === item.href
                   ? 'text-purple-600 dark:text-purple-400 font-semibold'
                   : ''
                }`}
             >
               {item.icon && <item.icon className="mr-2 h-5 w-5" />}
               {item.name}
               {pathname === item.href && (
                 <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"></span>
               )}
             </Link>
           </li>
         ))}
       </ul>
     </nav>
   </div>
 )
}

