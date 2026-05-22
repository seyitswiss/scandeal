// filepath: app/admin/businesses/[id]/edit/EditBusinessForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { categories } from '@/lib/categories'

interface CustomLinkInput {
  label: string
  url: string
}
interface RelatedBusinessInput {
  businessId: string
  title: string
  subtitle: string
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
subCategories?: string | null
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

googleOpeningNow: boolean | null
googleOpeningHours: string | null
googleOpeningText: string | null
instagram: string | null
  linkedin: string | null
  tripadvisor: string | null
  whatsapp: string | null
  email: string | null
  tiktok: string | null
youtube: string | null
facebook: string | null
menuLink: string | null
bookingLink: string | null
shopLink: string | null
uberEatsLink: string | null
justEatLink: string | null
directOrderLink: string | null
priorityLinks: string | null
  customLinks: string | null
  relatedBusinesses?: string | null
}
interface BusinessDeal {
  id: string
  title: string
  isActive: boolean
  isPremium: boolean
  createdAt: Date
}

export default function EditBusinessForm({
  business,
  deals,
}: {
  business: BusinessData
  deals: BusinessDeal[]
}) {  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [logoPreview, setLogoPreview] = useState(business.logoUrl || '')
  const [uploadingLogo, setUploadingLogo] = useState(false)
const [businessSearch, setBusinessSearch] = useState('')
const [businessResults, setBusinessResults] = useState<any[]>([])
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
subCategories: business.subCategories
  ? JSON.parse(business.subCategories)
  : [],
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
    googleOpeningNow: business.googleOpeningNow ?? null,
googleOpeningHours: business.googleOpeningHours || '',
googleOpeningText: business.googleOpeningText || '',

// Social/Contact
    website: business.website || '',
    instagram: business.instagram || '',
    linkedin: business.linkedin || '',
    tripadvisor: business.tripadvisor || '',
    whatsapp: business.whatsapp || '',
    phone: business.phone || '',
    email: business.email || '',
    tiktok: business.tiktok || '',
youtube: business.youtube || '',
facebook: business.facebook || '',
menuLink: business.menuLink || '',
bookingLink: business.bookingLink || '',
shopLink: business.shopLink || '',
uberEatsLink: business.uberEatsLink || '',
justEatLink: business.justEatLink || '',
directOrderLink: business.directOrderLink || '',
priorityLinks: business.priorityLinks
  ? JSON.parse(business.priorityLinks)
  : [] as string[],
    // Custom links
    customLink1Label: '',
    customLink1Url: '',
    customLink2Label: '',
    customLink2Url: '',
    customLink3Label: '',
    customLink3Url: '',

    // Description
    description: business.description || '',

    // Related Businesses
    relatedBusinesses: business.relatedBusinesses
      ? JSON.parse(business.relatedBusinesses)
      : [],
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
  useEffect(() => {
  const fetchBusinesses = async () => {
    if (businessSearch.trim().length < 2) {
      setBusinessResults([])
      return
    }

    try {
      const res = await fetch(
        `/api/businesses/search?q=${encodeURIComponent(businessSearch)}`
      )

      const data = await res.json()
      setBusinessResults(data)
    } catch (error) {
      console.error(error)
    }
  }

  const timeout = setTimeout(fetchBusinesses, 250)

  return () => clearTimeout(timeout)
}, [businessSearch])
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
  function buildRelatedBusinesses(): string {
  return formData.relatedBusinesses.length > 0
    ? JSON.stringify(formData.relatedBusinesses)
    : ''
}

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

const payload = {
  ...formData,
  subCategories: JSON.stringify(formData.subCategories),
  customLinks: buildCustomLinks(),
  relatedBusinesses: buildRelatedBusinesses(),
  priorityLinks: JSON.stringify(formData.priorityLinks),
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
async function loadGooglePlaceData(placeId: string) {
  if (!placeId) return

  try {
    const res = await fetch('/api/google-place', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ placeId }),
    })

    if (!res.ok) {
      throw new Error('Google data failed')
    }

    const data = await res.json()

    setFormData((prev) => ({
      ...prev,
      googleRating: data.rating ?? prev.googleRating,
      googleReviews: data.reviews ?? prev.googleReviews,
      latitude: data.latitude ?? prev.latitude,
      longitude: data.longitude ?? prev.longitude,
      address: data.address || prev.address,
      googleCity: data.city || prev.googleCity,
      googleOpeningNow:
  data.openNow !== null
    ? data.openNow
    : prev.googleOpeningNow,

googleOpeningHours:
  data.weekdayDescriptions?.join(' | ') ||
  prev.googleOpeningHours,

googleOpeningText:
  data.openingText ||
  prev.googleOpeningText,
    }))
  } catch (error) {
    console.error(error)
    alert('Google Daten konnten nicht geladen werden.')
  }
}
  const handleCreateDeal = () => {
    router.push(`/admin/deals/new?businessId=${business.id}`)
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
        onChange={(e) =>
          setFormData({
            ...formData,
            category: e.target.value,
            subCategory: '',
            subCategories: [],
          })
        }
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
      <label className="block text-sm font-medium mb-1">
        Sub Category (main) *
      </label>

      <select
        required
        value={formData.subCategory}
        onChange={(e) =>
          setFormData({
            ...formData,
            subCategory: e.target.value,
          })
        }
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

    <div>
      <label className="block text-sm font-medium mb-2">
        Additional Sub Categories
      </label>

      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto border rounded p-3">
        {subCategories
  .filter((sub) => sub !== formData.subCategory)
  .map((sub) => (
          <label
            key={sub}
            className="flex items-center gap-2 text-sm"
          >
            <input
              type="checkbox"
              checked={formData.subCategories.includes(sub)}
              onChange={(e) => {
                if (e.target.checked) {
                  setFormData({
                    ...formData,
                    subCategories: [...formData.subCategories, sub],
                  })
                } else {
                  setFormData({
                    ...formData,
                    subCategories: formData.subCategories.filter(
                      (item: string) => item !== sub
                    ),
                  })
                }
              }}
            />

            {sub}
          </label>
        ))}
      </div>
    </div>
  </div>
</div>
{/* Related Businesses */}
<div className="border p-4 rounded mb-6">
  <h2 className="text-lg font-bold mb-4">
    Weitere Standorte & Partner
  </h2>
<div className="mb-4">
  <input
    type="text"
    placeholder="Business suchen..."
    value={businessSearch}
    onChange={(e) => setBusinessSearch(e.target.value)}
    className="w-full p-2 border rounded"
  />

  {businessResults.length > 0 && (
    <div className="mt-2 border rounded bg-white max-h-64 overflow-y-auto">
      {businessResults.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => {
            setFormData({
              ...formData,
              relatedBusinesses: [
                ...formData.relatedBusinesses,
                {
                  businessId: item.id,
                  title: item.name,
                  subtitle: item.googleCity || '',
                },
              ],
            })

            setBusinessSearch('')
            setBusinessResults([])
          }}
          className="w-full text-left px-3 py-2 border-b hover:bg-gray-100"
        >
          <div className="font-medium text-black">
            {item.name}
          </div>

          <div className="text-xs text-gray-500">
            {item.googleCity}
          </div>
        </button>
      ))}
    </div>
  )}
</div>
  <div className="space-y-3">
    {formData.relatedBusinesses.map((item: RelatedBusinessInput, index: number) => (
      <div
        key={index}
        className="grid grid-cols-4 gap-2"
      >
        <input
          type="text"
          placeholder="Business ID oder Slug"
          value={item.businessId}
          onChange={(e) => {
            const updated = [...formData.relatedBusinesses]
            updated[index].businessId = e.target.value

            setFormData({
              ...formData,
              relatedBusinesses: updated,
            })
          }}
          className="w-full p-2 border rounded"
        />

        <input
          type="text"
          placeholder="Titel"
          value={item.title}
          onChange={(e) => {
            const updated = [...formData.relatedBusinesses]
            updated[index].title = e.target.value

            setFormData({
              ...formData,
              relatedBusinesses: updated,
            })
          }}
          className="w-full p-2 border rounded"
        />

        <input
          type="text"
          placeholder="Untertitel"
          value={item.subtitle}
          onChange={(e) => {
            const updated = [...formData.relatedBusinesses]
            updated[index].subtitle = e.target.value

            setFormData({
              ...formData,
              relatedBusinesses: updated,
            })
          }}
          className="w-full p-2 border rounded"
          />
          <button
  type="button"
  onClick={() => {
    setFormData({
      ...formData,
      relatedBusinesses:
        formData.relatedBusinesses.filter(
          (_: RelatedBusinessInput, i: number) => i !== index
        ),
    })
  }}
  className="px-3 py-2 rounded border text-red-500"
>
  Entfernen
</button>
      </div>
    ))}

    <button
      type="button"
      onClick={() => {
        setFormData({
          ...formData,
          relatedBusinesses: [
            ...formData.relatedBusinesses,
            {
              businessId: '',
              title: '',
              subtitle: '',
            },
          ],
        })
      }}
      className="px-4 py-2 rounded bg-black text-white border"
    >
      + Standort hinzufügen
    </button>
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
    <button
  type="button"
  onClick={() => loadGooglePlaceData(formData.googlePlaceId)}
  className="mt-2 w-full bg-green-600 text-white py-2 px-3 rounded hover:bg-green-700 text-sm"
>
  Google Daten laden
</button>
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

{/* Description Section */}
<div className="border p-4 rounded">
  <div className="mb-4 flex items-center gap-2">
    <h2 className="text-lg font-bold">Description</h2>

    <button
      type="button"
      onClick={async () => {
        try {
          const response = await fetch('/api/business-description', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              businessName: formData.name,
              category: formData.category,
              subCategory: formData.subCategory,
              addSubCategories: formData.subCategories,
            }),
          })

          const data = await response.json()

          setFormData({
            ...formData,
            description: data.text,
          })
        } catch (error) {
          console.error(error)
        }
      }}
      className="rounded-lg border border-gray-300 px-3 py-1 text-sm"
    >
      KI ✨
    </button>
  </div>

  <textarea
    value={formData.description}
    onChange={(e) =>
      setFormData({ ...formData, description: e.target.value })
    }
    rows={1}
    maxLength={45}
    placeholder="z.B. Genuss mit Biss."
    className="w-full rounded-lg border border-gray-300 px-3 py-2"
  />

  <p className="mt-1 text-xs text-gray-500">
    Max. 6 Wörter, kurz und modern.
  </p>
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
            <div>
  <label className="block text-sm font-medium mb-1">YouTube</label>

  <input
    type="text"
    value={formData.youtube}
    onChange={(e) =>
      setFormData({ ...formData, youtube: e.target.value })
    }
    className="w-full p-2 border rounded"
  />
</div>
          </div>
          <div className="col-span-2 border-t pt-4">
  <h3 className="font-semibold mb-3">Slider Priorität</h3>

  {[0, 1, 2, 3].map((index) => (
    <div key={index} className="mb-3">
      <label className="block text-sm font-medium mb-1">
        Priorität {index + 1}
      </label>

      <select
        value={formData.priorityLinks[index] || ''}
        onChange={(e) => {
          const next = [...formData.priorityLinks]
          next[index] = e.target.value

          setFormData({
            ...formData,
            priorityLinks: next,
          })
        }}
        className="w-full p-2 border rounded"
      >
        <option value="">Keine Auswahl</option>
        <option value="menu">Menü</option>
        <option value="booking">Termin buchen</option>
        <option value="shop">Shop</option>
        <option value="directOrder">Direkt bestellen</option>
        <option value="uberEats">Uber Eats</option>
        <option value="justEat">Just Eat</option>
        <option value="route">Route</option>
        <option value="call">Call</option>
        <option value="website">Website</option>
        <option value="whatsapp">WhatsApp</option>
        <option value="instagram">Instagram</option>
        <option value="facebook">Facebook</option>
        <option value="tiktok">TikTok</option>
        <option value="youtube">YouTube</option>
        <option value="email">Email</option>
      </select>
    </div>
  ))}
</div>
         </div>
{/* Business Actions */}
<div className="border p-4 rounded">
  <h2 className="text-lg font-bold mb-4">Business Actions</h2>

  <div className="grid grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium mb-1">
        Menükarte
      </label>
<input
  type="file"
  accept="application/pdf"
  onChange={async (e) => {
    const file = e.target.files?.[0]

    if (!file) return

    const data = new FormData()
    data.append('file', file)

    const res = await fetch('/api/upload-file', {
      method: 'POST',
      body: data,
    })

    if (!res.ok) {
      alert('PDF Upload fehlgeschlagen')
      return
    }

    const result = await res.json()

    setFormData({
      ...formData,
      menuLink: result.path,
    })
  }}
  className="w-full p-2 border rounded mb-2"
/>
      <input
        type="text"
        value={formData.menuLink}
        onChange={(e) =>
          setFormData({ ...formData, menuLink: e.target.value })
        }
        className="w-full p-2 border rounded"
        placeholder="https://..."
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">
        Termin buchen
      </label>

      <input
        type="text"
        value={formData.bookingLink}
        onChange={(e) =>
          setFormData({ ...formData, bookingLink: e.target.value })
        }
        className="w-full p-2 border rounded"
        placeholder="https://..."
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">
        Shop
      </label>

      <input
        type="text"
        value={formData.shopLink}
        onChange={(e) =>
          setFormData({ ...formData, shopLink: e.target.value })
        }
        className="w-full p-2 border rounded"
        placeholder="https://..."
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">
        Direkt bestellen
      </label>

      <input
        type="text"
        value={formData.directOrderLink}
        onChange={(e) =>
          setFormData({
            ...formData,
            directOrderLink: e.target.value,
          })
        }
        className="w-full p-2 border rounded"
        placeholder="https://..."
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">
        Uber Eats
      </label>

      <input
        type="text"
        value={formData.uberEatsLink}
        onChange={(e) =>
          setFormData({
            ...formData,
            uberEatsLink: e.target.value,
          })
        }
        className="w-full p-2 border rounded"
        placeholder="https://..."
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">
        Just Eat
      </label>

      <input
        type="text"
        value={formData.justEatLink}
        onChange={(e) =>
          setFormData({
            ...formData,
            justEatLink: e.target.value,
          })
        }
        className="w-full p-2 border rounded"
        placeholder="https://..."
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
const payload = {
  ...formData,
  subCategories: JSON.stringify(formData.subCategories),
  customLinks: buildCustomLinks(),
  relatedBusinesses: buildRelatedBusinesses(),
  priorityLinks: JSON.stringify(formData.priorityLinks),
}

console.log(formData.relatedBusinesses)
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
{deals.length > 0 && (
  <div className="mt-8 rounded-xl border border-gray-200 bg-white p-4">
    <h2 className="mb-4 text-lg font-semibold">
      Deals dieses Businesses
    </h2>

    <div className="space-y-3">
      {deals.map((deal) => (
        <div
          key={deal.id}
          className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {deal.title}
              </span>

              {deal.isPremium && (
                <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                  PREMIUM
                </span>
              )}

              {!deal.isActive && (
                <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
                  Inaktiv
                </span>
              )}
            </div>
          </div>

          <a
            href={`/admin/deals/${deal.id}/edit`}
            className="rounded-lg bg-black px-3 py-2 text-sm text-white"
          >
            Bearbeiten
          </a>
        </div>
      ))}
    </div>
  </div>
)}
        <button
          type="button"
          onClick={handleCreateDeal}
          className="mt-6 w-full bg-indigo-600 text-white py-3 px-4 rounded hover:bg-indigo-700 text-sm"
        >
          + Neuer Deal
        </button>
      </div>
    </div>
  )
}