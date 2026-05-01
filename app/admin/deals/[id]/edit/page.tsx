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
    include: {
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

  return <EditDealForm deal={deal} />
}