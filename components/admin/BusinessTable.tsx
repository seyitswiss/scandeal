// filepath: components/admin/BusinessTable.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Business {
  id: string
  name: string
  slug: string
  category: string | null
  subCategory: string | null
}

interface BusinessTableProps {
  businesses: Business[]
}

export default function BusinessTable({ businesses }: BusinessTableProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleCopyLink = (slug: string) => {
    const profileUrl = `${window.location.origin}/profile/${slug}`
    navigator.clipboard.writeText(profileUrl)
    alert('Copied!')
  }

  // Filter businesses based on search query
  const filteredBusinesses = businesses.filter((business) => {
    const query = searchQuery.toLowerCase()
    return (
      business.name?.toLowerCase().includes(query) ||
      business.category?.toLowerCase().includes(query) ||
      business.subCategory?.toLowerCase().includes(query)
    )
  })

  return (
    <div>
      {/* Search Input */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, category, or subCategory..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 border rounded-lg"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-3 border">Name</th>
              <th className="text-left p-3 border">Category</th>
              <th className="text-left p-3 border">SubCategory</th>
              <th className="text-left p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBusinesses.map((business) => (
              <tr key={business.id} className="hover:bg-gray-50">
                <td className="p-3 border">{business.name}</td>
                <td className="p-3 border">{business.category || '-'}</td>
                <td className="p-3 border">{business.subCategory || '-'}</td>
                <td className="p-3 border">
                  <div className="flex gap-2">
                    <Link
                      href={`/profile/${business.slug}`}
                      target="_blank"
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Open
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleCopyLink(business.slug)}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      Copy Link
                    </button>
                    <Link
                      href={`/admin/businesses/${business.id}/analytics`}
                      className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                    >
                      Analytics
                    </Link>
                    <Link
                      href={`/admin/businesses/${business.id}/edit`}
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

      {filteredBusinesses.length === 0 && (
        <p className="text-center text-gray-500 mt-8">
          {searchQuery ? 'No businesses match your search.' : 'No businesses found.'}
        </p>
      )}
    </div>
  )
}