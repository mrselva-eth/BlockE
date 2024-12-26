import { MongoClient } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local')
}

const uri = process.env.MONGODB_URI
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise

export async function getAIBalance(address: string): Promise<number> {
  const client = await clientPromise
  const db = client.db('blocke')
  const user = await db.collection('users').findOne({ address: address.toLowerCase() })
  return user?.balance || 0
}

export async function updateAIBalance(address: string, newBalance: number): Promise<void> {
  const client = await clientPromise
  const db = client.db('blocke')
  await db.collection('users').updateOne(
    { address: address.toLowerCase() },
    { $set: { balance: newBalance } },
    { upsert: true }
  )
}

export async function addTransaction(transaction: {
  address: string;
  type: string;
  amount: number;
  txHash: string;
}) {
  const client = await clientPromise;
  const db = client.db('blocke');
  await db.collection('transactions').insertOne({
    ...transaction,
    timestamp: new Date()
  });
}

