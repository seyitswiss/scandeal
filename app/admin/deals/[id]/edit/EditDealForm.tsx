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

  redeemableWhen: string | null
  redeemableFor: string | null
  requirements: string | null
  combinability: string | null
  conditionDetails: string | null

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
  const [imagePreview, setImagePreview] = useState(deal.isPremium && deal.image?.endsWith('.mp4') ? '' : deal.image || '')
  const [videoPreview, setVideoPreview] = useState(deal.isPremium && deal.image?.endsWith('.mp4') ? deal.image : '')
  const [dealIdea, setDealIdea] = useState('')

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

    redeemableWhen: deal.redeemableWhen || '',
    redeemableFor: deal.redeemableFor || '',
    requirements: deal.requirements || '',
    combinability: deal.combinability || '',
    conditionDetails: deal.conditionDetails || '',
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

  async function handleGenerateAI(type: 'text' | 'image' | 'all') {
    setGeneratingAI(true)
    try {
      const res = await fetch('/api/deals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
  businessId: deal.businessId,
  isPremium: formData.isPremium,
  idea: dealIdea,
  type,
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
        alert(error.error || 'Promotion konnte nicht generiert werden')
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

  if (saved) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Promotion gespeichert!</h1>
        <button
          onClick={() => router.push('/admin/deals')}
          className="w-full bg-green-600 text-white py-3 px-4 rounded hover:bg-green-700"
        >
          Zurück zu Promotions
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-5">Promotion bearbeiten</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* KI Section */}
        <div className="border bg-slate-50 p-4 rounded-lg">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">✨ Promo-Idee / KI</h2>
                <p className="text-sm text-gray-600 mt-1">Ziel oder Idee eingeben. Die KI erstellt daraus eine passende Promotion mit Titel, Highlight, Beschreibung und Bild.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleGenerateAI('text')}
                  disabled={generatingAI}
                  className="bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
                >
                  {generatingAI ? '⏳' : 'Text generieren'}
                </button>
                {!formData.isPremium && (
                  <button
                    type="button"
                    onClick={() => handleGenerateAI('image')}
                    disabled={generatingAI}
                    className="bg-green-600 text-white py-2 px-3 rounded hover:bg-green-700 disabled:opacity-50 text-sm"
                  >
                    {generatingAI ? '⏳' : 'Bild generieren'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleGenerateAI('all')}
                  disabled={generatingAI}
                  className="bg-purple-600 text-white py-2 px-3 rounded hover:bg-purple-700 disabled:opacity-50 text-sm"
                >
                  {generatingAI ? '⏳' : 'Alles generieren'}
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1">Ziel / Promo-Idee</label>
                <input
                  type="text"
                  value={dealIdea}
                  onChange={(e) => setDealIdea(e.target.value)}
                  placeholder="z. B. mehr Laufkundschaft, neues Gericht, freie Termine, lokale Sichtbarkeit"
                  className="w-full p-2 border rounded"
                />
                <p className="mt-3 text-xs text-gray-500">
  Schnellstart-Ideen für die KI
</p>
                <div className="mt-3 flex flex-wrap gap-2">
  {[
    'Mehr Kundschaft',
    'Neukunden',
    'Freie Termine',
    'Mehr Aufträge',
    'Lokaler Spot',
'Besonderheit zeigen',
  ].map((idea) => (
    <button
      key={idea}
      type="button"
      onClick={() => setDealIdea(idea)}
      className="rounded-full border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100"
    >
      {idea}
    </button>
  ))}
</div>
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
                    <p className="text-xs text-gray-600 mt-1">Upload speichert das Premium-Video.</p>
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

        <div className="border p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Promo Details</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Promo Titel *</label>
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
              <label className="block text-sm font-medium mb-1">Beschreibung</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border rounded min-h-[120px]"
              />
            </div>
          </div>
        </div>

        <div className="border p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Business</h2>
          <p className="text-sm text-gray-600">{deal.business.name}</p>
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
          {loading ? 'Speichert...' : 'Promotion speichern'}
        </button>
      </form>
    </div>
  )
}