'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Twitter, Github, Mail, MailOpenIcon as Envelope, Youtube, TextIcon as Telegram, Instagram } from 'lucide-react'

const navigationLinks = [
 { name: 'BlockE UID', href: '/blocke-uid' },
 { name: 'BEUID on OpenSea', href: 'https://opensea.io/collection/blockeuid' },
 { name: 'Dashboard', href: '/dashboard' },
 { name: 'CW²', href: '/cw2' },
 { name: 'BlockE AI', href: '/blocke-ai' },
 { name: 'Cex and Dex', href: '/cex-and-dex' },
 { name: 'BE Staking', href: '/be-staking' },
 { name: 'BE Drop', href: '/be-drop' },
]

const socialLinks = [
 { icon: Mail, href: 'mailto:blocke.eth.@gmail.com', label: 'Email' },
 { icon: Twitter, href: 'https://x.com/SelvaKu82752172', label: 'Twitter' },
 { icon: Telegram, href: 'https://t.me/blockecommunity', label: 'Telegram' },
 { icon: Youtube, href: 'https://www.youtube.com/@blocke-ex', label: 'YouTube' },
 { icon: Github, href: 'https://github.com/block-ex', label: 'GitHub' },
 { icon: Instagram, href: 'https://www.instagram.com/blocke.eth/', label: 'Instagram' },
]

export default function BlockEFooter() {
 return (
   <footer className="bg-black text-white py-16">
     <div className="container mx-auto px-8">
       <div className="flex flex-wrap justify-between items-start">
         {/* Logo and Description */}
         <div className="w-full md:w-1/3 mb-8 md:mb-0">
           <div className="flex items-center gap-2 mb-4">
             <Image
               src="/blocke-logo.png"
               alt="BlockE Logo"
               width={40}
               height={40}
             />
             <span className="text-2xl font-bold">BlockE</span>
           </div>
           <p className="text-gray-400 pr-8">
             Your gateway to the decentralized future
           </p>
         </div>

         {/* Navigation Links */}
         <div className="w-full md:w-1/3 mb-8 md:mb-0">
           <h3 className="text-lg font-bold mb-4">Quick Links</h3>
           <ul className="space-y-2">
             {navigationLinks.map((link) => (
               <li key={link.name}>
                 <Link
                   href={link.href}
                   className="text-gray-400 hover:text-white transition-colors"
                 >
                   {link.name}
                 </Link>
               </li>
             ))}
           </ul>
         </div>

         {/* Contact Section */}
         <div className="w-full md:w-1/3">
           <h3 className="text-lg font-bold mb-4">Contact Us</h3>
           <div className="flex gap-4">
             {socialLinks.map((link, index) => (
               <a
                 key={index}
                 href={link.href}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="text-gray-400 hover:text-white transition-colors"
                 aria-label={link.label}
               >
                 <link.icon size={24} />
               </a>
             ))}
           </div>
         </div>
       </div>

       <div className="mt-16 pt-8 border-t border-gray-800 text-center text-gray-400">
         <p>© 2025 BlockE. All rights reserved.</p>
       </div>
     </div>
   </footer>
 )
}

