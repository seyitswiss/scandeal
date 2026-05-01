// filepath: app/admin/deals/page.tsx
import { prisma } from '@/lib/prisma'
import DealsTable from '@/components/admin/DealsTable'

export default async function DealsPage() {
  // Load all deals with business relation
  const deals = await prisma.deal.findMany({
    include: {
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