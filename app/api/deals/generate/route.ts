import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateDealContent } from '@/lib/dealGeneration'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { businessId, isPremium, idea } = body

    if (!businessId) {
      return NextResponse.json({ error: 'businessId is required' }, { status: 400 })
    }

    // Fetch business data
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: {
        name: true,
        category: true,
        subCategory: true,
        description: true,
      },
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Generate content
    const content = await generateDealContent(
      business.name,
      business.category || '',
      business.subCategory || '',
      business.description || undefined,
      typeof idea === 'string' ? idea : undefined,
      !Boolean(isPremium)
    )

    return NextResponse.json(content)
  } catch (error) {
    console.error('Deal generation error:', error)
    return NextResponse.json({ error: 'Failed to generate deal content' }, { status: 500 })
  }
}
