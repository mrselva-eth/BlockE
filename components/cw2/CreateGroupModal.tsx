import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'

interface CreateGroupModalProps {
  onClose: () => void
  onCreate: (name: string, members: string[]) => void
}

export default function CreateGroupModal({ onClose, onCreate }: CreateGroupModalProps) {
  const [name, setName] = useState('')
  const [memberCount, setMemberCount] = useState(1)
  const [members, setMembers] = useState([''])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreate(name, members.filter(m => m !== ''))
  }

  const handleMemberChange = (index: number, value: string) => {
    const newMembers = [...members]
    newMembers[index] = value
    setMembers(newMembers)
  }

  const addMember = () => {
    setMembers([...members, ''])
    setMemberCount(memberCount + 1)
  }

  const removeMember = (index: number) => {
    const newMembers = members.filter((_, i) => i !== index)
    setMembers(newMembers)
    setMemberCount(memberCount - 1)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-[#FAECFA] rounded-xl p-6 w-full max-w-md mx-4 shadow-xl relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Create New Group</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Group Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Group Members
            </label>
            {members.map((member, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Member ${index + 1} Address`}
                  value={member}
                  onChange={(e) => handleMemberChange(index, e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeMember(index)}
                    className="p-2 text-red-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addMember}
            className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Add Member
          </button>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors font-medium"
          >
            Create Group
          </button>
        </form>
      </div>
    </div>
  )
}

