import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import DealCardList from '@/components/DealCardList'

import ProfileTracker from '@/components/ProfileTracker'
import TrackedLink from '@/components/TrackedLink'
import LinkSlider from '@/components/LinkSlider'
import GoogleReviewCard from '@/components/GoogleReviewCard'
import { getInstantRelevanceScore } from '@/lib/journey'


interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{
    dealId?: string
    previewDeal?: string
    redeemDeal?: string
    detailsDeal?: string
    shownDeals?: string
    reviewTone?: string
hideReview?: string
  }>
}

function normalizeUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const trimmed = url.trim()
  if (!trimmed) return null

if (
  trimmed.startsWith('http://') ||
  trimmed.startsWith('https://') ||
  trimmed.startsWith('/') ||
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

function getRelevanceScore(businessSubCategory: string, dealSubCategory: string | null): number {
  return getInstantRelevanceScore(businessSubCategory, dealSubCategory)
}

function isDealActive(deal: any) {
  const now = new Date()
  if (!deal.isActive) return false
  if (deal.startDate && new Date(deal.startDate) > now) return false
  if (deal.endDate && new Date(deal.endDate) < now) return false
  return true
}
function calculateDistanceKm(
  lat1: number | null | undefined,
  lon1: number | null | undefined,
  lat2: number | null | undefined,
  lon2: number | null | undefined
): number | null {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null

  const earthRadiusKm = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return earthRadiusKm * c
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
const {
  dealId,
  previewDeal,
  redeemDeal,
  detailsDeal,
  shownDeals,
  reviewTone,
hideReview,
} = await searchParams
  const business = await prisma.business.findUnique({
    where: { slug },
  })


  if (!business) notFound()
    const cookieStore = await cookies()
const reviewHidden =
  cookieStore.get(`scandeal_review_hidden_${business.slug}`)?.value === 'true'

  let ourDeal: Awaited<ReturnType<typeof prisma.deal.findUnique>> | null = null

  if (dealId || redeemDeal || detailsDeal) {
    const targetDeal = await prisma.deal.findUnique({
  where: { id: detailsDeal || redeemDeal || dealId },
  include: {
    business: {
      select: {
        name: true,
        slug: true,
        logoUrl: true,
      },
    },
  },
})

if (targetDeal) {
  ourDeal = targetDeal
}
}

 const allDeals = await prisma.deal.findMany({
  include: {
    business: {
      select: {
  name: true,
  slug: true,
  logoUrl: true,
  latitude: true,
  longitude: true,
  subCategory: true,
  subCategories: true,
},
    },
  },
})
const businessBlockedSubCategories = [
  business.subCategory,
  ...JSON.parse(business.subCategories || '[]'),
].filter(Boolean)

const filteredDeals = allDeals.filter((deal: (typeof allDeals)[0]) => {
  const dealBusinessSubCategories = [
    deal.business?.subCategory,
    ...JSON.parse(deal.business?.subCategories || '[]'),
  ].filter(Boolean)

  const hasBlockedSubCategory =
    businessBlockedSubCategories.includes(deal.subCategory || '') ||
    dealBusinessSubCategories.some((sub) =>
      businessBlockedSubCategories.includes(sub)
    )

  return (
    deal.businessId !== business.id &&
    !hasBlockedSubCategory &&
    (!ourDeal || deal.id !== ourDeal.id) &&
    isDealActive(deal)
  )
})
  const forcedPreviewDeal = previewDeal
  ? allDeals.find((deal) => deal.id === previewDeal)
  : null
const forcedDetailsDeal = detailsDeal
  ? allDeals.find((deal) => deal.id === detailsDeal)
  : null
  function getDistanceScore(distanceKm: number | null): number {
  if (distanceKm === null) return 0
  if (distanceKm <= 1) return 5
  if (distanceKm <= 3) return 4
  if (distanceKm <= 5) return 3
  if (distanceKm <= 10) return 2
  return 0
}
  const scoredDeals = filteredDeals.map((deal: (typeof allDeals)[0]) => {
  const relevanceScore = getRelevanceScore(
    business.subCategory || '',
    deal.subCategory
  )

  const distanceKm = calculateDistanceKm(
    business.latitude,
    business.longitude,
    deal.business?.latitude,
    deal.business?.longitude
  )

  const distanceScore = getDistanceScore(distanceKm)

  return {
    ...deal,
    relevanceScore,
    distanceKm,
    distanceScore,
    finalScore: relevanceScore * 100 + distanceScore,
  }
})

  const premiumDeals = scoredDeals.filter((deal) => deal.isPremium)
  const normalDeals = scoredDeals.filter((deal) => !deal.isPremium)

const hasUrlState =
  previewDeal ||
  redeemDeal ||
  detailsDeal ||
  reviewTone
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
    const usedCategories = new Set<string>()

function getDealCategories(deal: any): string[] {
  const categories = []

  if (deal.subCategory) {
    categories.push(deal.subCategory)
  }

  if (deal.subCategories) {
    try {
      const parsed = JSON.parse(deal.subCategories)

      if (Array.isArray(parsed)) {
        categories.push(...parsed)
      }
    } catch {}
  }

  return categories
}

function hasCategoryConflict(deal: any) {
  const categories = getDealCategories(deal)

  return categories.some((category) =>
    usedCategories.has(category)
  )
}

function registerDealCategories(deal: any) {
  const categories = getDealCategories(deal)

  categories.forEach((category) => {
    usedCategories.add(category)
  })
}

for (const deal of randomPremiumDeals) {
  if (!hasCategoryConflict(deal)) {
    selectedDeals.push(deal)
    registerDealCategories(deal)
    break
  }
}

for (const deal of randomNormalDeals) {
  if (selectedDeals.length >= 4) break

  if (!hasCategoryConflict(deal)) {
    selectedDeals.push(deal)
    registerDealCategories(deal)
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
      return b.finalScore - a.finalScore
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
  const menuLinkUrl = normalizeUrl(business.menuLink)
const bookingLinkUrl = normalizeUrl(business.bookingLink)
const shopLinkUrl = normalizeUrl(business.shopLink)
const uberEatsLinkUrl = normalizeUrl(business.uberEatsLink)
const justEatLinkUrl = normalizeUrl(business.justEatLink)
const directOrderLinkUrl = normalizeUrl(business.directOrderLink)
const youtubeUrl = normalizeUrl(business.youtube)
let reviewSuggestion = ''

if (reviewTone) {
  try {
    const response = await fetch(
      'http://localhost:3000/api/google-review-suggestion',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName: business.name,
          city: business.googleCity,
          category: business.category,
          subCategory: business.subCategory,
          intensity: Number(reviewTone),
        }),
        cache: 'no-store',
      }
    )

    const data = await response.json()

    reviewSuggestion = data.text || ''
  } catch (error) {
    console.error(error)
  }
}
const priorityLinks = business.priorityLinks
  ? JSON.parse(business.priorityLinks)
  : []
  const allLinks = [
    { label: 'Website', icon: '/slideicons/slide_card_webseite.jpeg', href: websiteUrl },
    { label: 'Route', icon: '/slideicons/slide_card_maps.jpeg', href: googleMapsUrl },
    { label: 'WhatsApp', icon: '/slideicons/slide_card_whatsapp.jpeg', href: whatsappUrl },
    { label: 'Call', icon: '/slideicons/slide_card_mobil.jpeg', href: phoneUrl },
    { label: 'Instagram', icon: '/slideicons/slide_card_insta.jpeg', href: instagramUrl },
    { label: 'Facebook', icon: '/slideicons/slide_card_fb.jpeg', href: facebookUrl },
    { label: 'LinkedIn', icon: '/slideicons/slide_card_in.jpeg', href: linkedinUrl },
    { label: 'TripAdvisor', icon: '/slideicons/slide_card_tripadvisor.jpeg', href: tripadvisorUrl },
    { label: 'TikTok', icon: '/slideicons/slide_card_tiktok.jpeg', href: tiktokUrl },
    { label: 'YouTube', icon: '/slideicons/slide_card_youtube.jpeg', href: youtubeUrl },
    { label: 'MENÜ', icon: '/slideicons/slide_card_menu.jpeg', href: menuLinkUrl },
{ label: 'BOOKING', icon: '/slideicons/slide_card_termine.jpeg', href: bookingLinkUrl },
{ label: 'SHOP', icon: '/slideicons/slide_card_shop.jpeg', href: shopLinkUrl },
{ label: 'UBER EATS', icon: '/slideicons/slide_card_ubereats.jpeg', href: uberEatsLinkUrl },
{ label: 'JUST EAT', icon: '/slideicons/slide_card_justeat.jpeg', href: justEatLinkUrl },
{ label: 'BESTELLEN', icon: '/slideicons/slide_card_direkt.jpeg', href: directOrderLinkUrl },
    { label: 'Email', icon: '/slideicons/slide_card_email.jpeg', href: emailUrl },
  ].filter((link): link is { label: string; icon: string; href: string } => Boolean(link.href))

const priorityOrder: Record<string, number> = {
  menu: 0,
  booking: 1,
  shop: 2,
  directOrder: 3,
  uberEats: 4,
  justEat: 5,
  route: 6,
  call: 7,
  website: 8,
  whatsapp: 9,
  instagram: 10,
  facebook: 11,
  tiktok: 12,
  youtube: 13,
  email: 14,
}

const links = [...allLinks].sort((a, b) => {
  const aIndex = priorityLinks.indexOf(
    Object.keys(priorityOrder).find(
      (key) => priorityOrder[key] === priorityOrder[
        a.label === 'MENÜ'
          ? 'menu'
          : a.label === 'BOOKING'
          ? 'booking'
          : a.label === 'SHOP'
          ? 'shop'
          : a.label === 'BESTELLEN'
          ? 'directOrder'
          : a.label === 'UBER EATS'
          ? 'uberEats'
          : a.label === 'JUST EAT'
          ? 'justEat'
          : a.label === 'Route'
          ? 'route'
          : a.label === 'Call'
          ? 'call'
          : a.label === 'Website'
          ? 'website'
          : a.label === 'WhatsApp'
          ? 'whatsapp'
          : a.label === 'Instagram'
          ? 'instagram'
          : a.label === 'Facebook'
          ? 'facebook'
          : a.label === 'TikTok'
          ? 'tiktok'
          : a.label === 'YouTube'
          ? 'youtube'
          : 'email'
      ]
    ) || ''
  )

  const bIndex = priorityLinks.indexOf(
    Object.keys(priorityOrder).find(
      (key) => priorityOrder[key] === priorityOrder[
        b.label === 'MENÜ'
          ? 'menu'
          : b.label === 'BOOKING'
          ? 'booking'
          : b.label === 'SHOP'
          ? 'shop'
          : b.label === 'BESTELLEN'
          ? 'directOrder'
          : b.label === 'UBER EATS'
          ? 'uberEats'
          : b.label === 'JUST EAT'
          ? 'justEat'
          : b.label === 'Route'
          ? 'route'
          : b.label === 'Call'
          ? 'call'
          : b.label === 'Website'
          ? 'website'
          : b.label === 'WhatsApp'
          ? 'whatsapp'
          : b.label === 'Instagram'
          ? 'instagram'
          : b.label === 'Facebook'
          ? 'facebook'
          : b.label === 'TikTok'
          ? 'tiktok'
          : b.label === 'YouTube'
          ? 'youtube'
          : 'email'
      ]
    ) || ''
  )

  if (aIndex === -1 && bIndex === -1) return 0
  if (aIndex === -1) return 1
  if (bIndex === -1) return -1

  return aIndex - bIndex
})

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
                      className="h-24 w-24 shrink-0 rounded-2xl object-contain bg-white p-2"
                    />

                    <div className="flex min-w-0 flex-1 flex-col">
                      <h1 className="truncate text-xl font-semibold text-white">{business.name}</h1>

                      {business.description && (
                        <p className="mt-1 line-clamp-2 text-sm leading-snug text-gray-400">
                          {business.description}
                        </p>
                      )}

                      {(business.googleRating || business.googleReviews || business.googleCity) && (
  <div className="mt-1 text-sm text-gray-300">
    {business.googleRating ? `⭐ ${business.googleRating}` : ''}
    {business.googleReviews ? ` (${business.googleReviews})` : ''}

    {business.googleCity && googleMapsUrl && (
      <>
        {' · '}
        <a
          href={googleMapsUrl}
          className="text-gray-300"
        >
          📍 {business.googleCity}
        </a>
      </>
    )}

    {business.googleCity && !googleMapsUrl && (
      <> · 📍 {business.googleCity}</>
    )}
  </div>
)}

{business.googleOpeningText && (
  <span
    className={
  business.googleOpeningNow
    ? 'mt-1 text-sm text-green-400'
    : 'mt-1 text-sm text-gray-300'
}
  >
    {business.googleOpeningNow ? '🟢 ' : '🕒 '}
    {business.googleOpeningText}
  </span>
)}
                    </div>
                  </div>
                </div>
{!hideReview && !reviewHidden && (
  <div className="relative">
    <a
      href={`/api/review-hide?slug=${business.slug}&redirect=${encodeURIComponent(
  `/profile/${business.slug}?shownDeals=${selectedDeals.map((deal) => deal.id).join(',')}`
)}`}
      className="absolute -left-2 -top-2 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black text-lg text-white shadow-lg"
    >
      ✕
    </a>

    <GoogleReviewCard
      businessSlug={business.slug}
      businessName={business.name}
      googleReviewUrl={googleReviewUrl}
      reviewTone={reviewTone}
      reviewSuggestion={reviewSuggestion}
    />
  </div>
)}
{/* LINK SLIDER */}
                <div style={{ marginTop: '0.375rem' }}>
                  <LinkSlider links={links} businessId={business.id} />
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