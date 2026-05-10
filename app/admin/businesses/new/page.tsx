'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { categories } from '@/lib/categories'

interface CustomLinkInput {
  label: string
  url: string
}

export default function NewBusinessPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [savedBusiness, setSavedBusiness] = useState<{ id: string; slug: string } | null>(null)

  const [formData, setFormData] = useState({
    // Basic
    name: '',
    slug: '',
    logoUrl: '',
    // Category
    category: '',
    subCategory: '',
    // Location
    address: '',
    postalCode: '',
    googleMapsUrl: '',
    googleReviewUrl: 'https://search.google.com/local/writereview?placeid=',
    // Social/Contact
    website: '',
    instagram: '',
    linkedin: '',
    tripadvisor: '',
    whatsapp: 'https://wa.me/',
    phone: 'tel:+41',
    email: '',
    tiktok: '',
    facebook: '',
    // Custom links
    customLink1Label: '',
    customLink1Url: '',
    customLink2Label: '',
    customLink2Url: '',
    customLink3Label: '',
    customLink3Url: '',
    // Description
    description: '',
  })

  const selectedCategory = categories.find(c => c.name === formData.category)
  const subCategories = selectedCategory?.subCategories || []
  const [logoPreview, setLogoPreview] = useState('')
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const handleLogoUpload = async (file: File | null) => {
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Nur jpg, jpeg, png oder webp erlaubt.')
      return
    }

    const previewUrl = URL.createObjectURL(file)
    setLogoPreview(previewUrl)
    setUploadingLogo(true)

    try {
      const data = new FormData()
      data.append('logo', file)

      const res = await fetch('/api/upload-logo', {
        method: 'POST',
        body: data,
      })

      if (!res.ok) {
        throw new Error('Upload fehlgeschlagen')
      }

      const result = await res.json()
      if (result?.path) {
        setFormData((prev) => ({ ...prev, logoUrl: result.path }))
        setLogoPreview(result.path)
      }
    } catch (error) {
      console.error(error)
      alert('Logo-Upload fehlgeschlagen. Bitte erneut versuchen.')
    } finally {
      setUploadingLogo(false)
    }
  }

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  function handleNameChange(name: string) {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    })
  }

  function buildCustomLinks(): string {
    const links: CustomLinkInput[] = []
    if (formData.customLink1Label && formData.customLink1Url) {
      links.push({ label: formData.customLink1Label, url: formData.customLink1Url })
    }
    if (formData.customLink2Label && formData.customLink2Url) {
      links.push({ label: formData.customLink2Label, url: formData.customLink2Url })
    }
    if (formData.customLink3Label && formData.customLink3Url) {
      links.push({ label: formData.customLink3Label, url: formData.customLink3Url })
    }
    return links.length > 0 ? JSON.stringify(links) : ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const payload = {
      ...formData,
      customLinks: buildCustomLinks(),
    }

    const res = await fetch('/api/businesses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      const business = await res.json()
      setSavedBusiness(business)
    }

    setLoading(false)
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const profileUrl = savedBusiness ? `${typeof window !== 'undefined' ? window.location.origin : ''}/profile/${savedBusiness.slug}` : ''
  const qrCodeUrl = savedBusiness ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(profileUrl)}` : ''

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Add New Business</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Section */}
        <div className="border p-4 rounded">
          <h2 className="text-lg font-bold mb-4">Basic</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Logo hochladen</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleLogoUpload(e.target.files?.[0] || null)}
                className="w-full p-2 border rounded"
              />
              {uploadingLogo && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Logo URL</label>
              <input
                type="text"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                className="w-full p-2 border rounded"
              />
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Logo Preview"
                  className="mt-3 h-24 w-24 object-contain rounded border"
                />
              ) : null}
            </div>
          </div>
        </div>

        {/* Category Section */}
        <div className="border p-4 rounded">
          <h2 className="text-lg font-bold mb-4">Category</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value, subCategory: '' })}
                className="w-full p-2 border rounded"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Sub Category (main) *</label>
              <select
                required
                value={formData.subCategory}
                onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                className="w-full p-2 border rounded"
                disabled={!formData.category}
              >
                <option value="">Select a sub category</option>
                {subCategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="border p-4 rounded">
          <h2 className="text-lg font-bold mb-4">Location</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Adresse *</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Orpundstrasse 40, 2504 Biel"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Postal Code</label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Google Maps Route Link</label>
                <input
                  type="text"
                  value={formData.googleMapsUrl}
                  onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
                  className="w-full p-2 border rounded"
                />
                <p className="text-xs text-gray-500 mt-1">
                  <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="underline">Google Maps</a>
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Google Review Link</label>
              <input
                type="text"
                value={formData.googleReviewUrl}
                onChange={(e) => setFormData({ ...formData, googleReviewUrl: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <p className="text-xs text-gray-500 mt-1">
                <a href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder" target="_blank" rel="noopener noreferrer" className="underline">Find Place ID</a>
              </p>
            </div>
          </div>
        </div>

        {/* Social/Contact Section */}
        <div className="border p-4 rounded">
          <h2 className="text-lg font-bold mb-4">Social / Contact</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Website</label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <p className="text-xs text-gray-500 mt-1">
                Wrong: 0323417242 | Correct: tel:+41323417242
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="text"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">WhatsApp</label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <p className="text-xs text-gray-500 mt-1">
                Example: https://wa.me/+41791034747
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Instagram</label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Facebook</label>
              <input
                type="text"
                value={formData.facebook}
                onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">LinkedIn</label>
              <input
                type="text"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">TripAdvisor</label>
              <input
                type="text"
                value={formData.tripadvisor}
                onChange={(e) => setFormData({ ...formData, tripadvisor: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">TikTok</label>
              <input
                type="text"
                value={formData.tiktok}
                onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>

        {/* Custom Links Section */}
        <div className="border p-4 rounded">
          <h2 className="text-lg font-bold mb-4">Custom Links</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Custom Link 1 Label</label>
                <input
                  type="text"
                  value={formData.customLink1Label}
                  onChange={(e) => setFormData({ ...formData, customLink1Label: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="e.g. Menükarte"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Custom Link 1 URL</label>
                <input
                  type="text"
                  value={formData.customLink1Url}
                  onChange={(e) => setFormData({ ...formData, customLink1Url: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Custom Link 2 Label</label>
                <input
                  type="text"
                  value={formData.customLink2Label}
                  onChange={(e) => setFormData({ ...formData, customLink2Label: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="e.g. Reservation"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Custom Link 2 URL</label>
                <input
                  type="text"
                  value={formData.customLink2Url}
                  onChange={(e) => setFormData({ ...formData, customLink2Url: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Custom Link 3 Label</label>
                <input
                  type="text"
                  value={formData.customLink3Label}
                  onChange={(e) => setFormData({ ...formData, customLink3Label: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="e.g. Online Shop"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Custom Link 3 URL</label>
                <input
                  type="text"
                  value={formData.customLink3Url}
                  onChange={(e) => setFormData({ ...formData, customLink3Url: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="border p-4 rounded">
          <h2 className="text-lg font-bold mb-4">Description</h2>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded"
              rows={4}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 disabled:opacity50"
        >
          {loading ? 'Saving...' : 'Save Business'}
        </button>
      </form>

      {savedBusiness && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-6">Business Created!</h2>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="border p-4 rounded">
              <h3 className="text-lg font-semibold mb-3">QR Code</h3>
              <img src={qrCodeUrl} alt="Business QR Code" className="w-full h-auto rounded-md mb-4" />
              <p className="text-xs text-red-600 mb-3">Achtung: Wenn du den Slug änderst, musst du den QR-Code neu erstellen.</p>
              <button
                type="button"
                onClick={() => {
                  const link = document.createElement('a')
                  link.href = qrCodeUrl
                  link.download = `scandeal-qr-${savedBusiness.slug}.png`
                  link.click()
                }}
                className="block w-full text-center bg-gray-800 text-white py-2 px-3 rounded hover:bg-gray-700"
              >
                Download QR
              </button>
            </div>

            <div className="border p-4 rounded">
              <h3 className="text-lg font-semibold mb-3">QR Link</h3>
              <div className="break-words text-sm text-gray-800 mb-4">{profileUrl}</div>
              <button
                type="button"
                onClick={() => copyToClipboard(profileUrl)}
                className="w-full bg-gray-600 text-white py-2 px-3 rounded hover:bg-gray-700"
              >
                Copy QR Link
              </button>
            </div>

            <div className="border p-4 rounded">
              <h3 className="text-lg font-semibold mb-3">Scandeal Link</h3>
              <div className="break-words text-sm text-gray-800 mb-4">{profileUrl}</div>
              <button
                type="button"
                onClick={() => copyToClipboard(profileUrl)}
                className="w-full bg-gray-600 text-white py-2 px-3 rounded hover:bg-gray-700 mb-3"
              >
                Copy Link
              </button>
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center bg-green-600 text-white py-2 px-3 rounded hover:bg-green-700"
              >
                Open Profile
              </a>
            </div>
          </div>

          <div className="mt-8">
            <button
              type="button"
              onClick={() => router.push(`/admin/deals/new?businessId=${savedBusiness.id}`)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700"
            >
              + Deal für dieses Business erstellen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}