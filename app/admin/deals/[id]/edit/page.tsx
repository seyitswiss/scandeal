// filepath: app/admin/deals/[id]/edit/page.tsx
import { prisma } from '@/lib/prisma'
import EditDealForm from '@/components/admin/EditDealForm'

export default async function EditDealPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  
  const deal = await prisma.deal.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      discountText: true,
      highlight: true,
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
        },
      },
    },
  })

  if (!deal) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-2xl font-bold">Deal not found</h1>
      </div>
    )
  }

  const normalizedDeal = {
    ...deal,
    startDate: deal.startDate ? String(deal.startDate) : null,
    endDate: deal.endDate ? String(deal.endDate) : null,
  }

  return <EditDealForm deal={normalizedDeal} />
}