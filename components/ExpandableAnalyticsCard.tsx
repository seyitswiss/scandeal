'use client'

import { useState } from 'react'

interface DetailItem {
  day: string
  count: number
}

interface Props {
  title: string
  value: number
  details: DetailItem[]
}

export default function ExpandableAnalyticsCard({ title, value, details }: Props) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-lg bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left border rounded-lg p-6 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="text-sm font-medium text-gray-500">{title}</div>
        <div className="mt-4 text-3xl font-bold text-blue-600">{value}</div>
        <div className="text-xs text-gray-500 mt-2">{expanded ? 'Hide details' : 'View daily breakdown'}</div>
      </button>

      {expanded && details.length > 0 && (
        <div className="border-t p-4 bg-gray-50">
          <div className="space-y-2">
            {details.map((item) => (
              <div key={item.day} className="flex items-center justify-between text-sm text-gray-700">
                <span>{item.day}</span>
                <span className="font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {expanded && details.length === 0 && (
        <div className="border-t p-4 bg-gray-50 text-sm text-gray-500">No daily data available.</div>
      )}
    </div>
  )
}
