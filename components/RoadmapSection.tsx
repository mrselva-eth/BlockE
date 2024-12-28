'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

const roadmapItems = [
  {
    year: '2024 Q1',
    title: 'Platform Launch',
    description: 'Launch of BlockE platform with core features including BE Token and BlockE UID'
  },
  {
    year: '2024 Q2',
    title: 'CW² Integration',
    description: 'Release of CW² messaging system and enhanced wallet management'
  },
  {
    year: '2024 Q3',
    title: 'AI Integration',
    description: 'Introduction of BlockE AI assistant and advanced analytics'
  },
  {
    year: '2024 Q4',
    title: 'Ecosystem Expansion',
    description: 'Launch of new features, partnerships, and ecosystem growth'
  }
]

export default function RoadmapSection() {
  return (
    <div className="relative py-20 overflow-hidden">
      {/* Animated BlockE Logo */}
      <motion.div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-10 z-0"
        animate={{ 
          rotate: 360,
          scale: [1, 1.2, 1],
        }}
        transition={{ 
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      >
      </motion.div>

      {/* Roadmap Content */}
      <div className="relative z-10 container mx-auto px-8">
        <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blockchain-blue to-blockchain-purple bg-clip-text text-transparent">
          Our Roadmap
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {roadmapItems.map((item, index) => (
            <motion.div
              key={item.year}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-purple-200">
                <div className="absolute -top-4 left-4 bg-gradient-to-r from-blockchain-blue to-blockchain-purple text-white px-4 py-1 rounded-full text-sm font-bold">
                  {item.year}
                </div>
                <h3 className="text-xl font-bold mt-4 mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

