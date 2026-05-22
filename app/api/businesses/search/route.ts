import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim() || ''

  if (query.length < 2) {
    return NextResponse.json([])
  }

  const businesses = await prisma.business.findMany({
    where: {
      OR: [
        { name: { contains: query } },
        { slug: { contains: query } },
        { googleCity: { contains: query } },
      ],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      googleCity: true,
    },
    take: 10,
    orderBy: {
      name: 'asc',
    },
  })

  return NextResponse.json(businesses)
}