import { MongoClient, Db } from 'mongodb'
import { BlockEUser } from '@/types/database'

export async function migrateToNewSchema() {
  console.log('Starting migration...')
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MongoDB URI not found')

  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log('Connected to MongoDB')

    const db = client.db('blocke')

    // Migrate existing collections to the new schema
    await migrateUsers(db)
    await migrateContacts(db)
    await migrateGroups(db)
    await migrateMessages(db)
    await migrateNewsletterSubscriptions(db)
    await migrateNotifications(db)
    await migrateProfiles(db)
    await migrateSearches(db)
    await migrateTransactions(db)
    await migrateBEUIDs(db)

    console.log('Migration completed successfully')
  } catch (error: any) {
    console.error('Migration failed:', error)
    console.error('Error stack:', error.stack)
    throw error
  } finally {
    await client.close()
    console.log('Disconnected from MongoDB')
  }
}

async function migrateUsers(db: Db) {
  console.log('Migrating users...')
  const usersCollection = db.collection<BlockEUser>('users')
  const existingUsers = await usersCollection.find().toArray()

  for (const user of existingUsers) {
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          address: user.address.toLowerCase(),
          createdAt: user.createdAt || new Date(),
          updatedAt: new Date()
        },
        $setOnInsert: {
          beuids: [],
          beuidCount: 0,
          contacts: [],
          groups: [],
          messages: [],
          newsletterSubscriptions: [],
          notifications: [],
          profile: {
            socialLinks: {},
            updatedAt: new Date()
          },
          searches: [],
          transactions: [],
          preferences: {
            theme: 'light',
            autoDisconnect: true,
            lastUpdated: new Date()
          }
        }
      },
      { upsert: true }
    )
  }
  console.log(`Migrated ${existingUsers.length} users`)
}

async function migrateContacts(db: Db) {
  console.log('Migrating contacts...')
  const usersCollection = db.collection<BlockEUser>('users')
  const contacts = await db.collection('contacts').find().toArray()

  for (const contact of contacts) {
    await usersCollection.updateOne(
      { address: contact.userAddress.toLowerCase() },
      {
        $addToSet: {
          contacts: {
            contactName: contact.contactName,
            contactAddress: contact.contactAddress.toLowerCase(),
            createdAt: contact.createdAt || new Date()
          }
        }
      },
      { upsert: true }
    )
  }
  console.log(`Migrated ${contacts.length} contacts`)
}

async function migrateGroups(db: Db) {
  console.log('Migrating groups...')
  const usersCollection = db.collection<BlockEUser>('users')
  const groups = await db.collection('groups').find().toArray()

  for (const group of groups) {
    const groupData = {
      groupName: group.groupName,
      members: group.members.map((member: string) => member.toLowerCase()),
      createdAt: group.createdAt || new Date(),
      groupLogo: group.groupLogo,
      isCreator: true
    }

    await usersCollection.updateOne(
      { address: group.creatorAddress.toLowerCase() },
      { $addToSet: { groups: groupData } },
      { upsert: true }
    )

    for (const member of group.members) {
      if (member.toLowerCase() !== group.creatorAddress.toLowerCase()) {
        await usersCollection.updateOne(
          { address: member.toLowerCase() },
          { $addToSet: { groups: { ...groupData, isCreator: false } } },
          { upsert: true }
        )
      }
    }
  }
  console.log(`Migrated ${groups.length} groups`)
}

async function migrateMessages(db: Db) {
  console.log('Migrating messages...')
  const usersCollection = db.collection<BlockEUser>('users')
  const messages = await db.collection('messages').find().toArray()

  for (const message of messages) {
    const messageData = {
      messageId: message._id.toString(),
      content: message.content,
      senderAddress: message.senderAddress.toLowerCase(),
      receiverAddress: message.receiverAddress.toLowerCase(),
      isGroupMessage: message.isGroupMessage || false,
      groupId: message.groupId,
      createdAt: message.createdAt || new Date(),
      encryptedContent: message.encryptedMessage
    }

    await usersCollection.updateOne(
      { address: message.senderAddress.toLowerCase() },
      { $addToSet: { messages: messageData } },
      { upsert: true }
    )

    if (!message.isGroupMessage) {
      await usersCollection.updateOne(
        { address: message.receiverAddress.toLowerCase() },
        { $addToSet: { messages: messageData } },
        { upsert: true }
      )
    }
  }
  console.log(`Migrated ${messages.length} messages`)
}

async function migrateNewsletterSubscriptions(db: Db) {
  console.log('Migrating newsletter subscriptions...')
  const usersCollection = db.collection<BlockEUser>('users')
  const subscriptions = await db.collection('newsletter').find().toArray()

  for (const subscription of subscriptions) {
    await usersCollection.updateOne(
      { address: subscription.address.toLowerCase() },
      {
        $addToSet: {
          newsletterSubscriptions: {
            email: subscription.email,
            subscribedAt: subscription.subscribedAt || new Date()
          }
        }
      },
      { upsert: true }
    )
  }
  console.log(`Migrated ${subscriptions.length} newsletter subscriptions`)
}

async function migrateNotifications(db: Db) {
  console.log('Migrating notifications...')
  const usersCollection = db.collection<BlockEUser>('users')
  const notifications = await db.collection('notifications').find().toArray()

  for (const notification of notifications) {
    await usersCollection.updateOne(
      { address: notification.userAddress.toLowerCase() },
      {
        $addToSet: {
          notifications: {
            type: notification.type,
            content: notification.content,
            read: notification.read || false,
            createdAt: notification.createdAt || new Date()
          }
        }
      },
      { upsert: true }
    )
  }
  console.log(`Migrated ${notifications.length} notifications`)
}

async function migrateProfiles(db: Db) {
  console.log('Migrating profiles...')
  const usersCollection = db.collection<BlockEUser>('users')
  const profiles = await db.collection('profiles').find().toArray()

  for (const profile of profiles) {
    await usersCollection.updateOne(
      { address: profile.address.toLowerCase() },
      {
        $set: {
          profile: {
            name: profile.name,
            bio: profile.bio,
            email: profile.email,
            profileImage: profile.profileImage,
            socialLinks: {
              instagram: profile.instagramLink,
              youtube: profile.youtubeLink,
              linkedin: profile.linkedinLink,
              github: profile.githubLink,
              twitter: profile.twitterLink,
            },
            discordUsername: profile.discordUsername,
            updatedAt: profile.updatedAt || new Date()
          }
        }
      },
      { upsert: true }
    )
  }
  console.log(`Migrated ${profiles.length} profiles`)
}

async function migrateSearches(db: Db) {
  console.log('Migrating searches...')
  const usersCollection = db.collection<BlockEUser>('users')
  const searches = await db.collection('searches').find().toArray()

  for (const search of searches) {
    await usersCollection.updateOne(
      { address: search.connectedAddress.toLowerCase() },
      {
        $addToSet: {
          searches: {
            searchedAddress: search.searchedAddress.toLowerCase(),
            resolvedAddress: search.resolvedAddress?.toLowerCase(),
            totalHoldingsETH: search.totalHoldingsETH,
            totalHoldingsUSD: search.totalHoldingsUSD,
            gasSpentETH: search.gasSpentETH,
            isEns: search.isEns || false,
            searchCount: search.searchCount || 1,
            lastSearched: search.lastSearched || new Date()
          }
        }
      },
      { upsert: true }
    )
  }
  console.log(`Migrated ${searches.length} searches`)
}

async function migrateTransactions(db: Db) {
  console.log('Migrating transactions...')
  const usersCollection = db.collection<BlockEUser>('users')
  const transactions = await db.collection('transactions').find().toArray()

  for (const transaction of transactions) {
    await usersCollection.updateOne(
      { address: transaction.address.toLowerCase() },
      {
        $addToSet: {
          transactions: {
            txHash: transaction.txHash,
            type: transaction.type,
            amount: transaction.amount,
            timestamp: transaction.timestamp || new Date()
          }
        }
      },
      { upsert: true }
    )
  }
  console.log(`Migrated ${transactions.length} transactions`)
}

async function migrateBEUIDs(db: Db) {
  console.log('Migrating BEUIDs...')
  const usersCollection = db.collection<BlockEUser>('users')
  const beuids = await db.collection('beuids').find().toArray()

  for (const beuid of beuids) {
    await usersCollection.updateOne(
      { address: beuid.address.toLowerCase() },
      {
        $addToSet: {
          beuids: {
            uid: beuid.uid,
            formattedUid: beuid.formattedUid,
            mintedAt: beuid.mintedAt || new Date(),
            digits: beuid.uid.length
          }
        },
        $inc: { beuidCount: 1 }
      },
      { upsert: true }
    )
  }
  console.log(`Migrated ${beuids.length} BEUIDs`)
}

