// filepath: components/admin/EditBusinessForm.tsx
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

            <div>
              <label className="block text-sm font-medium mb-1">Logo URL (Upload later)</label>
              <input
                type="text"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                className="w-full p-2 border rounded"
              />
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
          {loading ? 'Saving...' : 'Update Business'}
        </button>
      </form>
    </div>
  )
}