'use client'

import { useState } from 'react'
import { Instagram, Github, TextIcon as Telegram, Youtube, Mail, Twitter, SailboatIcon as OpenSeaIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import Image from 'next/image'

const socialLinks = [
 { icon: OpenSeaIcon, href: 'https://opensea.io/collection/blockeuid', color: 'bg-[#2081E2]', label: 'OpenSea' },
 { icon: Mail, href: 'mailto:blocke.eth.@gmail.com', color: 'bg-[#EA4335]', label: 'Gmail' },
 { icon: Twitter, href: 'https://x.com/SelvaKu82752172', color: 'bg-[#1DA1F2]', label: 'Twitter' },
 { icon: Telegram, href: 'https://t.me/blockecommunity', color: 'bg-[#0088CC]', label: 'Telegram' },
 { icon: Youtube, href: 'https://www.youtube.com/@blocke-ex', color: 'bg-[#FF0000]', label: 'YouTube' },
 { icon: Github, href: 'https://github.com/block-ex', color: 'bg-[#171515]', label: 'GitHub' },
 { icon: Instagram, href: 'https://www.instagram.com/blocke.eth/', color: 'bg-gradient-to-r from-[#833AB4] to-[#FD1D1D] to-[#FCB045]', label: 'Instagram' },
]

export default function SocialMediaLinks() {
 const [isOpen, setIsOpen] = useState(false)
 const { theme } = useTheme()

 return (
   <div className="fixed bottom-4 right-4 z-50 flex flex-col-reverse items-end">
     <div className="relative group">
       <button
         onClick={() => setIsOpen(!isOpen)}
         className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
           theme === 'dark' 
             ? 'bg-[#1A1B26] hover:bg-[#2A2B36]' 
             : 'bg-gradient-to-r from-blue-500 to-purple-600'
         }`}
         aria-label={isOpen ? "Close social media links" : "Open social media links"}
       >
         <div className="flex flex-col items-center gap-1">
           <div className="w-5 h-0.5 bg-white rounded-full" />
           <div className="w-5 h-0.5 bg-white rounded-full" />
           <div className="w-5 h-0.5 bg-white rounded-full" />
         </div>
       </button>
       
       {/* Tooltip - Positioned to the left */}
       <div className="absolute bottom-0 right-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
         <div className={`${theme === 'dark' ? 'bg-[#1A1B26]' : 'bg-gray-900'} text-white text-sm rounded-lg py-2 px-3 flex items-center`}>
           Connect with BlockE community
           <div className={`absolute -right-2 top-1/2 w-2 h-2 ${theme === 'dark' ? 'bg-[#1A1B26]' : 'bg-gray-900'} transform rotate-45 -translate-y-1/2`} />
         </div>
       </div>
     </div>

     <div 
       className={`flex flex-col space-y-2 overflow-hidden transition-all duration-300 ease-in-out mb-2 ${
         isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
       }`}
     >
       {socialLinks.map((link, index) => (
         <a
           key={index}
           href={link.href}
           className={`w-10 h-10 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 shadow-md ${
             theme === 'dark' ? 'bg-[#1A1B26] hover:bg-[#2A2B36]' : link.color
           }`}
           target="_blank"
           rel="noopener noreferrer"
           aria-label={link.label}
         >
           {link.icon ? <link.icon size={18} /> : (
             <Image src="/opensea.png" alt="OpenSea" width={18} height={18} />
           )}
         </a>
       ))}
     </div>
   </div>
 )
}

