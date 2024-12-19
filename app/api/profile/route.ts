import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { Binary } from 'mongodb'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 })
  }

  try {
    const client = await clientPromise
    const db = client.db('blocke')
    const profile = await db.collection('profiles').findOne({
      address: address.toLowerCase()
    })

    if (profile && profile.profileImage) {
      // Convert BSON back to base64 string
      profile.profileImage = profile.profileImage.buffer.toString('base64')
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const address = formData.get('address') as string
    const bio = formData.get('bio') as string
    const instagramLink = formData.get('instagramLink') as string
    const youtubeLink = formData.get('youtubeLink') as string
    const linkedinLink = formData.get('linkedinLink') as string
    const profileImage = formData.get('profileImage') as File | null

    const client = await clientPromise
    const db = client.db('blocke')

    let profileImageBinary = null
    if (profileImage) {
      const arrayBuffer = await profileImage.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      profileImageBinary = new Binary(uint8Array)
    }

    // Get BEUID from the contract collection
    const beuidDoc = await db.collection('beuids').findOne({
      owner: address.toLowerCase()
    })

    const result = await db.collection('profiles').updateOne(
      { address: address.toLowerCase() },
      {
        $set: {
          bio,
          instagramLink,
          youtubeLink,
          linkedinLink,
          ...(profileImageBinary && { profileImage: profileImageBinary }),
          beuid: beuidDoc?.uid ? `${beuidDoc.uid}.BE` : undefined,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    )

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('Error saving profile:', error)
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
  }
}

