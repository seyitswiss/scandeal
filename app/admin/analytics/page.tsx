import { prisma } from '@/lib/prisma'

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
  const linkClicks = businessStats.filter((s) => s.type === 'link_click').length
  const aiUsage = businessStats.filter((s) => s.type === 'ai_usage').length

  // Group link clicks by source
  const linkClicksBySource: Record<string, number> = {}
  businessStats
    .filter((s) => s.type === 'link_click')
    .forEach((s) => {
      const source = s.source || 'unknown'
      linkClicksBySource[source] = (linkClicksBySource[source] || 0) + 1
    })

  // Calculate deal stats totals
  const dealViews = dealStats.filter((s) => s.type === 'view').length
  const dealClicks = dealStats.filter((s) => s.type === 'click').length

  // Group deal stats by deal title
  const dealStatsByTitle: Record<string, { views: number; clicks: number }> = {}
  dealStats.forEach((s) => {
    const title = s.deal.title || 'Unknown Deal'
    if (!dealStatsByTitle[title]) {
      dealStatsByTitle[title] = { views: 0, clicks: 0 }
    }
    if (s.type === 'view') {
      dealStatsByTitle[title].views += 1
    } else if (s.type === 'click') {
      dealStatsByTitle[title].clicks += 1
    }
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
        <div className="grid gap-4 md:grid-cols-2">
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
                      {stats.views} views • {stats.clicks} clicks
                    </div>
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
