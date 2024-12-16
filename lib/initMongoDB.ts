import clientPromise from './mongodb'

export async function initializeDatabase() {
  try {
    const client = await clientPromise
    const db = client.db('blocke')

    // Create collections if they don't exist
    await db.createCollection('users')
    await db.createCollection('transactions')

    // Create indexes
    await db.collection('users').createIndex({ address: 1 }, { unique: true })
    await db.collection('transactions').createIndex({ address: 1 })
    await db.collection('transactions').createIndex({ timestamp: -1 })

    console.log('MongoDB collections and indexes initialized successfully')
  } catch (error) {
    console.error('Failed to initialize MongoDB:', error)
    throw error
  }
}

