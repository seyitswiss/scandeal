'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Business {
  id: string
  name: string
  category: string | null
  subCategory: string | null
}

export default function NewDealPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [businessLoading, setBusinessLoading] = useState(true)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountText: '',
    category: '',
    subCategory: '',
    isPremium: false,
    isActive: true,
    startDate: '',
    endDate: '',
    businessId: '',
  })

  useEffect(() => {
    fetch('/api/businesses')
      .then((res) => res.json())
      .then((data) => {
        setBusinesses(data)
        setBusinessLoading(false)
      })
      .catch(() => setBusinessLoading(false))
  }, [])

  function handleBusinessChange(businessId: string) {
    const business = businesses.find(b => b.id === businessId)
    setFormData({
      ...formData,
      businessId,
      category: business?.category || '',
      subCategory: business?.subCategory || '',
    })
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
    <div>
      <h1>Add New Deal</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
        <div>
          <label>Title *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            style={{ display: 'block', width: '100%', padding: '8px' }}
          />
        </div>

        <div>
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            style={{ display: 'block', width: '100%', padding: '8px' }}
          />
        </div>

        <div>
          <label>Discount Text</label>
          <input
            type="text"
            value={formData.discountText}
            onChange={(e) => setFormData({ ...formData, discountText: e.target.value })}
            style={{ display: 'block', width: '100%', padding: '8px' }}
          />
        </div>

        <div>
          <label>Category</label>
          <p>{formData.category || '-'}</p>
        </div>

        <div>
          <label>Sub Category</label>
          <p>{formData.subCategory || '-'}</p>
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={formData.isPremium}
              onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
            />
            {' '}Premium
          </label>
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
            {' '}Active
          </label>
        </div>

        <div>
          <label>Start Date (optional)</label>
          <input
            type="datetime-local"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            style={{ display: 'block', width: '100%', padding: '8px' }}
          />
        </div>

        <div>
          <label>End Date (optional)</label>
          <input
            type="datetime-local"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            style={{ display: 'block', width: '100%', padding: '8px' }}
          />
        </div>

        <div>
          <label>Business *</label>
          <select
            required
            disabled={businessLoading}
            value={formData.businessId}
            onChange={(e) => handleBusinessChange(e.target.value)}
            style={{ display: 'block', width: '100%', padding: '8px' }}
          >
            <option value="">{businessLoading ? 'Loading...' : 'Select a business'}</option>
            {businesses.map((business) => (
              <option key={business.id} value={business.id}>
                {business.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={loading} style={{ padding: '10px' }}>
          {loading ? 'Saving...' : 'Save Deal'}
        </button>
      </form>
    </div>
  )
}