// filepath: app/admin/deals/[id]/edit/EditDealForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DealData {
  id: string
  title: string
  description: string | null
  discountText: string | null
  highlight: string | null
  image: string | null
  category: string | null
  subCategory: string | null
  isPremium: boolean
  isActive: boolean
  startDate: string | null
  endDate: string | null
  businessId: string
  business: {
    id: string
    name: string
  }
}

export default function EditDealForm({ deal }: { deal: DealData }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [generatingAI, setGeneratingAI] = useState(false)
  const [saved, setSaved] = useState(false)
  const [imagePreview, setImagePreview] = useState(deal.image || '')

  const [formData, setFormData] = useState({
    title: deal.title,
    description: deal.description || '',
    discountText: deal.discountText || '',
    highlight: deal.highlight || '',
    image: deal.image || '',
    category: deal.category || '',
    subCategory: deal.subCategory || '',
    isPremium: deal.isPremium ?? false,
    isActive: deal.isActive ?? false,
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

    if (res.ok) {
      setSaved(true)
    }

    setLoading(false)
  }

  async function handleGenerateAI() {
    if (deal.isPremium) {
      alert('Premium deals require manual MP4 uploads')
      return
    }

    setGeneratingAI(true)
    try {
      const res = await fetch('/api/deals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: deal.businessId,
          isPremium: deal.isPremium,
        }),
      })

      if (res.ok) {
        const generated = await res.json()
        setFormData((prev) => ({
          ...prev,
          title: generated.title || prev.title,
          highlight: generated.highlight || prev.highlight,
          description: generated.description || prev.description,
          image: generated.image || prev.image,
        }))
        if (generated.image) {
          setImagePreview(generated.image)
        }
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to generate deal content')
      }
    } catch (error) {
      console.error('Generation error:', error)
      alert('Failed to generate deal content')
    } finally {
      setGeneratingAI(false)
    }
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        setFormData({ ...formData, image: dataUrl })
        setImagePreview(dataUrl)
      }
      reader.readAsDataURL(file)
    }
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
              <label className="block text-sm font-medium mb-1">Highlight</label>
              <input
                type="text"
                value={formData.highlight}
                onChange={(e) => setFormData({ ...formData, highlight: e.target.value })}
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

            {/* AI Generation Section */}
            {!formData.isPremium && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleGenerateAI}
                    disabled={generatingAI}
                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {generatingAI ? '⏳ Generierung...' : '✨ Mit KI generieren'}
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateAI}
                    disabled={generatingAI}
                    className="bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 disabled:opacity-50"
                    title="Regenerate"
                  >
                    {generatingAI ? '⏳' : '🔄'}
                  </button>
                </div>
                <p className="text-xs text-blue-700 mt-2">Regeneriert Titel, Highlight, Beschreibung und Bild.</p>
              </div>
            )}

            {/* Image Upload & Preview */}
            <div className="mt-4 border p-4 rounded">
              <label className="block text-sm font-medium mb-2">Bild</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={formData.isPremium}
                className="w-full p-2 border rounded disabled:opacity-50"
              />
              <p className="text-xs text-gray-600 mt-1">
                {formData.isPremium ? 'Premium Deals verwenden nur MP4 Videos' : 'Laden Sie ein Bild hoch oder lassen Sie es mit KI generieren'}
              </p>
              {imagePreview && (
                <div className="mt-3">
                  <img
                    src={imagePreview}
                    alt="Vorschau"
                    className="max-w-xs h-auto rounded"
                  />
                </div>
              )}
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
                  onChange={(e) => {
                    setFormData({ ...formData, isPremium: e.target.checked })
                    if (e.target.checked) {
                      setImagePreview('')
                    }
                  }}
                />
                <span className="text-sm font-medium">Premium Deal</span>
              </label>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <span className="text-sm font-medium">Active</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Start Date (optional)</label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">End Date (optional)</label>
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
          className="w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Update Deal'}
        </button>
      </form>
    </div>
  )
}