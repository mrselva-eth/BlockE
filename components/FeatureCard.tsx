import { motion } from 'framer-motion'
import { TypeIcon as type, LucideIcon } from 'lucide-react'

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  howToUse: string[]
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, howToUse }) => {
  return (
    <motion.div 
      className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-transparent hover:border-purple-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.03 }}
    >
      <Icon size={64} className="text-purple-600 mb-6" />
      <h3 className="text-2xl font-semibold mb-4">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      <div>
        <h4 className="text-lg font-semibold mb-2">How to use:</h4>
        <ul className="list-disc pl-5 space-y-2">
          {howToUse.map((step, index) => (
            <li key={index} className="text-gray-600">{step}</li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}

export default FeatureCard

