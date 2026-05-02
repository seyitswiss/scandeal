import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ExpandableAnalyticsCard from '@/components/ExpandableAnalyticsCard'

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
  const googleReviewClicks = businessStats.filter((s) => s.type === 'link_click' && s.source === 'google').length
  const googleBoxOpen = businessStats.filter((s) => s.type === 'google_box_open').length
  const internalFeedback = businessStats.filter((s) => s.type === 'internal_feedback').length
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
  const redeems = dealStats.filter((s) => s.type === 'redeem').length
  const ourDealClosed = dealStats.filter((s) => s.type === 'our_deal_close').length

  const formatDay = (createdAt: Date | string) => {
    const date = new Date(createdAt)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}.${month}.${year}`
  }

  const groupByDay = (items: { createdAt: Date | string }[]) => {
    const counts: Record<string, number> = {}
    items.forEach((item) => {
      const day = formatDay(item.createdAt)
      counts[day] = (counts[day] || 0) + 1
    })
    return Object.entries(counts)
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => {
        const [aDay, aMonth, aYear] = a.day.split('.')
        const [bDay, bMonth, bYear] = b.day.split('.')
        return new Date(`${aYear}-${aMonth}-${aDay}`).getTime() - new Date(`${bYear}-${bMonth}-${bDay}`).getTime()
      })
  }

  const profileViewsByDay = groupByDay(businessStats.filter((s) => s.type === 'profile_view'))
  const linkClicksByDay = groupByDay(businessStats.filter((s) => s.type === 'link_click'))
  const dealViewsByDay = groupByDay(dealStats.filter((s) => s.type === 'view'))

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
    const dealRedeems = dealStats.filter((s) => s.dealId === deal.id && s.type === 'redeem').length
    const clickRate = dealViews === 0 ? 0 : Math.round((dealClicks / dealViews) * 100)
    return {
      id: deal.id,
      title: deal.title,
      views: dealViews,
      clicks: dealClicks,
      redeems: dealRedeems,
      clickRate,
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
        <ExpandableAnalyticsCard title="Profile Views" value={profileViews} details={profileViewsByDay} />
        <ExpandableAnalyticsCard title="Link Clicks" value={linkClicks} details={linkClicksByDay} />
        <ExpandableAnalyticsCard title="Deal Views" value={dealViews} details={dealViewsByDay} />
      </div>
      <div className="grid gap-6 md:grid-cols-3 mb-10">
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <div className="text-sm font-medium text-gray-500">Google Box Opens</div>
          <div className="mt-4 text-3xl font-bold text-indigo-600">{googleBoxOpen}</div>
        </div>
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <div className="text-sm font-medium text-gray-500">Internal Feedback</div>
          <div className="mt-4 text-3xl font-bold text-teal-600">{internalFeedback}</div>
        </div>
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <div className="text-sm font-medium text-gray-500">Google Review Clicks</div>
          <div className="mt-4 text-3xl font-bold text-blue-600">{googleReviewClicks}</div>
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

      <div className="grid gap-6 md:grid-cols-4 mb-10">
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <div className="text-sm font-medium text-gray-500">Deal Views</div>
          <div className="mt-4 text-3xl font-bold text-blue-600">{dealViews}</div>
        </div>
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <div className="text-sm font-medium text-gray-500">Deal Clicks</div>
          <div className="mt-4 text-3xl font-bold text-green-600">{dealClicks}</div>
        </div>
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <div className="text-sm font-medium text-gray-500">Redeems</div>
          <div className="mt-4 text-3xl font-bold text-purple-600">{redeems}</div>
        </div>
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <div className="text-sm font-medium text-gray-500">Our Deal Closed</div>
          <div className="mt-4 text-3xl font-bold text-red-600">{ourDealClosed}</div>
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
                    Views: {deal.views} • Clicks: {deal.clicks} • Redeems: {deal.redeems} • Click Rate: {deal.clickRate}%
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
