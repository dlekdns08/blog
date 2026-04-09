import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const getSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required')
  }
  return new TextEncoder().encode(process.env.JWT_SECRET)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAdminPage = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')
  const isAdminApi =
    pathname.startsWith('/api/admin') && !pathname.startsWith('/api/admin/login')

  if (isAdminPage || isAdminApi) {
    const token = request.cookies.get('admin-token')?.value

    if (!token) {
      if (isAdminApi) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    try {
      await jwtVerify(token, getSecret())
    } catch {
      if (isAdminApi) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }
      const res = NextResponse.redirect(new URL('/admin/login', request.url))
      res.cookies.delete('admin-token')
      return res
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
