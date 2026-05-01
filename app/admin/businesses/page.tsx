// filepath: app/admin/businesses/page.tsx
import { prisma } from '@/lib/prisma'
import BusinessTable from '@/components/admin/BusinessTable'

export default async function BusinessesPage() {
  // Load all businesses
  const businesses = await prisma.business.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Businesses</h1>
      <BusinessTable businesses={businesses} />
    </div>
  )
}