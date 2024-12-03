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
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 mt-2"
        aria-label={isOpen ? "Close social media links" : "Open social media links"}
      >
        {isOpen ? 'X' : '☰'}
      </button>
      <div 
        className={`flex flex-col space-y-2 overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {socialLinks.map((link, index) => (
          <a
            key={index}
            href={link.href}
            className={`${link.color} text-white rounded-full p-2 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${link.color.split('-')[1]}-400`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
          >
            <link.icon size={20} />
          </a>
        ))}
      </div>
    </div>
  )
}

