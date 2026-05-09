'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface Business {
  id: string
  name: string
  category: string | null
  subCategory: string | null
}

export default function NewDealPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [businessLoading, setBusinessLoading] = useState(true)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountText: '',
    highlight: '',
    image: '',
    category: '',
    subCategory: '',
    isPremium: false,
    isActive: true,
    startDate: '',
    endDate: '',
    businessId: '',
  })

  const [generatingAI, setGeneratingAI] = useState(false)
  const [imagePreview, setImagePreview] = useState('')

  useEffect(() => {
    fetch('/api/businesses')
      .then((res) => res.json())
      .then((data) => {
        setBusinesses(data)
        setBusinessLoading(false)
      })
      .catch(() => setBusinessLoading(false))
  }, [])

  useEffect(() => {
    const businessId = searchParams.get('businessId')

    if (!businessLoading && businessId && !formData.businessId) {
      const business = businesses.find((b) => b.id === businessId)
      if (business) {
        handleBusinessChange(businessId)
      }
    }
  }, [businessLoading, businesses, formData.businessId, searchParams])

  function handleBusinessChange(businessId: string) {
    const business = businesses.find(b => b.id === businessId)
    setFormData({
      ...formData,
      businessId,
      category: business?.category || '',
      subCategory: business?.subCategory || '',
    })
  }

  async function handleGenerateAI() {
    if (!formData.businessId) {
      alert('Please select a business first')
      return
    }

    setGeneratingAI(true)
    try {
      const res = await fetch('/api/deals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: formData.businessId,
          isPremium: formData.isPremium,
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.businessId) {
      alert('Please select a business')
      return
    }
    
    setLoading(true)

    const res = await fetch('/api/deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    if (res.ok) {
      router.push('/admin/deals/new')
    } else {
      alert('Failed to create deal')
    }

    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Add New Deal</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Deal Details Section */}
        <div className="border p-4 rounded">
          <h2 className="text-lg font-bold mb-4">Deal Details</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium mb-1">Discount Text</label>
                <input
                  type="text"
                  value={formData.discountText}
                  onChange={(e) => setFormData({ ...formData, discountText: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
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
              <label className="block text-sm font-medium mb-1">Highlight</label>
              <input
                type="text"
                placeholder="z.B. Coffee + pastry combo / Gratis Dessert bei Hauptgang"
                value={formData.highlight}
                onChange={(e) => setFormData({ ...formData, highlight: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>

            {/* AI Generation Section */}
            {!formData.isPremium && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleGenerateAI}
                    disabled={generatingAI || !formData.businessId}
                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {generatingAI ? '⏳ Generierung...' : '✨ Mit KI generieren'}
                  </button>
                  {formData.title && (
                    <button
                      type="button"
                      onClick={handleGenerateAI}
                      disabled={generatingAI || !formData.businessId}
                      className="bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 disabled:opacity-50"
                      title="Regenerate"
                    >
                      {generatingAI ? '⏳' : '🔄'}
                    </button>
                  )}
                </div>
                <p className="text-xs text-blue-700 mt-2">Generiert Titel, Highlight, Beschreibung und Bild basierend auf Ihrem Business.</p>
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
          </div>
        </div>

        {/* Status Section */}
        <div className="border p-4 rounded">
          <h2 className="text-lg font-bold mb-4">Status</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center text-sm font-medium">
                <input
                  type="checkbox"
                  checked={formData.isPremium}
                  onChange={(e) => {
                    setFormData({ ...formData, isPremium: e.target.checked })
                    if (e.target.checked) {
                      setImagePreview('')
                    }
                  }}
                  className="mr-2"
                />
                Premium
              </label>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="mr-2"
                />
                Active
              </label>
            </div>
          </div>
        </div>

        {/* Zeitraum Section */}
        <div className="border p-4 rounded">
          <h2 className="text-lg font-bold mb-4">Zeitraum</h2>
          
          <div className="grid grid-cols-2 gap-4">
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

        {/* Business Section */}
        <div className="border p-4 rounded">
          <h2 className="text-lg font-bold mb-4">Business</h2>
          
          {formData.businessId && (
            <p className="text-sm text-gray-600 mb-3">
              Business: <span className="font-medium">{businesses.find(b => b.id === formData.businessId)?.name || 'Loading...'}</span>
            </p>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Business *</label>
              <select
                required
                disabled={businessLoading}
                value={formData.businessId}
                onChange={(e) => handleBusinessChange(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">{businessLoading ? 'Loading...' : 'Select a business'}</option>
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <p className="p-2 text-sm text-gray-700">{formData.category || '-'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Sub Category</label>
              <p className="p-2 text-sm text-gray-700">{formData.subCategory || '-'}</p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Deal'}
        </button>
      </form>
    </div>
  )
}