import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const name = String(body.name || '').trim()

    if (!name) {
      return NextResponse.json({ exists: false })
    }

    const businesses = await prisma.business.findMany({
      select: {
        name: true,
      },
    })

    const exists = businesses.some(
      (business) =>
        business.name.trim().toLowerCase() === name.toLowerCase()
    )

    return NextResponse.json({ exists })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { exists: false },
      { status: 200 }
    )
  }
}