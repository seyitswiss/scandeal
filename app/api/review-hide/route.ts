import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)

  const slug = url.searchParams.get('slug')
  const redirectTo = url.searchParams.get('redirect') || '/'

  const proto = request.headers.get('x-forwarded-proto') || 'http'
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
  const origin = `${proto}://${host}`

  const response = NextResponse.redirect(new URL(redirectTo, origin))

  if (slug) {
    response.cookies.set(`scandeal_review_hidden_${slug}`, 'true', {
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      sameSite: 'lax',
    })
  }

  return response
}