import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'

const getSecret = () =>
  new TextEncoder().encode(process.env.JWT_SECRET ?? 'please-set-jwt-secret-in-env')

export async function POST(request: NextRequest) {
  const { password } = await request.json()

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: '비밀번호가 틀렸습니다.' }, { status: 401 })
  }

  const token = await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .setIssuedAt()
    .sign(getSecret())

  const response = NextResponse.json({ success: true })
  response.cookies.set('admin-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  })

  return response
}
