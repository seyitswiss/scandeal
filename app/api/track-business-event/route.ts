import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const businessId = searchParams.get('businessId')
  const type = searchParams.get('type')
  const to = searchParams.get('to') || '/'

  if (!businessId || !type) {
    return NextResponse.redirect(new URL('/', request.nextUrl.origin))
  }

  await prisma.businessStat.create({
    data: {
      businessId,
      type,
    },
  })

  return NextResponse.redirect(new URL(to, request.nextUrl.origin), 303)
}