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
  isActive: boolean
  startDate: string | null
  endDate: string | null
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
    isActive: deal.isActive,
    startDate: deal.startDate ? deal.startDate.slice(0, 16) : '',
    endDate: deal.endDate ? deal.endDate.slice(0, 16) : '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch(`/api/deals/${deal.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    setLoading(false)

    if (res.ok) {
      setSaved(true)
      router.push('/admin/deals')
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Edit Deal</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border p-4 rounded">
          <h2 className="text-lg font-bold mb-3">Business</h2>
          <p className="text-gray-700">{deal.business.name}</p>
        </div>

        <div className="border p-4 rounded space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
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
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Discount Text</label>
            <input
              type="text"
              value={formData.discountText}
              onChange={(e) => setFormData({ ...formData, discountText: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SubCategory</label>
              <input
                type="text"
                value={formData.subCategory}
                onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isPremium}
                onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                className="h-4 w-4"
              />
              <span className="text-sm">Premium deal</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4"
              />
              <span className="text-sm">Active</span>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex justify-center items-center px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'Saving...' : 'Save Deal'}
        </button>
      </form>

      {saved && (
        <div className="mt-4 rounded border border-green-200 bg-green-50 p-4 text-green-900">
          Deal updated successfully. Redirecting...
        </div>
      )}
    </div>
  )
}
