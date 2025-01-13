import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

interface Search {
 searchedAddress: string;
 searchCount: number;
 resolvedAddress: string; // Include resolvedAddress
 totalHoldingsETH?: number; // Make these optional
 totalHoldingsUSD?: number;
 gasSpentETH?: string;
 isEns: boolean;
 lastSearched: Date;
}

interface SearchDoc {
 _id: ObjectId;
 connectedAddress: string;
 totalSearchedCount: number;
 searches: Search[];
}

export async function POST(request: Request) {
 try {
   const {
     connectedAddress,
     searchedAddress,
     resolvedAddress,
     totalHoldingsETH,
     totalHoldingsUSD,
     gasSpentETH,
     isEns
   } = await request.json()

   if (!connectedAddress || !searchedAddress || !resolvedAddress) {
     return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
   }

   const client = await clientPromise
   const db = client.db('blocke')
   const searchesCollection = db.collection<SearchDoc>('searches')

   let searchDoc = await searchesCollection.findOne({ connectedAddress: connectedAddress.toLowerCase() })

   if (!searchDoc) {
     // Create a new search document
     const newSearch: Search = {
       searchedAddress: searchedAddress.toLowerCase(),
       searchCount: 1,
       resolvedAddress: resolvedAddress.toLowerCase(),
       totalHoldingsETH,
       totalHoldingsUSD,
       gasSpentETH: gasSpentETH || '0', // Provide default value if not present
       isEns,
       lastSearched: new Date(),
     }
     
     searchDoc = {
       _id: new ObjectId(),
       connectedAddress: connectedAddress.toLowerCase(),
       totalSearchedCount: 1,
       searches: [newSearch],
     }

     await searchesCollection.insertOne(searchDoc)
   } else {
     // Update the existing search document
     const existingSearchIndex = searchDoc.searches.findIndex(search => search.searchedAddress === searchedAddress.toLowerCase())

     if (existingSearchIndex > -1) {
       // Update existing search entry
       searchDoc.searches[existingSearchIndex] = {
         ...searchDoc.searches[existingSearchIndex],
         searchCount: searchDoc.searches[existingSearchIndex].searchCount + 1,
         resolvedAddress: resolvedAddress.toLowerCase(),
         totalHoldingsETH,
         totalHoldingsUSD,
         gasSpentETH,
         isEns,
         lastSearched: new Date()
       }
     } else {
       // Create a new search entry
       const newSearch: Search = {
         searchedAddress: searchedAddress.toLowerCase(),
         searchCount: 1,
         resolvedAddress: resolvedAddress.toLowerCase(),
         totalHoldingsETH,
         totalHoldingsUSD,
         gasSpentETH: gasSpentETH || '0',
         isEns,
         lastSearched: new Date(),
       }
       searchDoc.searches.push(newSearch)
     }

     searchDoc.totalSearchedCount++

     await searchesCollection.replaceOne({ _id: searchDoc._id }, searchDoc)
   }


   return NextResponse.json({ success: true })
 } catch (error) {
   console.error('Error saving search:', error)
   return NextResponse.json({ success: false, error: 'Failed to save search' }, { status: 500 })
 }
}

