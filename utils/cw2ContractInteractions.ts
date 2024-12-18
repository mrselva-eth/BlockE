import { ethers } from 'ethers'
import { BE_TOKEN_ADDRESS, BE_TOKEN_ABI } from './beTokenABI'

const CW2_TOKEN_MANAGER_ADDRESS = '0x8Be51a3AED4DBaC95D9db400af20D86D1f44789C'
const CW2_TOKEN_MANAGER_ABI = [
  {"inputs":[{"internalType":"address","name":"_beTokenAddress","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},
  {"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},
  {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Deposit","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"cost","type":"uint256"}],"name":"EmojiReactionSent","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"creator","type":"address"},{"indexed":false,"internalType":"uint256","name":"cost","type":"uint256"}],"name":"GroupCreated","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"cost","type":"uint256"}],"name":"MessageSent","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawal","type":"event"},
  {"inputs":[],"name":"EMOJI_REACTION_COST","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"GROUP_CREATION_COST","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"MESSAGE_COST","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"beToken","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"createGroup","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"deposit","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"sendEmojiReaction","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"sendMessage","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userBalances","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}
]

function getContract() {
  if (typeof window.ethereum === 'undefined') {
    return Promise.reject(new Error('Ethereum object not found, install MetaMask.'))
  }

  return window.ethereum.request({ method: 'eth_requestAccounts' })
    .then(() => {
      const provider = new ethers.BrowserProvider(window.ethereum)
      return provider.getSigner()
    })
    .then((signer: ethers.Signer) => {
      return new ethers.Contract(CW2_TOKEN_MANAGER_ADDRESS, CW2_TOKEN_MANAGER_ABI, signer)
    })
}

export async function getBalance(address: string): Promise<string> {
  const contract = await getContract()
  const balance = await contract.getBalance(address)
  return ethers.formatEther(balance)
}

export async function deposit(amount: string) {
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

export async function withdraw(amount: string): Promise<void> {
  const contract = await getContract()
  const tx = await contract.withdraw(ethers.parseEther(amount))
  await tx.wait()
}

export async function sendMessage(): Promise<void> {
  const contract = await getContract()
  const tx = await contract.sendMessage()
  await tx.wait()
}

export async function createGroup(): Promise<void> {
  const contract = await getContract()
  const tx = await contract.createGroup()
  await tx.wait()
}

export async function sendEmojiReaction(): Promise<void> {
  const contract = await getContract()
  const tx = await contract.sendEmojiReaction()
  await tx.wait()
}

