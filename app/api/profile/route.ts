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

    // Explicitly include socialLinks in the response
    return NextResponse.json({
      profile: profile ? {
        ...profile,
        instagramLink: profile.instagramLink,
        youtubeLink: profile.youtubeLink,
        linkedinLink: profile.linkedinLink,
        githubLink: profile.githubLink,
        twitterLink: profile.twitterLink,
        discordUsername: profile.discordUsername
      } : null
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const address = formData.get('address') as string
    const name = formData.get('name') as string
    const bio = formData.get('bio') as string
    const email = formData.get('email') as string
    const instagramLink = formData.get('instagramLink') as string
    const youtubeLink = formData.get('youtubeLink') as string
    const linkedinLink = formData.get('linkedinLink') as string
    const githubLink = formData.get('githubLink') as string
    const twitterLink = formData.get('twitterLink') as string
    const discordUsername = formData.get('discordUsername') as string
    const profileImage = formData.get('profileImage') as File | null

    const client = await clientPromise
    const db = client.db('blocke')

    let profileImageString = null
    if (profileImage) {
      const arrayBuffer = await profileImage.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      profileImageString = `data:image/png;base64,${Buffer.from(uint8Array).toString('base64')}`
    }

    // Construct socialLinks object
    const socialLinks = {
      instagram: instagramLink,
      youtube: youtubeLink,
      linkedin: linkedinLink,
      github: githubLink,
      twitter: twitterLink,
      discord: discordUsername,
    };

    const beuidDoc = await db.collection('beuids').findOne({
      owner: address.toLowerCase()
    })

    const result = await db.collection('profiles').updateOne(
      { address: address.toLowerCase() },
      {
        $set: {
          name,
          bio,
          email,
          instagramLink: socialLinks.instagram, // Update individual fields
          youtubeLink: socialLinks.youtube,
          linkedinLink: socialLinks.linkedin,
          githubLink: socialLinks.github,
          twitterLink: socialLinks.twitter,
          discordUsername: socialLinks.discord,
          ...(profileImageString && { profileImage: profileImageString }),
          beuid: beuidDoc?.uid ? `${beuidDoc.uid}.BE` : undefined,
          socialLinks, // Also update the socialLinks object
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

