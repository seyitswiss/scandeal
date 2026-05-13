// filepath: app/admin/deals/[id]/edit/page.tsx
import { prisma } from '@/lib/prisma'
import EditDealForm from './EditDealForm'

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
      image: true,
      category: true,
      subCategory: true,
      isPremium: true,
      isActive: true,
      startDate: true,
      endDate: true,

      redeemableWhen: true,
      redeemableFor: true,
      requirements: true,
      combinability: true,
      conditionDetails: true,

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
    startDate: deal.startDate ? deal.startDate.toISOString().slice(0, 16) : null,
    endDate: deal.endDate ? deal.endDate.toISOString().slice(0, 16) : null,
  }

  return <EditDealForm deal={normalizedDeal} />
}