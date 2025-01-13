import { ethers } from 'ethers'
import { BE_TOKEN_ADDRESS, BE_TOKEN_ABI } from './beTokenABI'

const CW2_TOKEN_MANAGER_ADDRESS = '0x8Be51a3AED4DBaC95D9db400af20D86D1f44789C'
const CW2_TOKEN_MANAGER_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_beTokenAddress",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "Deposit",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "cost",
        "type": "uint256"
      }
    ],
    "name": "EmojiReactionSent",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "cost",
        "type": "uint256"
      }
    ],
    "name": "GroupCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "cost",
        "type": "uint256"
      }
    ],
    "name": "MessageSent",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "Withdrawal",
    "type": "event"
  },
 {
    "inputs": [
      {
        "internalType": "string",
        "name": "username",
        "type": "string"
      }
    ],
    "name": "register",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "EMOJI_REACTION_COST",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "GROUP_CREATION_COST",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MESSAGE_COST",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "beToken",
    "outputs": [
      {
        "internalType": "contract IERC20",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "createGroup",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "sendEmojiReaction",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "sendMessage",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "userBalances",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "groupId",
        "type": "string"
      }
    ],
    "name": "deleteGroup",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

let contractInstance: ethers.Contract | null = null; // Store the contract instance

// RPC endpoints with fallback options
const RPC_ENDPOINTS = [
  'https://polygon-rpc.com',
  'https://polygon.llamarpc.com',
  'https://rpc-mainnet.maticvigil.com',
  'https://polygon-mainnet.public.blastapi.io'
];

async function getContract() {
  if (typeof window.ethereum === 'undefined') {
    return Promise.reject(new Error('Ethereum object not found, install MetaMask.'))
  }

  if (contractInstance) {
    return contractInstance; // Return cached instance if available
  }

  try {
    let provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner()
    contractInstance = new ethers.Contract(CW2_TOKEN_MANAGER_ADDRESS, CW2_TOKEN_MANAGER_ABI, signer)
    return contractInstance
  } catch (error) {
    console.error('Error initializing contract:', error)
    throw new Error('Failed to initialize contract. Please make sure you are connected to the correct network and refresh the page.')
  }
}

export async function getBalance(address: string): Promise<string> {
  const contract = await getContract()
  if (!contract) {
    throw new Error('Contract instance not available')
  }
  const balance = await contract.getBalance(address)
  return ethers.formatEther(balance)
}

export async function deposit(amount: string): Promise<string> { // Return tx hash
  if (typeof window.ethereum === 'undefined') {
    throw new Error('Ethereum object not found, install MetaMask.')
  }

  await window.ethereum.request({ method: 'eth_requestAccounts' })
  const provider = new ethers.BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()
  const contract = new ethers.Contract(CW2_TOKEN_MANAGER_ADDRESS, CW2_TOKEN_MANAGER_ABI, signer)

  try {
    const beTokenAddress = await contract.beToken()
    const tokenContract = new ethers.Contract(beTokenAddress, BE_TOKEN_ABI, signer)
    const approveTx = await tokenContract.approve(CW2_TOKEN_MANAGER_ADDRESS, ethers.parseEther(amount))
    await approveTx.wait()
    const depositTx = await contract.deposit(ethers.parseEther(amount))
    await depositTx.wait()
    return depositTx.hash // Return the transaction hash
  } catch (error: any) {
    console.error('Deposit error:', error)
    if (error.reason) {
      throw new Error(`Deposit failed: ${error.reason}`)
    } else if (error.data) {
      try {
        const decodedError = contract.interface.parseError(error.data)
        throw new Error(`Deposit failed: ${decodedError?.name || 'Unknown error'}`)
      } catch {
        throw new Error('Deposit failed: Unknown error')
      }
    } else {
      throw new Error('Deposit failed: Unknown error')
    }
  }
}

export async function withdraw(amount: string): Promise<string> { // Return tx hash
  const contract = await getContract()
  if (!contract) {
    throw new Error('Contract instance not available')
  }
  try {
    const withdrawTx = await contract.withdraw(ethers.parseEther(amount))
    await withdrawTx.wait()
    return withdrawTx.hash // Return the transaction hash
  } catch (error: any) {
    console.error('Withdrawal error:', error)
    if (error.reason) {
      throw new Error(`Withdrawal failed: ${error.reason}`)
    } else if (error.data) {
      try {
        const decodedError = contract.interface.parseError(error.data)
        throw new Error(`Withdrawal failed: ${decodedError?.name || 'Unknown error'}`)
      } catch {
        throw new Error('Withdrawal failed: Unknown error')
      }
    } else {
      throw new Error('Withdrawal failed: Unknown error')
    }
  }
}

export async function sendMessage(): Promise<string> {
  const contract = await getContract()
  if (!contract) {
    throw new Error('Contract instance not available')
  }
  const tx = await contract.sendMessage()
  await tx.wait()
  return tx.hash;
}

export async function createGroup(): Promise<string> {
  const contract = await getContract()
  if (!contract) {
    throw new Error('Contract instance not available')
  }
  const tx = await contract.createGroup()
  await tx.wait()
  return tx.hash;
}

export async function sendEmojiReaction(): Promise<string> {
  const contract = await getContract()
  if (!contract) {
    throw new Error('Contract instance not available')
  }
  const tx = await contract.sendEmojiReaction()
  await tx.wait()
  return tx.hash;
}

export async function register(username: string): Promise<string> {
 try {
   const contract = await getContract()
   if (!contract) {
     throw new Error('Contract instance not available')
   }
   const tx = await contract.register(username)
   await tx.wait()
   return tx.hash;
 } catch (error) {
   console.error('Error registering username:', error)
   throw error
 }
}

export async function deleteGroup(groupId: string): Promise<void> {
 const contract = await getContract()
 if (!contract) {
   throw new Error('Contract instance not available')
 }

 try {
   // Assuming there's a deleteGroup function in your contract
   const tx = await contract.deleteGroup(groupId)
   await tx.wait()
 } catch (error) {
   console.error('Error deleting group:', error)
   throw error
 }
}

