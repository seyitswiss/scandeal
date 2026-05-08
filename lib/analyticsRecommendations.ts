export function getDealRecommendation(views: number, clicks: number, redeems: number): string {
  if (views > 100 && clicks / Math.max(views, 1) < 0.2) {
    return "⚠️ Viele sehen diesen Deal, aber wenige klicken. Prüfe Titel, Bild oder Highlight."
  }
  if (clicks > 50 && redeems / Math.max(clicks, 1) < 0.3) {
    return "⚠️ Viele klicken, aber wenige lösen ein. Prüfe Angebot, Einlöseprozess oder Gültigkeit."
  }
  if (views < 10) {
    return "⚠️ Dieser Deal wird wenig gesehen. Prüfe Platzierung, Kategorie oder Sichtbarkeit."
  }
  if (clicks / Math.max(views, 1) > 0.5 && redeems / Math.max(clicks, 1) > 0.5) {
    return "🔥 Starker Deal. Weiter so oder als Premium Deal testen."
  }
  return "Normal"
}

export function getBusinessRecommendation(
  qrScans: number,
  linkClicks: number,
  profileViews: number,
  googleViews: number,
  instagramViews: number,
  instagramUrl?: string | null,
  googleUrl?: string | null
): string {
  if (qrScans > 100 && linkClicks / Math.max(qrScans, 1) < 0.1) {
    return "⚠️ Viele scannen den QR-Code, aber wenige klicken weiter. OnePager CTA verbessern."
  }
  if (googleUrl && googleUrl.trim() !== '' && profileViews > 200 && googleViews / Math.max(profileViews, 1) < 0.05) {
    return "⚠️ Viele besuchen den OnePager, aber wenige kommen von Google. Google Review Box stärker platzieren."
  }
  if (instagramUrl && instagramUrl.trim() !== '' && instagramViews < 20) {
    return "⚠️ Instagram wird wenig genutzt. Position oder Icon prüfen."
  }
  return "Normale Performance. Weiter beobachten."
}