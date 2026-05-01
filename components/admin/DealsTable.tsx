// filepath: components/admin/DealsTable.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'

interface DealWithBusiness {
  id: string
  title: string
  description: string | null
  discountText: string | null
  category: string | null
  subCategory: string | null
  isPremium: boolean
  business: {
    id: string
    name: string
    slug: string
  }
}

export default function DealsTable({ deals }: { deals: DealWithBusiness[] }) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredDeals = deals.filter((deal) => {
    const query = searchQuery.toLowerCase()
    return (
      deal.title.toLowerCase().includes(query) ||
      deal.business.name.toLowerCase().includes(query) ||
      (deal.category?.toLowerCase().includes(query) ?? false) ||
      (deal.subCategory?.toLowerCase().includes(query) ?? false)
    )
  })

  return (
    <div>
      {/* Search Input */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by title, business, category, or subCategory..."
          className="w-full p-3 border rounded-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-3 border">Deal Title</th>
              <th className="text-left p-3 border">Business</th>
              <th className="text-left p-3 border">Category</th>
              <th className="text-left p-3 border">SubCategory</th>
              <th className="text-left p-3 border">Premium</th>
              <th className="text-left p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeals.map((deal) => (
              <tr key={deal.id} className="hover:bg-gray-50">
                <td className="p-3 border">{deal.title}</td>
                <td className="p-3 border">{deal.business.name}</td>
                <td className="p-3 border">{deal.category || '-'}</td>
                <td className="p-3 border">{deal.subCategory || '-'}</td>
                <td className="p-3 border">{deal.isPremium ? 'Yes' : 'No'}</td>
                <td className="p-3 border">
                  <div className="flex gap-2">
                    <Link
                      href={`/profile/${deal.business.slug}`}
                      target="_blank"
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Open Business
                    </Link>
                    <Link
                      href={`/admin/deals/${deal.id}/edit`}
                      className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                    >
                      Edit
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredDeals.length === 0 && (
        <p className="text-center text-gray-500 mt-8">No deals found.</p>
      )}
    </div>
  )
}