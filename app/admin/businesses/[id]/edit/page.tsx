// filepath: app/admin/businesses/[id]/edit/page.tsx
import { prisma } from '@/lib/prisma'
import EditBusinessForm from './EditBusinessForm'

export default async function EditBusinessPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  
  const business = await prisma.business.findUnique({
    where: { id },
  })

  if (!business) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-2xl font-bold">Business not found</h1>
      </div>
    )
  }

  return <EditBusinessForm business={business} />
}