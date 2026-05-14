// filepath: app/admin/businesses/[id]/edit/EditBusinessForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { categories } from '@/lib/categories'

interface CustomLinkInput {
  label: string
  url: string
}

interface BusinessData {
  id: string
  name: string
  slug: string
  description: string | null
  phone: string | null
  website: string | null
  category: string | null
  subCategory: string | null
  logoUrl: string | null
  address: string | null
  postalCode: string | null
  googleMapsUrl: string | null
  googleReviewUrl: string | null
  googlePlaceId: string | null
  latitude: number | null
  longitude: number | null
  googleRating: number | null
  googleReviews: number | null
  googleCity: string | null
  instagram: string | null
  linkedin: string | null
  tripadvisor: string | null
  whatsapp: string | null
  email: string | null
  tiktok: string | null
  facebook: string | null
  customLinks: string | null
}

export default function EditBusinessForm({ business }: { business: BusinessData }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [logoPreview, setLogoPreview] = useState(business.logoUrl || '')
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

  // Parse custom links from JSON
  const parseCustomLinks = () => {
    if (!business.customLinks) return [{}, {}, {}]
    try {
      const links = JSON.parse(business.customLinks) as CustomLinkInput[]
      const result = [{}, {}, {}]
      links.forEach((link, i) => {
        if (i < 3) {
          result[i] = link
        }
      })
      return result
    } catch {
      return [{}, {}, {}]
    }
  }

  const [formData, setFormData] = useState({
    // Basic
    name: business.name,
    slug: business.slug,
    logoUrl: business.logoUrl || '',
    // Category
    category: business.category || '',
    subCategory: business.subCategory || '',
    // Location
    address: business.address || '',
    postalCode: business.postalCode || '',
    googleMapsUrl: business.googleMapsUrl || '',
    googleReviewUrl: business.googleReviewUrl || '',

    googlePlaceId: business.googlePlaceId || '',
    latitude: business.latitude ?? '',
    longitude: business.longitude ?? '',
    googleRating: business.googleRating ?? '',
    googleReviews: business.googleReviews ?? '',
    googleCity: business.googleCity || '',

// Social/Contact
    website: business.website || '',
    instagram: business.instagram || '',
    linkedin: business.linkedin || '',
    tripadvisor: business.tripadvisor || '',
    whatsapp: business.whatsapp || '',
    phone: business.phone || '',
    email: business.email || '',
    tiktok: business.tiktok || '',
    facebook: business.facebook || '',
    // Custom links
    customLink1Label: '',
    customLink1Url: '',
    customLink2Label: '',
    customLink2Url: '',
    customLink3Label: '',
    customLink3Url: '',
    // Description
    description: business.description || '',
  })

  // Initialize custom links after mount
  useEffect(() => {
    const links = parseCustomLinks()
    setFormData(prev => ({
      ...prev,
      customLink1Label: (links[0] as CustomLinkInput)?.label || '',
      customLink1Url: (links[0] as CustomLinkInput)?.url || '',
      customLink2Label: (links[1] as CustomLinkInput)?.label || '',
      customLink2Url: (links[1] as CustomLinkInput)?.url || '',
      customLink3Label: (links[2] as CustomLinkInput)?.label || '',
      customLink3Url: (links[2] as CustomLinkInput)?.url || '',
    }))
  }, [])

  const selectedCategory = categories.find(c => c.name === formData.category)
  const subCategories = selectedCategory?.subCategories || []

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }
function extractGooglePlaceId(url: string) {
  const match = url.match(/[?&]placeid=([^&]+)/)
  return match ? decodeURIComponent(match[1]) : ''
}

  function handleNameChange(name: string) {
    setFormData({
      ...formData,
      name,
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

    const res = await fetch(`/api/businesses/${business.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      setSaved(true)
    }

    setLoading(false)
  }

  const origin =
  typeof window !== 'undefined'
    ? window.location.origin
    : ''

const profileUrl = `${origin}/profile/${formData.slug}`
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    profileUrl,
  )}`

  const handleCopyProfileLink = () => {
    navigator.clipboard.writeText(profileUrl)
    alert('Copied!')
  }

  const handleDownloadQr = () => {
    const link = document.createElement('a')
    link.href = qrCodeUrl
    link.download = `${formData.slug}-qr.png`
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  const handleCopyQrLink = () => {
    navigator.clipboard.writeText(profileUrl)
    alert('Copied!')
  }

  const handleCreateDeal = () => {
    router.push(`/admin/deals/new?businessId=${business.id}`)
  }

  if (saved) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Business Updated!</h1>
        <button
          onClick={() => router.push('/admin/businesses')}
          className="w-full bg-green-600 text-white py-3 px-4 rounded hover:bg-green-700"
        >
          Back to Businesses
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Edit Business</h1>
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
    onChange={(e) => {
      const value = e.target.value
      const placeId = extractGooglePlaceId(value)

      setFormData({
        ...formData,
        googleReviewUrl: value,
        googlePlaceId: placeId || formData.googlePlaceId,
      })
    }}
    className="w-full p-2 border rounded"
  />

  <p className="text-xs text-gray-500 mt-1">
    <a
      href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder"
      target="_blank"
      rel="noopener noreferrer"
      className="underline"
    >
      Find Place ID
    </a>
  </p>
              <div className="grid grid-cols-2 gap-4 mt-4">
  <div>
    <label className="block text-sm font-medium mb-1">Google Place ID</label>
    <input
      type="text"
      value={formData.googlePlaceId}
      onChange={(e) => setFormData({ ...formData, googlePlaceId: e.target.value })}
      className="w-full p-2 border rounded"
      placeholder="ChIJ..."
    />
  </div>

  <div>
    <label className="block text-sm font-medium mb-1">Google City</label>
    <input
      type="text"
      value={formData.googleCity}
      onChange={(e) => setFormData({ ...formData, googleCity: e.target.value })}
      className="w-full p-2 border rounded"
    />
  </div>

  <div>
    <label className="block text-sm font-medium mb-1">Latitude</label>
    <input
      type="number"
      step="any"
      value={formData.latitude}
      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
      className="w-full p-2 border rounded"
    />
  </div>

  <div>
    <label className="block text-sm font-medium mb-1">Longitude</label>
    <input
      type="number"
      step="any"
      value={formData.longitude}
      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
      className="w-full p-2 border rounded"
    />
  </div>

  <div>
    <label className="block text-sm font-medium mb-1">Google Rating</label>
    <input
      type="number"
      step="0.1"
      value={formData.googleRating}
      onChange={(e) => setFormData({ ...formData, googleRating: e.target.value })}
      className="w-full p-2 border rounded"
    />
  </div>

  <div>
    <label className="block text-sm font-medium mb-1">Google Reviews</label>
    <input
      type="number"
      value={formData.googleReviews}
      onChange={(e) => setFormData({ ...formData, googleReviews: e.target.value })}
      className="w-full p-2 border rounded"
    />
  </div>
</div>
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
          className="w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Update Business'}
         </button>
         </form>
<div className="border border-red-300 rounded-lg p-4 bg-red-50 mt-8">
  <h2 className="text-lg font-semibold text-red-700 mb-2">
    Gefahrenzone
  </h2>

  <p className="text-sm text-red-600 mb-4">
    Dieses Business inklusive OP, Deals und Statistiken wird gelöscht.
  </p>

  <button
    type="button"
    onClick={async () => {
      const confirmed = confirm(
        'Business wirklich löschen? Dadurch werden OP, Deals und Statistiken gelöscht.'
      )

      if (!confirmed) return

      const secondConfirm = confirm(
        'Letzte Bestätigung: Dieser Vorgang kann nicht rückgängig gemacht werden.'
      )

      if (!secondConfirm) return

      const res = await fetch(`/api/businesses/${business.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        router.push('/admin/businesses')
      } else {
        alert('Business konnte nicht gelöscht werden.')
      }
    }}
    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
  >
    Business löschen
  </button>
</div>
       <div className="mt-8 border p-4 rounded">
        <h2 className="text-lg font-bold mb-4">QR &amp; Links</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="border p-4 rounded">
            <h3 className="text-sm font-semibold mb-3">QR Code</h3>
            <img
              src={qrCodeUrl}
              alt="Business QR Code"
              className="w-full h-auto rounded mb-4"
            />
            <p className="text-xs text-red-600 mb-3">Achtung: Wenn du den Slug änderst, musst du den QR-Code neu erstellen.</p>
            <button
              type="button"
              onClick={handleDownloadQr}
              className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Download QR
            </button>
          </div>

          <div className="border p-4 rounded">
            <h3 className="text-sm font-semibold mb-3">QR Link</h3>
            <div className="break-words bg-gray-100 p-3 rounded text-sm mb-4">{profileUrl}</div>
            <button
              type="button"
              onClick={handleCopyQrLink}
              className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              Copy QR Link
            </button>
          </div>

          <div className="border p-4 rounded">
            <h3 className="text-sm font-semibold mb-3">Scandeal Link</h3>
            <div className="break-words bg-gray-100 p-3 rounded text-sm mb-4">{profileUrl}</div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleCopyProfileLink}
                className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
              >
                Copy Link
              </button>
              <a
                href={profileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex justify-center w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Open Profile
              </a>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCreateDeal}
          className="mt-6 w-full bg-indigo-600 text-white py-3 px-4 rounded hover:bg-indigo-700 text-sm"
        >
          + Deal für dieses Business erstellen
        </button>
      </div>
    </div>
  )
}