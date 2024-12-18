import { MongoClient, ObjectId, WithId, Document } from 'mongodb'

const uri = process.env.MONGODB_URI
const dbName = 'blocke'

let cachedClient: MongoClient | null = null

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient
  }

  const client = await MongoClient.connect(uri!)
  cachedClient = client
  return client
}

export interface Contact {
  _id: string;
  userAddress: string;
  contactName: string;
  contactAddress: string;
  createdAt: Date;
}

export interface Group {
  _id: string;
  creatorAddress: string;
  groupName: string;
  members: string[];
  createdAt: Date;
}

export interface Message {
  _id: string;
  senderAddress: string;
  receiverAddress: string;
  encryptedMessage: string;
  isGroupMessage: boolean;
  createdAt: Date;
}

export interface Notification {
  _id: string;
  userAddress: string;
  type: string;
  content: string;
  read: boolean;
  createdAt: Date;
}

export async function addContact(userAddress: string, contactName: string, contactAddress: string) {
  const client = await connectToDatabase()
  const db = client.db(dbName)
  const collection = db.collection('contacts')

  await collection.insertOne({
    userAddress: userAddress.toLowerCase(),
    contactName,
    contactAddress: contactAddress.toLowerCase(),
    createdAt: new Date()
  })
}

export async function getContacts(userAddress: string): Promise<Contact[]> {
  const client = await connectToDatabase()
  const db = client.db(dbName)
  const collection = db.collection('contacts')

  const contacts = await collection.find({ userAddress: userAddress.toLowerCase() }).toArray()
  return contacts.map(contact => ({
    ...contact,
    _id: contact._id.toString()
  })) as Contact[]
}

export async function createGroup(creatorAddress: string, groupName: string, members: string[]) {
  const client = await connectToDatabase()
  const db = client.db(dbName)
  const collection = db.collection('groups')

  await collection.insertOne({
    creatorAddress: creatorAddress.toLowerCase(),
    groupName,
    members: members.map(m => m.toLowerCase()),
    createdAt: new Date()
  })
}

export async function getGroups(userAddress: string): Promise<Group[]> {
  const client = await connectToDatabase()
  const db = client.db(dbName)
  const collection = db.collection('groups')

  const groups = await collection.find({
    $or: [
      { creatorAddress: userAddress.toLowerCase() },
      { members: userAddress.toLowerCase() }
    ]
  }).toArray()
  return groups.map(group => ({
    ...group,
    _id: group._id.toString()
  })) as Group[]
}

export async function addMessage(senderAddress: string, receiverAddress: string, encryptedMessage: string, isGroupMessage: boolean = false) {
  const client = await connectToDatabase()
  const db = client.db(dbName)
  const collection = db.collection('messages')

  await collection.insertOne({
    senderAddress: senderAddress.toLowerCase(),
    receiverAddress: receiverAddress.toLowerCase(),
    encryptedMessage,
    isGroupMessage,
    createdAt: new Date()
  })
}

export async function getMessages(userAddress: string, otherAddress: string, isGroupMessage: boolean = false): Promise<Message[]> {
  const client = await connectToDatabase()
  const db = client.db(dbName)
  const collection = db.collection('messages')

  const query = isGroupMessage
    ? { receiverAddress: otherAddress.toLowerCase() }
    : {
        $or: [
          { senderAddress: userAddress.toLowerCase(), receiverAddress: otherAddress.toLowerCase() },
          { senderAddress: otherAddress.toLowerCase(), receiverAddress: userAddress.toLowerCase() }
        ]
      }

  const messages = await collection.find(query).sort({ createdAt: 1 }).toArray()
  return messages.map(message => ({
    ...message,
    _id: message._id.toString()
  })) as Message[]
}

export async function addNotification(userAddress: string, type: string, content: string) {
  const client = await connectToDatabase()
  const db = client.db(dbName)
  const collection = db.collection('notifications')

  await collection.insertOne({
    userAddress: userAddress.toLowerCase(),
    type,
    content,
    read: false,
    createdAt: new Date()
  })
}

export async function getNotifications(userAddress: string): Promise<Notification[]> {
  const client = await connectToDatabase()
  const db = client.db(dbName)
  const collection = db.collection('notifications')

  const notifications = await collection.find({ userAddress: userAddress.toLowerCase() }).sort({ createdAt: -1 }).toArray()
  return notifications.map(notification => ({
    ...notification,
    _id: notification._id.toString()
  })) as Notification[]
}

export async function markNotificationAsRead(notificationId: string) {
  const client = await connectToDatabase()
  const db = client.db(dbName)
  const collection = db.collection('notifications')

  await collection.updateOne(
    { _id: new ObjectId(notificationId) },
    { $set: { read: true } }
  )
}

