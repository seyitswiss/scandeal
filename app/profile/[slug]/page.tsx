import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import DealCardList from '@/components/DealCardList'
import IconRow from '@/components/IconRow'
import GoogleReviewBox from '@/components/GoogleReviewBox'
import ProfileTracker from '@/components/ProfileTracker'
import TrackedLink from '@/components/TrackedLink'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ dealId?: string }>
}

// URL normalization helpers
function normalizeUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const trimmed = url.trim()
  if (!trimmed) return null
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('tel:') ||
    trimmed.startsWith('mailto:')
  ) {
    return trimmed
  }
  return `https://${trimmed}`
}

function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null
  const trimmed = phone.trim()
  if (!trimmed) return null
  if (trimmed.startsWith('tel:')) return trimmed
  if (trimmed.startsWith('+')) return `tel:${trimmed}`
  return trimmed
}

function normalizeEmail(email: string | null | undefined): string | null {
  if (!email) return null
  const trimmed = email.trim()
  if (!trimmed) return null
  if (trimmed.startsWith('mailto:')) return trimmed
  return `mailto:${trimmed}`
}

// Hardcoded complementary mapping: subCategory → other subCategories with scores
const relevanceMapping: Record<string, Record<string, number>> = {
  'Hair Salon': {
    Cosmetic: 5,
    'Nail Salon': 5,
    Spa: 4,
    Restaurant: 3,
    Cafe: 3,
    Fitness: 3,
    Cleaning: 1,
  },
  Fitness: {
    Restaurant: 5,
    Cafe: 4,
    Bakery: 4,
    'Hair Salon': 3,
    Cosmetic: 3,
  },
  Restaurant: {
    Cafe: 5,
    Bakery: 4,
    'Hair Salon': 3,
    Fitness: 3,
    Cleaning: 2,
  },
  Cafe: {
    Restaurant: 5,
    Bakery: 4,
    'Hair Salon': 2,
    Fitness: 2,
  },
  Bakery: {
    Cafe: 4,
    Restaurant: 4,
    Fitness: 3,
  },
  Cosmetic: {
    'Hair Salon': 5,
    'Nail Salon': 5,
    Spa: 4,
    Fitness: 2,
  },
  Cleaning: {
    Transport: 3,
    Consulting: 2,
    Repair: 2,
  },
  Transport: {
    Cleaning: 3,
    Consulting: 2,
    Restaurant: 2,
  },
  Consulting: {
    Transport: 2,
    Cleaning: 2,
    Repair: 2,
  },
}

function getRelevanceScore(businessSubCategory: string, dealSubCategory: string | null): number {
  if (!dealSubCategory) return 1
  const mapping = relevanceMapping[businessSubCategory]
  if (mapping && mapping[dealSubCategory] !== undefined) {
    return mapping[dealSubCategory]
  }
  return 1
}

export default async function ProfilePage({ params, searchParams }: Props) {
  const { slug } = await params
  const { dealId } = await searchParams

  const business = await prisma.business.findUnique({
    where: { slug },
  })

  if (!business) {
    notFound()
  }

  // Load OUR DEAL if dealId provided and belongs to this business
  let ourDeal: Awaited<ReturnType<typeof prisma.deal.findUnique>> | null = null
  if (dealId) {
    const targetDeal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: { business: { select: { name: true, slug: true } } }
    })
    if (targetDeal && targetDeal.businessId === business.id) {
      ourDeal = targetDeal
    }
  }

  // 1. Load all deals with business relation
  const allDeals = await prisma.deal.findMany({
    include: { business: { select: { name: true, slug: true } } }
  })

  // Helper: check if deal is active (not inactive and not expired)
  function isDealActive(deal: any) {
    const now = new Date()
    if (!deal.isActive) return false
    if (deal.startDate && new Date(deal.startDate) > now) return false
    if (deal.endDate && new Date(deal.endDate) < now) return false
    return true
  }

  // 2. HARD FILTERS: exclude same business, same subCategory, and inactive/expired deals
  const filteredDeals = allDeals.filter(
    (deal: typeof allDeals[0]) =>
      deal.businessId !== business.id &&
      deal.subCategory !== business.subCategory &&
      (!ourDeal || deal.id !== ourDeal.id) && // Exclude OUR_DEAL from normal list
      isDealActive(deal) // Only show active deals
  )

  // 3. RELEVANCE SCORING: add score to each deal
  const scoredDeals = filteredDeals.map((deal: typeof allDeals[0]) => ({
    ...deal,
    relevanceScore: getRelevanceScore(business.subCategory || '', deal.subCategory),
  }))

  // 4. Separate premium and normal deals
  const premiumDeals = scoredDeals.filter((d: typeof scoredDeals[0]) => d.isPremium)
  const normalDeals = scoredDeals.filter((d: typeof scoredDeals[0]) => !d.isPremium)

  // Helper: shuffle array randomly
  function shuffle<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // 5. Randomize both arrays
  const randomPremiumDeals = shuffle(premiumDeals)
  const randomNormalDeals = shuffle(normalDeals)

  // 6. DIVERSITY + FINAL SELECTION (random)
  const selectedDeals: typeof scoredDeals = []
  const usedSubCategories = new Set<string>()

  // Take max 1 random premium deal with unique subCategory
  for (const deal of randomPremiumDeals) {
    if (!usedSubCategories.has(deal.subCategory || '')) {
      selectedDeals.push(deal)
      usedSubCategories.add(deal.subCategory || '')
      break // Only take 1 premium
    }
  }

  // Take max 3 random normal deals with unique subCategories
  for (const deal of randomNormalDeals) {
    if (selectedDeals.length >= 4) break
    if (!usedSubCategories.has(deal.subCategory || '')) {
      selectedDeals.push(deal)
      usedSubCategories.add(deal.subCategory || '')
    }
  }

  // 7. FINAL ORDER: premium first, then by relevance
  selectedDeals.sort((a: typeof scoredDeals[0], b: typeof scoredDeals[0]) => {
    if (a.isPremium && !b.isPremium) return -1
    if (!a.isPremium && b.isPremium) return 1
    return b.relevanceScore - a.relevanceScore
  })

  // Parse custom links
  let customLinks: { label: string; url: string }[] = []
  if (business.customLinks) {
    try {
      customLinks = JSON.parse(business.customLinks)
    } catch {
      customLinks = []
    }
  }

  // Normalize URLs and filter empty/default values
  const rawWebsite = business.website?.trim() || ''
  const rawPhone = business.phone?.trim() || ''
  const rawWhatsapp = business.whatsapp?.trim() || ''
  const rawGoogleReviewUrl = business.googleReviewUrl?.trim() || ''

  // Only normalize if not empty/default
  const websiteUrl = rawWebsite && rawWebsite !== 'https://' ? normalizeUrl(rawWebsite) : null
  const phoneUrl = rawPhone && rawPhone !== 'tel:+41' ? normalizePhone(rawPhone) : null
  const whatsappUrl = rawWhatsapp && rawWhatsapp !== 'https://wa.me/' ? normalizeUrl(rawWhatsapp) : null
  const googleReviewUrl = rawGoogleReviewUrl && rawGoogleReviewUrl !== 'https://search.google.com/local/writereview?placeid=' ? normalizeUrl(rawGoogleReviewUrl) : null

  const instagramUrl = normalizeUrl(business.instagram)
  const googleMapsUrl = normalizeUrl(business.googleMapsUrl)
  const emailUrl = normalizeEmail(business.email)
  const facebookUrl = normalizeUrl(business.facebook)
  const linkedinUrl = normalizeUrl(business.linkedin)
  const tripadvisorUrl = normalizeUrl(business.tripadvisor)
  const tiktokUrl = normalizeUrl(business.tiktok)

  // Icons to show: SOCIAL LINKS ONLY (never as buttons)
  const iconItems = [
    { url: instagramUrl, icon: '/icons/instagram.svg', label: 'Instagram' },
    { url: facebookUrl, icon: '/icons/facebook.svg', label: 'Facebook' },
    { url: tiktokUrl, icon: '/icons/tiktok.svg', label: 'TikTok' },
    { url: linkedinUrl, icon: '/icons/linkedin.svg', label: 'LinkedIn' },
    { url: tripadvisorUrl, icon: '/icons/tripadvisor.svg', label: 'TripAdvisor' },
    { url: emailUrl, icon: '/icons/mail.svg', label: 'Email' },
  ].filter(item => item.url !== null)

  return (
    <ProfileTracker businessId={business.id}>
      <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto', padding: '1rem', boxSizing: 'border-box' }}>
      {/* 1. MAIN OP HEADER CARD */}
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          {business.logoUrl && (
            <img
              src={business.logoUrl}
              alt={business.name}
              style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }}
            />
          )}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>{business.name}</h1>
            {business.category && business.subCategory && (
              <p style={{ color: '#666', fontSize: '0.9rem' }}>
                {business.category} • {business.subCategory}
              </p>
            )}
            {business.description && (
              <p style={{ marginTop: '0.5rem', color: '#333', fontSize: '0.95rem' }}>{business.description}</p>
            )}
          </div>
        </div>

        {/* Quick icon row with expand */}
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
          <IconRow icons={iconItems} businessId={business.id} />
        </div>

        {/* Google Review Box */}
        <GoogleReviewBox
          businessName={business.name}
          googleReviewUrl={googleReviewUrl}
          whatsappUrl={whatsappUrl}
          emailUrl={emailUrl}
          businessId={business.id}
        />

        {/* Action buttons for core links ONLY */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '1rem' }}>
          {websiteUrl && (
            <TrackedLink href={websiteUrl} businessId={business.id} source="website" style={{ display: 'block', textAlign: 'center', background: '#34a853', color: 'white', padding: '0.75rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem' }}>
              Website
            </TrackedLink>
          )}
          {googleMapsUrl && (
            <TrackedLink href={googleMapsUrl} businessId={business.id} source="google" style={{ display: 'block', textAlign: 'center', background: '#4285f4', color: 'white', padding: '0.75rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem' }}>
              Route
            </TrackedLink>
          )}
          {whatsappUrl && (
            <TrackedLink href={whatsappUrl} businessId={business.id} source="whatsapp" style={{ display: 'block', textAlign: 'center', background: '#25d366', color: 'white', padding: '0.75rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem' }}>
              WhatsApp
            </TrackedLink>
          )}
          {phoneUrl && (
            <TrackedLink href={phoneUrl} businessId={business.id} source="phone" style={{ display: 'block', textAlign: 'center', background: '#000', color: 'white', padding: '0.75rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem' }}>
              Phone
            </TrackedLink>
          )}
        </div>

        {/* Custom Links */}
        {customLinks.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            {customLinks.map((link, index) => {
              const normalized = normalizeUrl(link.url)
              if (!normalized) return null
              return (
                <TrackedLink
                  key={index}
                  href={normalized}
                  businessId={business.id}
                  source="website"
                  style={{ display: 'block', textAlign: 'center', padding: '0.75rem', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '0.5rem', textDecoration: 'none', color: '#333', fontSize: '0.9rem' }}
                >
                  {link.label}
                </TrackedLink>
              )
            })}
          </div>
        )}
      </div>

      {/* DEAL CARDS CONTAINER - stable wrapper for all DealCards */}
      <div style={{
        width: '100%',
        maxWidth: '640px',
        margin: '0 auto',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: '24px',
      }}>
        <DealCardList ourDeal={ourDeal} selectedDeals={selectedDeals} />
      </div>
    </div>
    </ProfileTracker>
  )
}