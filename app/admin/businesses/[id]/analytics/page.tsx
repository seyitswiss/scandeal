import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function BusinessAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  if (!id) {
    return <div>Business ID missing</div>
  }

  const business = await prisma.business.findUnique({
    where: { id },
  })

  if (!business) {
    notFound()
  }

  const businessStats = await prisma.businessStat.findMany({
    where: { businessId: id },
  })

  const dealStats = await prisma.dealStat.findMany({
    where: { businessId: id },
    include: {
      deal: {
        select: {
          title: true,
        },
      },
    },
  })

  const profileViews = businessStats.filter((s) => s.type === 'profile_view').length
  const linkClicks = businessStats.filter((s) => s.type === 'link_click').length
  const aiUsage = businessStats.filter((s) => s.type === 'ai_usage').length

  const linkClicksBySource: Record<string, number> = {}
  businessStats
    .filter((s) => s.type === 'link_click')
    .forEach((s) => {
      const source = s.source || 'unknown'
      linkClicksBySource[source] = (linkClicksBySource[source] || 0) + 1
    })

  const dealViews = dealStats.filter((s) => s.type === 'view').length
  const dealClicks = dealStats.filter((s) => s.type === 'click').length

  // Fetch all deals for this business to show per-deal analytics
  const businessDeals = await prisma.deal.findMany({
    where: { businessId: id },
    select: {
      id: true,
      title: true,
    },
  })

  // Calculate per-deal stats
  const perDealStats = businessDeals.map((deal) => {
    const dealViews = dealStats.filter((s) => s.dealId === deal.id && s.type === 'view').length
    const dealClicks = dealStats.filter((s) => s.dealId === deal.id && s.type === 'click').length
    return {
      id: deal.id,
      title: deal.title,
      views: dealViews,
      clicks: dealClicks,
    }
  }).sort((a, b) => b.views - a.views)

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{business.name} Analytics</h1>
          <p className="text-sm text-gray-600 mt-2">Business-level performance for this profile.</p>
        </div>
        <Link href="/admin/businesses" className="text-sm text-blue-600 hover:underline">
          ← Back to Businesses
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-10">
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <div className="text-sm font-medium text-gray-500">Profile Views</div>
          <div className="mt-4 text-3xl font-bold text-blue-600">{profileViews}</div>
        </div>
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <div className="text-sm font-medium text-gray-500">Link Clicks</div>
          <div className="mt-4 text-3xl font-bold text-green-600">{linkClicks}</div>
        </div>
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <div className="text-sm font-medium text-gray-500">AI Usage</div>
          <div className="mt-4 text-3xl font-bold text-purple-600">{aiUsage}</div>
        </div>
      </div>

      {Object.keys(linkClicksBySource).length > 0 && (
        <div className="border rounded-lg p-6 bg-white shadow-sm mb-10">
          <h2 className="text-xl font-semibold mb-4">Link Clicks by Source</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(linkClicksBySource)
              .sort((a, b) => b[1] - a[1])
              .map(([source, count]) => (
                <div key={source} className="flex justify-between p-4 rounded-lg bg-gray-50">
                  <span className="text-sm text-gray-700 capitalize">{source}</span>
                  <span className="font-semibold text-gray-900">{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 mb-10">
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <div className="text-sm font-medium text-gray-500">Deal Views</div>
          <div className="mt-4 text-3xl font-bold text-blue-600">{dealViews}</div>
        </div>
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <div className="text-sm font-medium text-gray-500">Deal Clicks</div>
          <div className="mt-4 text-3xl font-bold text-green-600">{dealClicks}</div>
        </div>
      </div>

      {/* Per-Deal Analytics */}
      {perDealStats.length > 0 ? (
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Per-Deal Analytics</h2>
          <div className="space-y-4">
            {perDealStats.map((deal) => (
              <div key={deal.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                <div>
                  <div className="font-medium text-gray-900">{deal.title}</div>
                  <div className="text-sm text-gray-600">
                    Views: {deal.views} • Clicks: {deal.clicks}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-blue-600">{deal.views}</div>
                  <div className="text-sm text-gray-500">views</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-6 bg-white shadow-sm text-gray-600">
          No deals found for this business.
        </div>
      )}
    </div>
  )
}
