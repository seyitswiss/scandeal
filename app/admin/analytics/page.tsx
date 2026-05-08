import { prisma } from '@/lib/prisma'
import ExpandableAnalyticsCard from '@/components/ExpandableAnalyticsCard'
import { getDealRecommendation } from '@/lib/analyticsRecommendations'

export default async function AnalyticsPage() {
  // Get all business stats
  const businessStats = await prisma.businessStat.findMany({
    include: {
      business: {
        select: {
          name: true,
        },
      },
    },
  })

  // Get all deal stats with deal info
  const dealStats = await prisma.dealStat.findMany({
    include: {
      deal: {
        select: {
          title: true,
        },
      },
    },
  })

  // Calculate business stats totals
  const profileViews = businessStats.filter((s) => s.type === 'profile_view').length
  const qrScans = businessStats.filter((s) => s.type === 'profile_view_qr').length
  const instagramViews = businessStats.filter((s) => s.type === 'profile_view_instagram').length
  const googleViews = businessStats.filter((s) => s.type === 'profile_view_google').length
  const directViews =
    businessStats.filter(
      (s) => s.type === 'profile_view_direct' || s.type === 'profile_view',
    ).length
  const linkClicks = businessStats.filter((s) => s.type === 'link_click').length

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

  const qrScansByDay = groupByDay(businessStats.filter((s) => s.type === 'profile_view_qr'))
  const googleReviewClicks = businessStats.filter((s) => s.type === 'link_click' && s.source === 'google').length
  const googleBoxOpen = businessStats.filter((s) => s.type === 'google_box_open').length
  const internalFeedback = businessStats.filter((s) => s.type === 'internal_feedback').length
  const aiUsage = businessStats.filter((s) => s.type === 'ai_usage').length

  // Group link clicks by source
  const linkClicksBySource: Record<string, number> = {}
  businessStats
    .filter((s) => s.type === 'link_click')
    .forEach((s) => {
      const source = s.source || 'unknown'
      linkClicksBySource[source] = (linkClicksBySource[source] || 0) + 1
    })

  // Calculate per-business totals
  const businessTotalsById: Record<
    string,
    { businessId: string; businessName: string; profileViews: number; qrScans: number; linkClicks: number }
  > = {}

  businessStats.forEach((stat) => {
    const id = stat.businessId
    if (!businessTotalsById[id]) {
      businessTotalsById[id] = {
        businessId: id,
        businessName: stat.business?.name || 'Unknown Business',
        profileViews: 0,
        qrScans: 0,
        linkClicks: 0,
      }
    }

    if (stat.type.startsWith('profile_view')) {
      businessTotalsById[id].profileViews += 1
    }
    if (stat.type === 'profile_view_qr') {
      businessTotalsById[id].qrScans += 1
    }
    if (stat.type === 'link_click') {
      businessTotalsById[id].linkClicks += 1
    }
  })

  const topBusinesses = Object.values(businessTotalsById)
    .sort((a, b) => b.profileViews - a.profileViews)
    .slice(0, 10)

  // Calculate deal stats totals
  const dealViews = dealStats.filter((s) => s.type === 'view').length
  const dealClicks = dealStats.filter((s) => s.type === 'click').length
  const redeems = dealStats.filter((s) => s.type === 'redeem').length
  const ourDealClosed = dealStats.filter((s) => s.type === 'our_deal_close').length

  // Group deal stats by deal title
  const dealStatsByTitle: Record<string, { views: number; clicks: number; redeems: number; clickRate: number; redeemRate: number; status: string }> = {}
  dealStats.forEach((s) => {
    const title = s.deal.title || 'Unknown Deal'
    if (!dealStatsByTitle[title]) {
      dealStatsByTitle[title] = { views: 0, clicks: 0, redeems: 0, clickRate: 0, redeemRate: 0, status: '' }
    }
    if (s.type === 'view') {
      dealStatsByTitle[title].views += 1
    } else if (s.type === 'click') {
      dealStatsByTitle[title].clicks += 1
    } else if (s.type === 'redeem') {
      dealStatsByTitle[title].redeems += 1
    }
  })

  // Calculate conversion rates and performance status for each deal
  Object.values(dealStatsByTitle).forEach((deal) => {
    deal.clickRate = deal.views === 0 ? 0 : Math.round((deal.clicks / deal.views) * 100)
    deal.redeemRate = deal.clicks === 0 ? 0 : Math.round((deal.redeems / deal.clicks) * 100)

    deal.status = getDealRecommendation(deal.views, deal.clicks, deal.redeems)
  })

  // Sort deals by views (descending)
  const topDeals = Object.entries(dealStatsByTitle)
    .sort((a, b) => b[1].views - a[1].views)
    .slice(0, 10)

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Analytics</h1>

      {/* Business Stats Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Business Stats</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Profile Views Card */}
          <div className="border rounded-lg p-6 bg-white">
            <div className="text-sm font-medium text-gray-600 mb-2">Profile Views</div>
            <div className="text-3xl font-bold text-blue-600">{profileViews}</div>
            <div className="text-xs text-gray-500 mt-2">Total page loads</div>
          </div>

          {/* Link Clicks Card */}
          <div className="border rounded-lg p-6 bg-white">
            <div className="text-sm font-medium text-gray-600 mb-2">Link Clicks</div>
            <div className="text-3xl font-bold text-green-600">{linkClicks}</div>
            <div className="text-xs text-gray-500 mt-2">External link interactions</div>
          </div>

          {/* AI Usage Card */}
          <div className="border rounded-lg p-6 bg-white">
            <div className="text-sm font-medium text-gray-600 mb-2">AI Usage</div>
            <div className="text-3xl font-bold text-purple-600">{aiUsage}</div>
            <div className="text-xs text-gray-500 mt-2">AI features used</div>
          </div>
        </div>

        <div className="mt-8 border rounded-lg p-6 bg-white">
          <h3 className="font-bold text-lg mb-4">Profile Views by Source</h3>
          <div className="grid gap-4 md:grid-cols-4">
            <ExpandableAnalyticsCard
              title="QR Scans"
              value={qrScans}
              details={qrScansByDay}
            />
            <div className="border rounded-lg p-6 bg-white">
              <div className="text-sm font-medium text-gray-600 mb-2">Instagram Views</div>
              <div className="text-3xl font-bold text-pink-600">{instagramViews}</div>
              <div className="text-xs text-gray-500 mt-2">Views from Instagram sources</div>
            </div>
            <div className="border rounded-lg p-6 bg-white">
              <div className="text-sm font-medium text-gray-600 mb-2">Google Views</div>
              <div className="text-3xl font-bold text-blue-600">{googleViews}</div>
              <div className="text-xs text-gray-500 mt-2">Views from Google sources</div>
            </div>
            <div className="border rounded-lg p-6 bg-white">
              <div className="text-sm font-medium text-gray-600 mb-2">Direct Views</div>
              <div className="text-3xl font-bold text-green-600">{directViews}</div>
              <div className="text-xs text-gray-500 mt-2">Views without a source param</div>
            </div>
          </div>
        </div>

        <div className="mt-8 border rounded-lg p-6 bg-white">
          <h3 className="font-bold text-lg mb-4">Top Businesses</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-600">Business</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Profile Views</th>
                  <th className="px-4 py-3 font-medium text-gray-600">QR Scans</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Link Clicks</th>
                </tr>
              </thead>
              <tbody>
                {topBusinesses.map((business) => (
                  <tr key={business.businessId} className="border-t">
                    <td className="px-4 py-3 text-gray-900">{business.businessName}</td>
                    <td className="px-4 py-3 text-gray-900">{business.profileViews}</td>
                    <td className="px-4 py-3 text-gray-900">{business.qrScans}</td>
                    <td className="px-4 py-3 text-gray-900">{business.linkClicks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mt-6">
          <div className="border rounded-lg p-6 bg-white">
            <div className="text-sm font-medium text-gray-600 mb-2">Google Box Opens</div>
            <div className="text-3xl font-bold text-indigo-600">{googleBoxOpen}</div>
            <div className="text-xs text-gray-500 mt-2">Google review prompt shown</div>
          </div>
          <div className="border rounded-lg p-6 bg-white">
            <div className="text-sm font-medium text-gray-600 mb-2">Internal Feedback</div>
            <div className="text-3xl font-bold text-teal-600">{internalFeedback}</div>
            <div className="text-xs text-gray-500 mt-2">Feedback button clicks</div>
          </div>
          <div className="border rounded-lg p-6 bg-white">
            <div className="text-sm font-medium text-gray-600 mb-2">Google Review Clicks</div>
            <div className="text-3xl font-bold text-blue-600">{googleReviewClicks}</div>
            <div className="text-xs text-gray-500 mt-2">Google review button clicks</div>
          </div>
        </div>

        {/* Link Clicks by Source */}
        {Object.keys(linkClicksBySource).length > 0 && (
          <div className="mt-8 border rounded-lg p-6 bg-white">
            <h3 className="font-bold text-lg mb-4">Link Clicks by Source</h3>
            <div className="space-y-3">
              {Object.entries(linkClicksBySource)
                .sort((a, b) => b[1] - a[1])
                .map(([source, count]) => (
                  <div key={source} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{source}</span>
                    <span className="font-semibold text-gray-700">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Deal Stats Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Deal Stats</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {/* Deal Views Card */}
          <div className="border rounded-lg p-6 bg-white">
            <div className="text-sm font-medium text-gray-600 mb-2">Deal Views</div>
            <div className="text-3xl font-bold text-blue-600">{dealViews}</div>
            <div className="text-xs text-gray-500 mt-2">Times deals were displayed</div>
          </div>

          {/* Deal Clicks Card */}
          <div className="border rounded-lg p-6 bg-white">
            <div className="text-sm font-medium text-gray-600 mb-2">Deal Clicks</div>
            <div className="text-3xl font-bold text-green-600">{dealClicks}</div>
            <div className="text-xs text-gray-500 mt-2">Deal interactions</div>
          </div>

          {/* Redeems Card */}
          <div className="border rounded-lg p-6 bg-white">
            <div className="text-sm font-medium text-gray-600 mb-2">Redeems</div>
            <div className="text-3xl font-bold text-purple-600">{redeems}</div>
            <div className="text-xs text-gray-500 mt-2">Deal redemptions</div>
          </div>

          {/* Our Deal Closed Card */}
          <div className="border rounded-lg p-6 bg-white">
            <div className="text-sm font-medium text-gray-600 mb-2">Our Deal Closed</div>
            <div className="text-3xl font-bold text-red-600">{ourDealClosed}</div>
            <div className="text-xs text-gray-500 mt-2">Our Deal modal closed</div>
          </div>
        </div>

        {/* Top Deals */}
        {topDeals.length > 0 && (
          <div className="mt-8 border rounded-lg p-6 bg-white">
            <h3 className="font-bold text-lg mb-4">Top Deals (by Views)</h3>
            <div className="space-y-4">
              {topDeals.map(([title, stats]) => (
                <div key={title} className="flex items-center justify-between pb-4 border-b last:border-b-0">
                  <div>
                    <div className="font-medium text-gray-900">{title}</div>
                    <div className="text-sm text-gray-500">
                      {stats.views} views • {stats.clicks} clicks • {stats.redeems} redeems • Click Rate: {stats.clickRate}% • Redeem Rate: {stats.redeemRate}%
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{stats.status}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-blue-600">{stats.views}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {businessStats.length === 0 && dealStats.length === 0 && (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <p className="text-gray-500">No analytics data yet. Users will be tracked here.</p>
        </div>
      )}
    </div>
  )
}
