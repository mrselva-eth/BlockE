import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

interface NewsletterSubscription {
 email: string;
 subscribedAt: Date;
}

interface NewsletterData {
 userAddress: string;
 mailCount: number;
 emails: NewsletterSubscription[];
}

export async function GET(request: Request) {
 const { searchParams } = new URL(request.url)
 const address = searchParams.get('address')

 if (!address) {
   return NextResponse.json({ error: 'Address is required' }, { status: 400 })
 }

 try {
   const client = await clientPromise
   const db = client.db('blocke')
   const newsletterCollection = db.collection<NewsletterData>('newsletter')

   const newsletterData = await newsletterCollection.findOne({ userAddress: address.toLowerCase() })

   if (!newsletterData) {
     return NextResponse.json({ mailCount: 0, emails: [] })
   }

   return NextResponse.json({ mailCount: newsletterData.mailCount, emails: newsletterData.emails })
 } catch (error) {
   console.error('Error fetching newsletter data:', error)
   return NextResponse.json({ error: 'Failed to fetch newsletter data' }, { status: 500 })
 }
}

export async function POST(request: Request) {
 try {
   const { email, address } = await request.json()

   if (!email) {
     return NextResponse.json({ error: 'Email is required' }, { status: 400 })
   }

   if (!address) {
     return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 })
   }

   const client = await clientPromise
   const db = client.db('blocke')
   const newsletterCollection = db.collection<NewsletterData>('newsletter')

   // Find existing newsletter data for the user
   let newsletterData = await newsletterCollection.findOne({ userAddress: address.toLowerCase() })

   if (newsletterData) {
     // Check if email already exists
     const emailExists = newsletterData.emails.some(sub => sub.email === email)
     if (emailExists) {
       return NextResponse.json({ error: 'Email already subscribed for this wallet address' }, { status: 400 })
     }

     // Update existing document
     const newSubscription: NewsletterSubscription = { email, subscribedAt: new Date() }
     await newsletterCollection.updateOne(
       { userAddress: address.toLowerCase() },
       {
         $push: { emails: newSubscription },
         $inc: { mailCount: 1 }
       }
     );
   } else {
     // Create new document
     const newSubscription: NewsletterSubscription = { email, subscribedAt: new Date() }
     const newNewsletterData: NewsletterData = {
       userAddress: address.toLowerCase(),
       mailCount: 1,
       emails: [newSubscription],
     };
     await newsletterCollection.insertOne(newNewsletterData);
   }

   return NextResponse.json({ success: true })
 } catch (error) {
   console.error('Newsletter subscription error:', error)
   return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
 }
}

