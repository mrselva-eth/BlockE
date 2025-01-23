"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Menu,
  Home,
  LayoutDashboard,
  Coins,
  Binary,
  Bot,
  ArrowLeftRight,
  BarChart2,
  MessageCircle,
  Network,
  ImageIcon,
  FishIcon as Whale,
  FuelIcon as GasPump,
  Gift,
  GlassWaterIcon as Water,
} from "lucide-react"
import { useWallet } from "@/contexts/WalletContext"
import { useRouter } from "next/navigation"
import BlockEUIDAlert from "../BlockEUIDAlert"
import { useBlockEUID } from "@/hooks/useBlockEUID"

const CEO_ADDRESS = "0x603fbF99674B8ed3305Eb6EA5f3491F634A402A6"

const allSidebarItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Faucet", href: "https://block-e-faucet.vercel.app/", icon: Water },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "BE Staking", href: "/be-staking", icon: Coins },
  { name: "CW²", href: "/cw2", icon: Binary },
  { name: "BlockE AI", href: "/blocke-ai", icon: Bot },
  { name: "Cex and Dex", href: "/cex-and-dex", icon: ArrowLeftRight },
  { name: "BE Drop", href: "/be-drop", icon: Gift },
  { name: "Predictive Analytics", href: "/predictive-analytics", icon: BarChart2, ceoOnly: true },
  { name: "Social Media Sentiment Analysis", href: "/sentiment-analysis", icon: MessageCircle, ceoOnly: true },
  { name: "Wallet Clustering", href: "/wallet-clustering", icon: Network, ceoOnly: true },
  { name: "NFT Analytics", href: "/nft-analytics", icon: ImageIcon, ceoOnly: true },
  { name: "Whale Alert", href: "/whale-alert", icon: Whale, ceoOnly: true },
  { name: "Gas Price Forecasting", href: "/gas-price-forecasting", icon: GasPump, ceoOnly: true },
]

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const { address } = useWallet()
  const pathname = usePathname()
  const router = useRouter()
  const { ownedUIDs, isLoading } = useBlockEUID()
  const [showAlert, setShowAlert] = useState(false)

  const isCEO = address?.toLowerCase() === CEO_ADDRESS.toLowerCase()
  const sidebarItems = allSidebarItems.filter((item) => !item.ceoOnly || isCEO)

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (event.clientX < 50) {
        setIsOpen(true)
      } else if (event.clientX > 250 && isOpen) {
        setIsOpen(false)
      }
    },
    [isOpen],
  )

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [handleMouseMove])

  const handleItemClick = (item: any) => {
    // Add page visit tracking
    if (address) {
      fetch("/api/others", {
        // Update API endpoint
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, action: "pageVisit", page: item.href }),
      }).catch((error) => console.error("Error logging page visit:", error))
    }
    router.push(item.href)
  }

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
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out z-40 overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        onMouseLeave={() => setIsOpen(false)}
      >
        <nav className="p-4 custom-scrollbar">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => handleItemClick(item)}
                  className={`flex items-center px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors relative w-full text-left ${
                    pathname === item.href
                      ? "text-purple-600 dark:text-purple-400 font-semibold bg-gray-100 dark:bg-gray-800"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {item.icon && <item.icon className="mr-2 h-5 w-5" />}
                  {item.name}
                  {pathname === item.href && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"></span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  )
}

