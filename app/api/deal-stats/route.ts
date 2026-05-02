import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dealId, businessId, type } = body

    if (!dealId || !businessId || !type) {
      return NextResponse.json(
        { error: 'Missing dealId, businessId, or type' },
        { status: 400 }
      )
    }

    const stat = await prisma.dealStat.create({
      data: {
        dealId,
        businessId,
        type,
      },
    })

    return NextResponse.json({ success: true, stat }, { status: 201 })
  } catch (error) {
    console.error('Error creating deal stat:', error)
    return NextResponse.json(
      { error: 'Failed to create stat' },
      { status: 500 }
    )
  }
}
