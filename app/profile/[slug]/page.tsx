import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import DealCardList from '@/components/DealCardList'
import GoogleReviewBox from '@/components/GoogleReviewBox'
import ProfileTracker from '@/components/ProfileTracker'
import TrackedLink from '@/components/TrackedLink'
import LinkSlider from '@/components/LinkSlider'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{
    dealId?: string
    previewDeal?: string
    redeemDeal?: string
    detailsDeal?: string
    shownDeals?: string
  }>
}

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
  if (mapping && mapping[dealSubCategory] !== undefined) return mapping[dealSubCategory]
  return 1
}

function isDealActive(deal: any) {
  const now = new Date()
  if (!deal.isActive) return false
  if (deal.startDate && new Date(deal.startDate) > now) return false
  if (deal.endDate && new Date(deal.endDate) < now) return false
  return true
}

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array]

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled
}

export default async function ProfilePage({ params, searchParams }: Props) {
  const { slug } = await params
  const { dealId, previewDeal, redeemDeal, detailsDeal, shownDeals } = await searchParams

  const business = await prisma.business.findUnique({
    where: { slug },
  })

  if (!business) notFound()

  let ourDeal: Awaited<ReturnType<typeof prisma.deal.findUnique>> | null = null

  if (dealId || redeemDeal || detailsDeal) {
    const targetDeal = await prisma.deal.findUnique({
      where: { id: detailsDeal || redeemDeal || dealId },
      include: { business: { select: { name: true, slug: true } } },
    })

    if (targetDeal) {
  ourDeal = targetDeal
}
  }

  const allDeals = await prisma.deal.findMany({
    include: { business: { select: { name: true, slug: true } } },
  })

  const filteredDeals = allDeals.filter(
    (deal: (typeof allDeals)[0]) =>
      deal.businessId !== business.id &&
      deal.subCategory !== business.subCategory &&
      (!ourDeal || deal.id !== ourDeal.id) &&
      isDealActive(deal)
  )
  const forcedPreviewDeal = previewDeal
  ? allDeals.find((deal) => deal.id === previewDeal)
  : null
const forcedDetailsDeal = detailsDeal
  ? allDeals.find((deal) => deal.id === detailsDeal)
  : null
  const scoredDeals = filteredDeals.map((deal: (typeof allDeals)[0]) => ({
    ...deal,
    relevanceScore: getRelevanceScore(business.subCategory || '', deal.subCategory),
  }))

  const premiumDeals = scoredDeals.filter((deal) => deal.isPremium)
  const normalDeals = scoredDeals.filter((deal) => !deal.isPremium)

  const hasUrlState = previewDeal || redeemDeal || detailsDeal
  const shownDealIds = shownDeals
    ? shownDeals
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean)
    : []
  const preserveShownDeals = shownDealIds.length > 0
  const randomPremiumDeals = hasUrlState ? premiumDeals : shuffle(premiumDeals)
  const randomNormalDeals = hasUrlState ? normalDeals : shuffle(normalDeals)

  const selectedDeals: typeof scoredDeals = []

  if (preserveShownDeals) {
    const dealById = new Map(scoredDeals.map((deal) => [deal.id, deal]))

    for (const id of shownDealIds) {
      const deal = dealById.get(id)
      if (deal) selectedDeals.push(deal)
    }

    const selectedDealIds = new Set(selectedDeals.map((deal) => deal.id))

    if (
      forcedPreviewDeal &&
      !selectedDealIds.has(forcedPreviewDeal.id)
    ) {
      selectedDeals.push({
        ...forcedPreviewDeal,
        relevanceScore: 999,
      } as (typeof scoredDeals)[0])
    }

    if (
      forcedDetailsDeal &&
      !selectedDealIds.has(forcedDetailsDeal.id)
    ) {
      selectedDeals.push({
        ...forcedDetailsDeal,
        relevanceScore: 998,
      } as (typeof scoredDeals)[0])
    }
  } else {
    const usedSubCategories = new Set<string>()

    for (const deal of randomPremiumDeals) {
      const subCategory = deal.subCategory || ''
      if (!usedSubCategories.has(subCategory)) {
        selectedDeals.push(deal)
        usedSubCategories.add(subCategory)
        break
      }
    }

    for (const deal of randomNormalDeals) {
      if (selectedDeals.length >= 4) break

      const subCategory = deal.subCategory || ''
      if (!usedSubCategories.has(subCategory)) {
        selectedDeals.push(deal)
        usedSubCategories.add(subCategory)
      }
    }

    if (
      forcedPreviewDeal &&
      !selectedDeals.some((deal) => deal.id === forcedPreviewDeal.id)
    ) {
      selectedDeals.push({
        ...forcedPreviewDeal,
        relevanceScore: 999,
      } as (typeof scoredDeals)[0])
    }
    if (
      forcedDetailsDeal &&
      !selectedDeals.some((deal) => deal.id === forcedDetailsDeal.id)
    ) {
      selectedDeals.push({
        ...forcedDetailsDeal,
        relevanceScore: 998,
      } as (typeof scoredDeals)[0])
    }

    selectedDeals.sort((a, b) => {
      if (a.isPremium && !b.isPremium) return -1
      if (!a.isPremium && b.isPremium) return 1
      return b.relevanceScore - a.relevanceScore
    })
  }

  let customLinks: { label: string; url: string }[] = []

  if (business.customLinks) {
    try {
      customLinks = JSON.parse(business.customLinks)
    } catch {
      customLinks = []
    }
  }

  const rawWebsite = business.website?.trim() || ''
  const rawPhone = business.phone?.trim() || ''
  const rawWhatsapp = business.whatsapp?.trim() || ''
  const rawGoogleReviewUrl = business.googleReviewUrl?.trim() || ''

  const websiteUrl = rawWebsite && rawWebsite !== 'https://' ? normalizeUrl(rawWebsite) : null
  const phoneUrl = rawPhone && rawPhone !== 'tel:+41' ? normalizePhone(rawPhone) : null
  const whatsappUrl = rawWhatsapp && rawWhatsapp !== 'https://wa.me/' ? normalizeUrl(rawWhatsapp) : null
  const googleReviewUrl =
    rawGoogleReviewUrl &&
    rawGoogleReviewUrl !== 'https://search.google.com/local/writereview?placeid='
      ? normalizeUrl(rawGoogleReviewUrl)
      : null

  const instagramUrl = normalizeUrl(business.instagram)
  const googleMapsUrl = normalizeUrl(business.googleMapsUrl)
  const emailUrl = normalizeEmail(business.email)
  const facebookUrl = normalizeUrl(business.facebook)
  const linkedinUrl = normalizeUrl(business.linkedin)
  const tripadvisorUrl = normalizeUrl(business.tripadvisor)
  const tiktokUrl = normalizeUrl(business.tiktok)

  const links = [
    { label: 'Website', icon: '/slideicons/slide_webseite.jpeg', href: websiteUrl },
    { label: 'Route', icon: '/slideicons/slide_googlemaps.jpeg', href: googleMapsUrl },
    { label: 'WhatsApp', icon: '/slideicons/slide_whatsapp.jpeg', href: whatsappUrl },
    { label: 'Call', icon: '/slideicons/slide_mobil.jpeg', href: phoneUrl },
    { label: 'Instagram', icon: '/slideicons/slide_insta.jpeg', href: instagramUrl },
    { label: 'Facebook', icon: '/slideicons/slide_fb.jpeg', href: facebookUrl },
    { label: 'LinkedIn', icon: '/slideicons/slide_linkedin.jpeg', href: linkedinUrl },
    { label: 'TripAdvisor', icon: '/slideicons/slide_tripadvisor.jpeg', href: tripadvisorUrl },
    { label: 'TikTok', icon: '/slideicons/slide_tiktok.jpeg', href: tiktokUrl },
    { label: 'Email', icon: '/slideicons/slide_email.jpeg', href: emailUrl },
  ].filter((link): link is { label: string; icon: string; href: string } => Boolean(link.href))

  return (
    <ProfileTracker businessId={business.id}>
      <div className="min-h-screen bg-black text-white">
        {/* TOP BAR */}
        <header className="fixed left-0 top-0 z-[9999] flex h-10 w-full items-center bg-black px-4 text-white">
          <img src="/icons/scandeal.logo.svg" alt="Scandeal" style={{ height: '24px' }} />
        </header>

        {/* BOTTOM BAR */}
        <footer className="fixed bottom-0 left-0 z-[9999] flex h-12 w-full items-center justify-center bg-black text-white">
          <span className="text-sm">Scandeal · Hilfe</span>
        </footer>

        <main style={{ paddingTop: '56px', paddingBottom: '96px' }}>
          {/* OP / BUSINESS SECTION */}
          <section style={{ width: '100%' }}>
            <div className="mx-auto max-w-[640px] px-4 pt-6">
              <div style={{ padding: '0.5rem 0.75rem' }}>
                {/* BUSINESS HEADER */}
                <div className="-ml-1 py-2">
                  <div className="flex items-start gap-3">
                    <img
                      src={business.logoUrl || '/icons/default.svg'}
                      alt={business.name}
                      className="h-24 w-24 shrink-0 rounded-2xl object-cover"
                    />

                    <div className="flex min-w-0 flex-1 flex-col">
                      <h1 className="truncate text-xl font-semibold text-white">{business.name}</h1>

                      {business.description && (
                        <p className="mt-1 line-clamp-2 text-sm leading-snug text-gray-400">
                          {business.description}
                        </p>
                      )}

                      <span className="mt-1 text-sm text-gray-300">⭐ 4.8 (128) · 📍 Zürich</span>

                      <span className="mt-1 text-sm text-green-400">
                        🟢 Geöffnet · schliesst um 22:00
                      </span>
                    </div>
                  </div>
                </div>

                {/* LINK SLIDER */}
                <div style={{ marginTop: '0.375rem' }}>
                  <LinkSlider links={links} businessId={business.id} />
                </div>

                {/* GOOGLE REVIEW BOX */}
                <div style={{ marginTop: '0.5rem' }}>
                  <GoogleReviewBox
                    businessName={business.name}
                    googleReviewUrl={googleReviewUrl}
                    whatsappUrl={whatsappUrl}
                    emailUrl={emailUrl}
                    businessId={business.id}
                  />
                </div>

                {/* CUSTOM LINKS */}
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
                          style={{
                            display: 'block',
                            textAlign: 'center',
                            padding: '0.75rem',
                            background: '#111',
                            borderRadius: '12px',
                            border: '1px solid #222',
                            marginBottom: '0.5rem',
                            textDecoration: 'none',
                            color: '#f8fafc',
                            fontSize: '0.95rem',
                          }}
                        >
                          {link.label}
                        </TrackedLink>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* DEALS SECTION */}
          <section style={{ width: '100%', color: '#fff' }}>
            <div
              style={{
                maxWidth: '680px',
                margin: '0 auto',
                paddingTop: '8px',
                paddingBottom: '16px',
                paddingLeft: '16px',
                paddingRight: '16px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  gap: '16px',
                }}
              >
                <DealCardList
  ourDeal={ourDeal}
  selectedDeals={selectedDeals}
  previewDealId={previewDeal}
  redeemDealId={redeemDeal}
  detailsDealId={detailsDeal}
  shownDealIds={shownDealIds}
/>
              </div>
            </div>
          </section>
        </main>
      </div>
    </ProfileTracker>
  )
}