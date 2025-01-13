import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Upload } from 'lucide-react'
import Image from 'next/image'
import { useWallet } from '@/contexts/WalletContext'
import { createGroup as createGroupOnChain, getBalance } from '@/utils/cw2ContractInteractions'
import { ethers } from 'ethers'
import ExceptionMessage from './ExceptionMessage'

interface CreateGroupModalProps {
 onClose: () => void
 onCreate: (name: string, members: string[], groupLogo?: string | null) => void
}

export default function CreateGroupModal({ onClose, onCreate }: CreateGroupModalProps) {
 const { address } = useWallet()
 const [name, setName] = useState('')
 const [members, setMembers] = useState([''])
 const [groupLogo, setGroupLogo] = useState<string | null>(null)
 const [uploading, setUploading] = useState(false)
 const [balance, setBalance] = useState<string>('0')
 const [exceptionMessage, setExceptionMessage] = useState<string | null>(null)
 const [memberErrors, setMemberErrors] = useState<string[]>([])

 useEffect(() => {
   const fetchBalance = async () => {
     try {
       const userBalance = await getBalance(address!)
       setBalance(userBalance)
     } catch (err) {
       console.error('Failed to fetch balance:', err)
     }
   }
   if (address) {
     fetchBalance()
   }
 }, [address])

 const isValidAddress = (address: string) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
 }

 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault()

   const newMemberErrors = members.map(member => {
     if (!isValidAddress(member)) {
       return 'Invalid wallet address format.'
     }
     return '' // Empty string if valid
   })

   if (newMemberErrors.some(error => error !== '')) {
     setMemberErrors(newMemberErrors)
     return
   }

   const validatedMembers = members.filter(member => member.trim() !== ''); // Filter out empty members
   const lowerCaseMembers = validatedMembers.map(member => member.toLowerCase()); // Convert to lowercase for comparison

   const duplicateMembers = lowerCaseMembers.filter((member, index) => lowerCaseMembers.indexOf(member) !== index);

   if (duplicateMembers.length > 0) {
     alert('Duplicate member addresses are not allowed.');
     return;
   }

   try {
     const groupCreationCost = ethers.parseEther('100')
     if (ethers.parseEther(balance) < groupCreationCost) {
       throw new Error('Insufficient balance to create a group. You need at least 100 BE tokens.')
     }

     await createGroupOnChain()
     onCreate(name, members.filter(m => m !== ''), groupLogo)
     setName('')
     setMembers([''])
     setGroupLogo(null)
     onClose()
   } catch (error: any) {
     console.error('Failed to create group:', error)
     if (error.code !== 4001) { // Only show generic error if not user rejected
       setExceptionMessage(error.message || 'Failed to create group. Please try again.')
     }
   }
 }

 const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
   const file = e.target.files?.[0]
   if (file) {
     const reader = new FileReader()
     reader.onloadend = () => {
       setGroupLogo(reader.result as string)
     }
     reader.readAsDataURL(file)
   }
 }

 const addMember = () => {
   setMembers([...members, ''])
   setMemberErrors([...memberErrors, '']) // Add an empty error for the new member
 }

 const removeMember = (index: number) => {
   setMembers(members.filter((_, i) => i !== index))
   setMemberErrors(memberErrors.filter((_, i) => i !== index)) // Remove corresponding error
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
         <div>
           {groupLogo && (
             <div className="relative w-20 h-20 mx-auto mb-4">
               <Image src={groupLogo} alt="Group Logo" width={80} height={80} className="rounded-full" />
             </div>
           )}
           <div className="flex items-center justify-center">
             <label
               htmlFor="groupLogo"
               className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                 uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
               }`}
             >
               {uploading ? 'Uploading...' : <Upload size={20} className="mr-2" />} {uploading ? '' : 'Upload Logo'}
               <input
                 type="file"
                 id="groupLogo"
                 accept="image/*"
                 onChange={handleLogoChange}
                 className="hidden"
                 disabled={uploading}
               />
             </label>
           </div>
         </div>
         <input
           type="text"
           placeholder="Group Name"
           value={name}
           onChange={(e) => setName(e.target.value)}
           className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
           required
         />
         <div className="space-y-3">
           {members.map((member, index) => (
             <div key={index} className="flex gap-2">
               <input
                 type="text"
                 placeholder={`Member ${index + 1} Address`}
                 value={member}
                 onChange={(e) => {
                   const newMembers = [...members]
                   newMembers[index] = e.target.value
                   setMembers(newMembers)

                   // Clear error message on input change
                   const newMemberErrors = [...memberErrors];
                   newMemberErrors[index] = '';
                   setMemberErrors(newMemberErrors);
                 }}
                 className={`flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:border-transparent ${memberErrors[index] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'}`}
                 required
               />
               {memberErrors[index] && <p className="text-red-500 text-xs mt-1">{memberErrors[index]}</p>} {/* Display error message */}
               {index > 0 && (
                 <button type="button" onClick={() => removeMember(index)} className="p-2 text-red-500 hover:text-red-600 transition-colors">
                   <Trash2 size={20} />
                 </button>
               )}
             </div>
           ))}
         </div>
         <button type="button" onClick={addMember} className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
           <Plus size={20} />
           Add Member
         </button>
         <button type="submit" className="w-full py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors font-medium">
           Create Group
         </button>
       </form>
       {exceptionMessage && (
         <ExceptionMessage message={exceptionMessage} onClose={() => setExceptionMessage(null)} />
       )}
     </div>
   </div>
 )
}

