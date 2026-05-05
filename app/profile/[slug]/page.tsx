import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import DealCardList from '@/components/DealCardList'
import GoogleReviewBox from '@/components/GoogleReviewBox'
import ProfileTracker from '@/components/ProfileTracker'
import TrackedLink from '@/components/TrackedLink'
import LinkSlider from '@/components/LinkSlider'

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

  console.log("Business category:", business?.category)
  console.log("Business subCategory:", business?.subCategory)

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

  // Links for horizontal scroll
  const links = [
    { label: "Website", icon: "/slideicons/slide_webseite.jpeg", href: websiteUrl },
    { label: "Route", icon: "/slideicons/slide_googlemaps.jpeg", href: googleMapsUrl },
    { label: "WhatsApp", icon: "/slideicons/slide_whatsapp.jpeg", href: whatsappUrl },
    { label: "Call", icon: "/slideicons/slide_mobil.jpeg", href: phoneUrl },
    { label: "Instagram", icon: "/slideicons/slide_insta.jpeg", href: instagramUrl },
    { label: "Facebook", icon: "/slideicons/slide_fb.jpeg", href: facebookUrl },
    { label: "LinkedIn", icon: "/slideicons/slide_linkedin.jpeg", href: linkedinUrl },
    { label: "TripAdvisor", icon: "/slideicons/slide_tripadvisor.jpeg", href: tripadvisorUrl },
    { label: "TikTok", icon: "/slideicons/slide_tiktok.jpeg", href: tiktokUrl },
    { label: "Email", icon: "/slideicons/slide_email.jpeg", href: emailUrl },
  ].filter(
    (link): link is { label: string; icon: string; href: string } =>
      Boolean(link.href)
  )

  return (
    <ProfileTracker businessId={business.id}>
      <div className="bg-black text-white min-h-screen">
        {/* TOP BAR */}
        <div className="fixed top-0 left-0 w-full h-10 bg-black text-white flex items-center px-4 z-[9999]">
          <img src="/icons/scandeal.logo.svg" alt="Scandeal" style={{ height: '24px' }} />
        </div>

      {/* BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 w-full h-12 bg-black text-white flex items-center justify-center z-[9999]">
        <span className="text-sm">Scandeal · Hilfe</span>
      </div>

      <div style={{ paddingTop: '56px', paddingBottom: '96px' }}>
        {/* OP / BUSINESS SECTION */}
        <div style={{ width: '100%' }}>
          <div className="max-w-[760px] mx-auto px-4 pt-6 pb-0">
            <div style={{ padding: '0.5rem 0.75rem' }}>
            <div className="flex items-start gap-3 px-3 py-2">
              <img
                src={business.logoUrl || '/icons/default.svg'}
                alt={business.name}
                className="w-16 h-16 rounded-xl object-cover"
              />

              <div className="flex flex-col">
                <h1 className="text-lg font-semibold text-white">{business.name}</h1>
                {business.category && (
                  <span className="text-sm text-gray-300">
                    {business.subCategory
                      ? `${business.category} · ${business.subCategory}`
                      : business.category}
                  </span>
                )}
                <span className="text-sm text-gray-200">⭐ 4.8 (128)</span>
                <span className="text-sm text-gray-300">📍 Zürich</span>
                <span className="text-sm text-gray-300">🟢 Geöffnet · schliesst um 22:00</span>
              </div>
            </div>

            <div style={{ marginTop: '0.375rem' }}>
              <LinkSlider links={links} businessId={business.id} />
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <GoogleReviewBox
                businessName={business.name}
                googleReviewUrl={googleReviewUrl}
                whatsappUrl={whatsappUrl}
                emailUrl={emailUrl}
                businessId={business.id}
              />
            </div>

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
                      style={{ display: 'block', textAlign: 'center', padding: '0.75rem', background: '#111', borderRadius: '12px', border: '1px solid #222', marginBottom: '0.5rem', textDecoration: 'none', color: '#f8fafc', fontSize: '0.95rem' }}
                    >
                      {link.label}
                    </TrackedLink>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DEALS SECTION */}
      <div style={{ width: '100%', color: '#fff' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', paddingTop: '8px', paddingBottom: '16px', paddingLeft: '16px', paddingRight: '16px' }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            gap: '16px',
          }}>
              <DealCardList ourDeal={ourDeal} selectedDeals={selectedDeals} />
          </div>
        </div>
      </div>
    </div>
  </div>
    </ProfileTracker>
  )
}