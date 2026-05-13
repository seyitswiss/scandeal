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
  isActive: boolean
}

interface BusinessTableProps {
  businesses: Business[]
}

export default function BusinessTable({ businesses }: BusinessTableProps) {
  const [businessList, setBusinessList] = useState<Business[]>(businesses)
  const [searchQuery, setSearchQuery] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  async function handleToggleActive(business: Business) {
    setUpdatingId(business.id)

    try {
      const res = await fetch(`/api/businesses/${business.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !business.isActive }),
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Failed to update business' }))
        alert(error.error || 'Failed to update business')
        return
      }

      const updated = await res.json()
      setBusinessList((current) =>
        current.map((item) =>
          item.id === business.id ? { ...item, isActive: updated.isActive } : item
        )
      )
    } catch (error) {
      console.error('Update business error:', error)
      alert('Failed to update business')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleCopyLink = (slug: string) => {
  const profileUrl = `${window.location.origin}/profile/${slug}`

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(profileUrl)
  } else {
    const textArea = document.createElement('textarea')
    textArea.value = profileUrl

    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'

    document.body.appendChild(textArea)

    textArea.focus()
    textArea.select()

    document.execCommand('copy')

    document.body.removeChild(textArea)
  }

  alert('Copied!')
}

  // Filter businesses based on search query
  const filteredBusinesses = businessList.filter((business) => {
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
              <th className="text-left p-3 border">Status</th>
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
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${business.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'}`}>
                    {business.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-3 border">
                  <div className="flex flex-wrap gap-2"> 
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
                    <button
                      type="button"
                      onClick={() => handleToggleActive(business)}
                      disabled={updatingId === business.id}
                      className={`px-3 py-1 text-white rounded text-sm ${business.isActive ? 'bg-gray-600 hover:bg-gray-700' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                      {business.isActive ? 'Deactivate' : 'Activate'}
                    </button>
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