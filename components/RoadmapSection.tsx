'use client'

import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'

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
      <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blockchain-blue to-blockchain-purple bg-clip-text text-transparent">
        Our Roadmap
      </h2>
      <div className="relative z-10 container mx-auto px-8">
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blockchain-blue to-blockchain-purple" />
        {roadmapItems.map((item, index) => (
          <motion.div
            key={item.year}
            className="relative mb-16 last:mb-0"
            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
          >
            <div className={`flex items-center ${index % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
              <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8'}`}>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-purple-200">
                  <div className="text-lg font-bold text-blockchain-blue mb-2">{item.year}</div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
                </div>
              </div>
              <motion.div
                className="absolute left-1/2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full border-4 border-blockchain-purple flex items-center justify-center"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.2 + 0.3 }}
              >
                <CheckCircle className="text-blockchain-blue" size={16} />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

