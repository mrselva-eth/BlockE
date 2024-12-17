import { MongoClient } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local')
}

const uri = process.env.MONGODB_URI
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise

export async function getTransactions(address: string, page: number = 1, limit: number = 2) {
  try {
    const client = await clientPromise
    const db = client.db('blocke')
    const skip = (page - 1) * limit

    const [transactions, totalCount] = await Promise.all([
      db.collection('transactions')
        .find({ address: address.toLowerCase() })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('transactions')
        .countDocuments({ address: address.toLowerCase() })
    ])

    return {
      transactions,
      total: totalCount
    }
  } catch (error) {
    console.error('Error in getTransactions:', error)
    throw error
  }
}

export async function addTransaction(transaction: {
  address: string
  type: 'deposit' | 'withdraw'
  amount: number
  txHash: string
  timestamp: string
}) {
  try {
    const client = await clientPromise
    const db = client.db('blocke')
    
    await db.collection('transactions').insertOne({
      ...transaction,
      address: transaction.address.toLowerCase(),
      timestamp: new Date(transaction.timestamp)
    })
  } catch (error) {
    console.error('Error in addTransaction:', error)
    throw error
  }
}

export async function getAIBalance(address: string): Promise<number> {
  try {
    const client = await clientPromise
    const db = client.db('blocke')
    const user = await db.collection('users').findOne({ address: address.toLowerCase() })
    return user?.balance || 0
  } catch (error) {
    console.error('Error in getAIBalance:', error)
    throw error
  }
}

export async function updateAIBalance(address: string, newBalance: number): Promise<void> {
  try {
    const client = await clientPromise
    const db = client.db('blocke')
    await db.collection('users').updateOne(
      { address: address.toLowerCase() },
      { 
        $set: { 
          address: address.toLowerCase(),
          balance: newBalance,
          lastUpdated: new Date()
        }
      },
      { upsert: true }
    )
  } catch (error) {
    console.error('Error in updateAIBalance:', error)
    throw error
  }
}

