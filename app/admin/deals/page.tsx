// filepath: app/admin/deals/page.tsx
import { prisma } from '@/lib/prisma'
import DealsTable from '@/components/admin/DealsTable'

export default async function DealsPage() {
  // Load all deals with business relation and required status fields
  const deals = await prisma.deal.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      discountText: true,
      category: true,
      subCategory: true,
      isPremium: true,
      isActive: true,
      startDate: true,
      endDate: true,
      businessId: true,
      business: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Deals</h1>
      <DealsTable deals={deals} />
    </div>
  )
}