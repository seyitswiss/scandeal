// filepath: components/admin/DealsTable.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface DealWithBusiness {
  id: string
  title: string
  description: string | null
  discountText: string | null
  category: string | null
  subCategory: string | null
  isPremium: boolean
  isActive: boolean
  startDate: string | null
  endDate: string | null
  business: {
    id: string
    name: string
    slug: string
  }
}

function getDealStatus(deal: DealWithBusiness): { label: string; color: string } {
  const now = new Date()
  
  // Check if inactive
  if (!deal.isActive) {
    return { label: 'Inactive', color: 'bg-gray-200 text-gray-700' }
  }
  
  // Check date range
  if (deal.startDate && new Date(deal.startDate) > now) {
    return { label: 'Scheduled', color: 'bg-blue-200 text-blue-700' }
  }
  
  if (deal.endDate && new Date(deal.endDate) < now) {
    return { label: 'Expired', color: 'bg-red-200 text-red-700' }
  }
  
  return { label: 'Active', color: 'bg-green-200 text-green-700' }
}

export default function DealsTable({ deals }: { deals: DealWithBusiness[] }) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [dealsList, setDealsList] = useState(deals)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filteredDeals = dealsList.filter((deal) => {
    const query = searchQuery.toLowerCase()
    return (
      deal.title.toLowerCase().includes(query) ||
      deal.business.name.toLowerCase().includes(query) ||
      (deal.category?.toLowerCase().includes(query) ?? false) ||
      (deal.subCategory?.toLowerCase().includes(query) ?? false)
    )
  })

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this deal?')) {
      return
    }

    setDeletingId(id)

    const res = await fetch(`/api/deals/${id}`, {
      method: 'DELETE',
    })

    if (res.ok) {
      setDealsList(dealsList.filter(d => d.id !== id))
    }

    setDeletingId(null)
  }

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
              <th className="text-left p-3 border">Status</th>
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
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getDealStatus(deal).color}`}>
                    {getDealStatus(deal).label}
                  </span>
                </td>
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
                    <button
                      onClick={() => handleDelete(deal.id)}
                      disabled={deletingId === deal.id}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm disabled:opacity-50"
                    >
                      {deletingId === deal.id ? '...' : 'Delete'}
                    </button>
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