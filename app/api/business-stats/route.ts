import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessId, type, source } = body

    if (!businessId || !type) {
      return NextResponse.json(
        { error: 'Missing businessId or type' },
        { status: 400 }
      )
    }

    const stat = await prisma.businessStat.create({
      data: {
        businessId,
        type,
        source: source || null,
      },
    })

    return NextResponse.json({ success: true, stat }, { status: 201 })
  } catch (error) {
    console.error('Error creating business stat:', error)
    return NextResponse.json(
      { error: 'Failed to create stat' },
      { status: 500 }
    )
  }
}
