// filepath: app/admin/deals/[id]/edit/EditDealForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DealData {
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
  }
}

export default function EditDealForm({ deal }: { deal: DealData }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const [formData, setFormData] = useState({
    title: deal.title,
    description: deal.description || '',
    discountText: deal.discountText || '',
    category: deal.category || '',
    subCategory: deal.subCategory || '',
    isPremium: deal.isPremium,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch(`/api/deals/${deal.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    if (res.ok) {
      setSaved(true)
    }

    setLoading(false)
  }

  if (saved) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Deal Updated!</h1>
        <button
          onClick={() => router.push('/admin/deals')}
          className="w-full bg-green-600 text-white py-3 px-4 rounded hover:bg-green-700"
        >
          Back to Deals
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Edit Deal</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business (read-only) */}
        <div className="border p-4 rounded">
          <h2 className="text-lg font-bold mb-4">Business</h2>
          <p className="text-gray-600">{deal.business.name}</p>
        </div>

        {/* Deal Details */}
        <div className="border p-4 rounded">
          <h2 className="text-lg font-bold mb-4">Deal Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Discount Text</label>
              <input
                type="text"
                value={formData.discountText}
                onChange={(e) => setFormData({ ...formData, discountText: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="e.g. 20% off"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <p className="text-gray-600">{formData.category || '-'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Sub Category</label>
              <p className="text-gray-600">{formData.subCategory || '-'}</p>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isPremium}
                  onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                />
                <span className="text-sm font-medium">Premium Deal</span>
              </label>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 disabled:opacity50"
        >
          {loading ? 'Saving...' : 'Update Deal'}
        </button>
      </form>
    </div>
  )
}