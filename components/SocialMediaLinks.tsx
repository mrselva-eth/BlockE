'use client'

import { useState } from 'react'
import { Instagram, Github, Send, Phone, Linkedin, Youtube } from 'lucide-react'

const socialLinks = [
  { icon: Instagram, href: '#', color: 'bg-pink-500', label: 'Instagram' },
  { icon: Github, href: '#', color: 'bg-gray-800', label: 'GitHub' },
  { icon: Send, href: '#', color: 'bg-blue-400', label: 'Telegram' },
  { icon: Phone, href: '#', color: 'bg-green-500', label: 'WhatsApp' },
  { icon: Linkedin, href: '#', color: 'bg-blue-600', label: 'LinkedIn' },
  { icon: Youtube, href: '#', color: 'bg-red-600', label: 'YouTube' },
]

export default function SocialMediaLinks() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col-reverse items-end">
      <div className="relative group">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
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
          <div className="bg-gray-900 text-white text-sm rounded-lg py-2 px-3 flex items-center">
            Connect with BlockE community
            <div className="absolute -right-2 top-1/2 w-2 h-2 bg-gray-900 transform rotate-45 -translate-y-1/2" />
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
            className={`w-10 h-10 ${link.color} rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 shadow-md`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
          >
            <link.icon size={18} />
          </a>
        ))}
      </div>
    </div>
  )
}

