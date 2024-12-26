import React, { useState } from 'react'
import { X, Copy, Check } from 'lucide-react'

interface Command {
  command: string
  description: string
}

const commands: Command[] = [
  { command: '/token name ticker', description: 'Get details about a specific token' },
  { command: '/top exchanges', description: 'List top cryptocurrency exchanges' },
  { command: '/top crypto', description: 'List top cryptocurrencies' },
  { command: '/market', description: 'Get global crypto market data' },
  { command: '/trending', description: 'List trending coins' },
]

interface CommandListProps {
  onClose: () => void
}

const CommandList: React.FC<CommandListProps> = ({ onClose }) => {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null)

  const handleCopy = (command: string) => {
    navigator.clipboard.writeText(command)
    setCopiedCommand(command)
    setTimeout(() => setCopiedCommand(null), 2000)
  }

  return (
    <div className="absolute right-[-340px] top-0 h-full w-80 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-lg border-l border-purple-200 overflow-y-auto">
      <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-indigo-500 p-4">
        <h2 className="text-xl font-bold text-white text-center">Available Commands</h2>
      </div>
      <div className="p-6 space-y-4">
        {commands.map((cmd, index) => (
          <div key={index} className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm hover:shadow-md transition-all border border-purple-100 hover:border-purple-300">
            <div className="flex justify-between items-start mb-2">
              <code className="text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">{cmd.command}</code>
              <button
                onClick={() => handleCopy(cmd.command)}
                className="text-purple-400 hover:text-purple-600 transition-colors"
                title="Copy command"
              >
                {copiedCommand === cmd.command ? (
                  <Check size={18} className="text-green-500" />
                ) : (
                  <Copy size={18} />
                )}
              </button>
            </div>
            <p className="text-sm text-gray-600">{cmd.description}</p>
          </div>
        ))}
      </div>
      
      {/* Fixed close button at the bottom */}
      <div className="sticky bottom-0 w-full pb-6 pt-4 bg-gradient-to-t from-purple-50 to-transparent">
        <button
          onClick={onClose}
          className="mx-auto flex items-center justify-center px-6 py-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          <X size={20} className="mr-2" />
          Close Commands
        </button>
      </div>
    </div>
  )
}

export default CommandList

