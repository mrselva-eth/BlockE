import { NextResponse } from 'next/server'

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ success: false, message: 'Token is missing' }, { status: 400 })
    }

    const verificationResponse = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${token}`,
      { method: 'POST' }
    )

    const verificationData = await verificationResponse.json()

    if (verificationData.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ success: false, message: 'CAPTCHA verification failed' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error verifying CAPTCHA:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

