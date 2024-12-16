import { MongoClient } from 'mongodb'

declare global {
  var _mongoClientPromise: Promise<MongoClient>
}

const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error('Please add your Mongo URI to .env.local')
}

const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise

export async function getAIBalance(address: string): Promise<number> {
  console.log(`Fetching balance for address: ${address}`)
  try {
    const client = await clientPromise
    const db = client.db('blocke')
    const user = await db.collection('users').findOne({ address: address.toLowerCase() })
    console.log(`Balance fetch result:`, user)
    return user?.balance || 0
  } catch (error) {
    console.error('Error fetching AI balance:', error)
    throw error
  }
}

export async function updateAIBalance(address: string, newBalance: number): Promise<void> {
  console.log(`Updating balance for address: ${address} to ${newBalance}`)
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
    console.log('Balance updated successfully')
  } catch (error) {
    console.error('Error updating AI balance:', error)
    if (error instanceof Error) {
      if ('code' in error && error.code === 8000) {
        console.error('MongoDB Atlas Error: Insufficient permissions')
      }
    }
    throw error
  }
}

export async function addTransaction(transaction: {
  address: string
  type: 'deposit' | 'withdraw'
  amount: number
  txHash: string
}): Promise<void> {
  console.log('Adding transaction:', transaction)
  try {
    const client = await clientPromise
    const db = client.db('blocke')
    await db.collection('transactions').insertOne({
      ...transaction,
      address: transaction.address.toLowerCase(),
      timestamp: new Date(),
      status: 'success'
    })
    console.log('Transaction added successfully')
  } catch (error) {
    console.error('Error adding transaction:', error)
    if (error instanceof Error) {
      if ('code' in error && error.code === 8000) {
        console.error('MongoDB Atlas Error: Insufficient permissions')
      }
    }
    throw error
  }
}

export async function getTransactions(
  address: string,
  page: number,
  limit: number
): Promise<{
  transactions: any[]
  total: number
}> {
  console.log(`Fetching transactions for address: ${address}, page: ${page}, limit: ${limit}`)
  try {
    const client = await clientPromise
    const db = client.db('blocke')
    const skip = (page - 1) * limit

    const [transactions, total] = await Promise.all([
      db.collection('transactions')
        .find({ address: address.toLowerCase() })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('transactions').countDocuments({ address: address.toLowerCase() })
    ])

    console.log(`Found ${total} total transactions, returning ${transactions.length} items`)
    return { transactions, total }
  } catch (error) {
    console.error('Error fetching transactions:', error)
    if (error instanceof Error) {
      if ('code' in error && error.code === 8000) {
        console.error('MongoDB Atlas Error: Insufficient permissions')
      }
    }
    throw error
  }
}

