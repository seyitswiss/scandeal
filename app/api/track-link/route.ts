import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const businessId = searchParams.get('businessId')
  const source = searchParams.get('source') || 'unknown'
  const to = searchParams.get('to')

  if (!businessId || !to) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  await prisma.businessStat.create({
    data: {
      businessId,
      type: 'link_click',
      source,
    },
  })

  return NextResponse.redirect(to)
}