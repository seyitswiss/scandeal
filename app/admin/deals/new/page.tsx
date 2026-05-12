'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface Business {
  id: string
  name: string
  category: string | null
  subCategory: string | null
}

function NewDealForm() {
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

  const [dealIdea, setDealIdea] = useState('')
  const [generatingAI, setGeneratingAI] = useState(false)
  const [imagePreview, setImagePreview] = useState('')
  const [videoPreview, setVideoPreview] = useState('')
  const businessIdFromParam = searchParams.get('businessId')
  const isBusinessPrefilled = Boolean(businessIdFromParam)
  const selectedBusiness = businesses.find((business) => business.id === formData.businessId)

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

  async function handleGenerateAI(type: 'text' | 'image' | 'all') {
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
          idea: dealIdea,
        }),
      })

      if (res.ok) {
        const generated = await res.json()
        setFormData((prev) => ({
          ...prev,
          ...(type === 'text' || type === 'all' ? {
            title: generated.title || prev.title,
            highlight: generated.highlight || prev.highlight,
            description: generated.description || prev.description,
          } : {}),
          ...(type === 'image' || type === 'all' ? {
            image: generated.image || prev.image,
          } : {}),
        }))
        if ((type === 'image' || type === 'all') && generated.image) {
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

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'video/mp4') {
      alert('Please upload a valid MP4 file')
      return
    }

    const form = new FormData()
    form.append('video', file)

    const res = await fetch('/api/upload-video', {
      method: 'POST',
      body: form,
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Upload failed' }))
      alert(error.error || 'Upload failed')
      return
    }

    const result = await res.json()
    setFormData((prev) => ({ ...prev, image: result.path }))
    setVideoPreview(result.path)
    setImagePreview('')
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
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-5">Add New Deal</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* KI Section */}
        <div className="border bg-slate-50 p-4 rounded-lg">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">✨ Mit KI generieren</h2>
                <p className="text-sm text-gray-600 mt-1">Generiere Text, Bild oder beides automatisch.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleGenerateAI('text')}
                  disabled={generatingAI || !formData.businessId}
                  className="bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
                >
                  {generatingAI ? '⏳' : 'Text generieren'}
                </button>
                {!formData.isPremium && (
                  <button
                    type="button"
                    onClick={() => handleGenerateAI('image')}
                    disabled={generatingAI || !formData.businessId}
                    className="bg-green-600 text-white py-2 px-3 rounded hover:bg-green-700 disabled:opacity-50 text-sm"
                  >
                    {generatingAI ? '⏳' : 'Bild generieren'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleGenerateAI('all')}
                  disabled={generatingAI || !formData.businessId}
                  className="bg-purple-600 text-white py-2 px-3 rounded hover:bg-purple-700 disabled:opacity-50 text-sm"
                >
                  {generatingAI ? '⏳' : 'Alles generieren'}
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1">Deal Idee (optional)</label>
                <input
                  type="text"
                  value={dealIdea}
                  onChange={(e) => setDealIdea(e.target.value)}
                  placeholder="z. B. Kaffee + Kuchen"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                {formData.isPremium ? (
                  <>
                    <label className="block text-sm font-medium mb-1">MP4 Video hochladen</label>
                    <input
                      type="file"
                      accept="video/mp4"
                      onChange={handleVideoUpload}
                      className="w-full p-2 border rounded"
                    />
                    <p className="text-xs text-gray-600 mt-1">Nur MP4-Dateien. Upload speichert das Premium-Video.</p>
                  </>
                ) : (
                  <>
                    <label className="block text-sm font-medium mb-1">Bild hochladen</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full p-2 border rounded"
                    />
                    <p className="text-xs text-gray-600 mt-1">Upload überschreibt das KI-Bild.</p>
                  </>
                )}
              </div>
            </div>

            {formData.isPremium ? (
              videoPreview ? (
                <div className="overflow-hidden rounded-lg border bg-black">
                  <video
                    src={videoPreview}
                    controls
                    className="w-full h-auto"
                  />
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                  MP4 Vorschau erscheint hier nach Upload.
                </div>
              )
            ) : imagePreview ? (
              <div className="overflow-hidden rounded-lg border bg-white">
                <img src={imagePreview} alt="Vorschau" className="w-full h-auto" />
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                Vorschau erscheint hier nach KI-Generierung oder Upload.
              </div>
            )}
          </div>
        </div>

        {/* Deal Details Section */}
        <div className="border p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Deal Details</h2>
          </div>
          <div className="space-y-3">
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
                className="w-full p-2 border rounded min-h-[120px]"
              />
            </div>
          </div>
        </div>

        {/* Business Section */}
        <div className="border p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Business</h2>
            {isBusinessPrefilled && <span className="text-xs text-gray-500">Vorausgewählt</span>}
          </div>
          {isBusinessPrefilled ? (
            <div className="grid gap-3 sm:grid-cols-3 text-sm">
              <div className="rounded-lg border p-3 bg-white">
                <div className="text-xs text-gray-500">Business</div>
                <div className="font-medium text-slate-900">{selectedBusiness?.name || 'Lädt...'}</div>
              </div>
              <div className="rounded-lg border p-3 bg-white">
                <div className="text-xs text-gray-500">Category</div>
                <div className="font-medium text-slate-900">{selectedBusiness?.category || formData.category || '-'}</div>
              </div>
              <div className="rounded-lg border p-3 bg-white">
                <div className="text-xs text-gray-500">Sub Category</div>
                <div className="font-medium text-slate-900">{selectedBusiness?.subCategory || formData.subCategory || '-'}</div>
              </div>
            </div>
          ) : (
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
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="border p-4 rounded-lg">
            <h3 className="text-sm font-semibold mb-3">Status</h3>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isPremium}
                  onChange={(e) => {
                    const isPremium = e.target.checked
                    setFormData({ ...formData, isPremium, image: '' })
                    setImagePreview('')
                    setVideoPreview('')
                  }}
                  className="h-4 w-4"
                />
                Premium
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4"
                />
                Active
              </label>
            </div>
          </div>

          <div className="border p-4 rounded-lg">
            <h3 className="text-sm font-semibold mb-3">Zeitraum</h3>
            <div className="grid gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Start</label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End</label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
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
export default function NewDealPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <NewDealForm />
    </Suspense>
  )
}