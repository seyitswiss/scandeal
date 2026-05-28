'use client'




interface Props {
  businessSlug: string
  businessName: string
  googleReviewUrl: string | null
  reviewTone?: string
  reviewSuggestion?: string
}

export default function GoogleReviewCard({
  businessSlug,
  businessName,
  googleReviewUrl,
  reviewTone,
  reviewSuggestion,
}: Props) {
  

  return (
    <div className="mt-3 overflow-hidden rounded-3xl border border-[#222] bg-[#111]">
      {/* TOP GOOGLE AREA */}
      <div
        className="relative overflow-hidden px-5 py-4"
        style={{
          backgroundImage: "url('/review/google-review-bg.png')",
          backgroundSize: '112% 150%',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="relative z-10 flex w-full items-center justify-between gap-4">

          {/* LEFT */}
          <div>
            <div className="flex items-start gap-3">
              <img
                src="/icons/G.png"
                alt="Google"
                className="mt-[8px] h-10 w-10"
              />

              <div className="flex flex-col">
                <h2 className="whitespace-nowrap text-[18px] font-semibold tracking-tight text-white">
                  Google Bewertung
                </h2>

                <div className="flex items-center gap-[5px]">
                  <span style={{ color: '#FFC107' }}>★</span>
                  <span style={{ color: '#FFC107' }}>★</span>
                  <span style={{ color: '#FFC107' }}>★</span>
                  <span style={{ color: '#FFC107' }}>★</span>
                  <span style={{ color: '#FFC107' }}>★</span>
                </div>
              </div>
            </div>

            <p className="mt-4 max-w-[240px] text-[15px] leading-relaxed text-gray-300">
              Hilfe dem lokalen Unternehmen mit einer Google Bewertung —
nutze die KI-Inspiration.
            </p>
          </div>

          {/* BUTTON */}
{googleReviewUrl && (
  <div>
    <div className="overflow-hidden rounded-[18px] bg-[conic-gradient(from_180deg_at_50%_50%,#EA4335_0deg,#4285F4_90deg,#34A853_180deg,#FBBC05_270deg,#EA4335_360deg)] p-[2px] shadow-lg [transform:translateZ(0)]">
      <a
        href={googleReviewUrl}
        className="flex h-11 min-w-[109px] items-center justify-center rounded-[15px] bg-white pl-1 pr-2 text-base font-semibold text-black"
      >
        Öffnen
      </a>
    </div>

    <div className="mt-3 flex justify-center">
      <a
        href={`/api/review-hide-permanent?slug=${businessSlug}&redirect=${encodeURIComponent(
          `/profile/${businessSlug}?reviewThanks=1`
        )}`}
        className="text-[10px] leading-none text-gray-300 underline underline-offset-2"
      >
        Bereits bewertet?
      </a>
    </div>
  </div>
)}
        </div>
        {/* KI LINK */}
        {!reviewTone && (
          <div className="relative z-10 mt-5 border-t border-white/10 pt-4">
            <a
              href="?reviewTone=1#review-ai"
              className="text-sm text-gray-300 transition hover:text-white"
            >
              ✨  KI-Inspiration hier öffnen
            </a>
          </div>
        )}

        {/* EXPANDED */}
        {reviewTone && (
          <div
            id="review-ai"
            className="relative z-10 mt-5 scroll-mt-24 border-t border-white/10 pt-5"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-[16px] font-semibold text-white">
                ✨ Wähle einen passenden Stil:
              </p>

             
            </div>

            <div className="mt-5 flex flex-col gap-3">
  <a
    href="?reviewTone=1#review-ai"
    className={`rounded-2xl border px-4 py-3 text-sm transition ${
      reviewTone === '1'
        ? 'border-green-400 bg-green-500/25 text-green-200'
        : 'border-white/15 bg-black/20 text-white'
    }`}
  >
    Kurz & schlicht
  </a>

  <a
    href="?reviewTone=2#review-ai"
    className={`rounded-2xl border px-4 py-3 text-sm transition ${
      reviewTone === '2'
        ? 'border-orange-300 bg-orange-400/25 text-orange-200'
        : 'border-white/15 bg-black/20 text-white'
    }`}
  >
    Freundlich & persönlich
  </a>

  <a
    href="?reviewTone=3#review-ai"
    className={`rounded-2xl border px-4 py-3 text-sm transition ${
      reviewTone === '3'
        ? 'border-blue-400 bg-blue-500/25 text-blue-200'
        : 'border-white/15 bg-black/20 text-white'
    }`}
  >
    Sehr begeistert
  </a>
</div>

            <div className="mt-6 flex items-start gap-4">
              <img
                src="/review/ki-lamp.png"
                alt=""
                aria-hidden="true"
                className="mt-4 h-16 w-16 shrink-0 object-contain mix-blend-lighten"              />

              <div>
                <div className="inline-flex rounded-lg border border-blue-500/60 px-3 py-1 text-sm font-semibold text-blue-400">
                  KI Inspiration
                </div>
<p className="mt-2 text-xs text-gray-400">
  Text markieren/kopieren • Öffnen • Sterneauswahl • einfügen
</p>
                <p className="mt-3 text-[15px] leading-relaxed text-gray-300">
                  {reviewSuggestion ||
                    'KI Inspiration wird geladen...'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}