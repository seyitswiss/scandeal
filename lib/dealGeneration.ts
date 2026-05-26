import fs from 'fs/promises'
import path from 'path'

/**
 * Promotion generation helper for AI-generated content and images
 * Generates: title, highlight, description, image
 * Used for local discovery / PromoCards
 */

export interface GeneratedDealContent {
  title: string
  highlight: string
  description: string
  image?: string
}

export async function generateDealContent(
  businessName: string,
  category: string,
  subCategory: string,
  businessDescription?: string,
  dealIdea?: string,
  includeImage = true
): Promise<GeneratedDealContent> {
  try {
    const prompt = buildPrompt(businessName, category, subCategory, businessDescription, dealIdea)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
  {
    role: 'system',
    content: `
Generate mobile-first Scandeal promotion content for a local business.

The content is used in a local discovery journey:
1. Title = quick attention on the PromoCard
2. Highlight = short hook / reason to look closer
3. Description = short business-focused promo text for local discovery

Core rules:
- Use the primary language of the business (default: German)
- Write simple, clear, short sentences
- Think like a local discovery assistant, not a coupon writer
- Focus on attention, atmosphere, specialty, trust, local relevance, or curiosity
- Do NOT create discounts, coupons, free items, percentages, prices, deadlines, or deal conditions
- Do NOT write redemption instructions
- Do NOT use "Rabatt", "Gutschein", "gratis", "kostenlos", "Dealpass", "einlösen", "profitieren"
- Do NOT use fake claims like "best", "number 1", "most popular" unless provided
- Do NOT invent facts, awards, opening hours, guarantees, or customer numbers
- Avoid generic marketing words like "exklusiv", "einzigartig", "unschlagbar", "Spezialvorteil"
- Keep it natural and believable for a small local business

Structure:
- Title: 2–5 words only. It should describe the business, product, service, or local spot.
- Highlight: maximum 3–7 words. It should be a short hook, not a discount.
- Description:
  - max 2 short paragraphs
  - first paragraph creates interest
  - second paragraph gives a simple, useful reason to visit or explore the business
  - no redemption or coupon language

Output ONLY valid JSON:
{
  "title": "...",
  "highlight": "...",
  "description": "..."
}
`,
  },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    })

    if (!response.ok) {
      console.error('OpenAI API error:', response.statusText)
      return getDefaultContent(businessName, category)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''

    const parsed = parseGeneratedContent(content, businessName, category, subCategory)

    if (!includeImage) {
      return parsed
    }

    // Generate image
    const image = await generateDealImage(businessName, category, subCategory)

    return {
      ...parsed,
      image,
    }
  } catch (error) {
    console.error('Deal generation error:', error)
    return getDefaultContent(businessName, category)
  }
}

function buildPrompt(
  businessName: string,
  category: string,
  subCategory: string,
  businessDescription?: string,
  dealIdea?: string
): string {
  return `Create promotion content for the business "${businessName}" in the category ${category}/${subCategory}.
${businessDescription ? `Business description: ${businessDescription}
` : ''}${dealIdea ? `Promotion idea: ${dealIdea}
` : ''}

- Use the primary language of the business, default German.
- Keep sentences short and simple.
- Think like a local discovery assistant, not a coupon writer.
- Focus on attention, atmosphere, specialty, trust, local relevance, or curiosity.
- Do not invent discounts, prices, percentages, free items, dates, deadlines, or conditions.
- Do not mention redemption, coupons, DealPass, vouchers, or how to redeem anything.
- Do not use words like "Rabatt", "Gutschein", "gratis", "kostenlos", "einlösen", "profitieren".
- Do not invent fake claims such as "best", "number 1", "most popular", awards, opening hours, or customer numbers.
- Avoid vague marketing words like "exklusiv", "einzigartig", "unschlagbar", "Spezialvorteil".
- Output only valid JSON with the exact keys: title, highlight, description.
- Title: 2-5 words only. It must describe the business, product, service, or local spot.
- Highlight: maximum 3-7 words. It must be a short hook, not a discount.
- Description: maximum 2 short paragraphs.
- First paragraph creates interest.
- Second paragraph gives a simple useful reason to visit or explore the business.
Return:
{
  "title": "...",
  "highlight": "...",
  "description": "..."
}`
}

function parseGeneratedContent(
  content: string,
  businessName: string,
  category: string,
  subCategory: string
): Omit<GeneratedDealContent, 'image'> {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      if (parsed.title && parsed.highlight && parsed.description) {
        return {
          title: String(parsed.title).trim().substring(0, 100),
          highlight: String(parsed.highlight).trim().substring(0, 150),
          description: String(parsed.description).trim().substring(0, 1000),
        }
      }
    }
  } catch {
    // fall through to default
  }

  return getDefaultContent(businessName, category)
}

function getDefaultContent(
  businessName: string,
  category: string
): Omit<GeneratedDealContent, 'image'> {
return {
  title: `${businessName}`,
  highlight: `Lokaler Spot zum Entdecken`,
  description: `Entdecke ${businessName} und erfahre mehr über das Angebot, die Atmosphäre und die wichtigsten Infos auf einen Blick.`,
}
}

async function generateDealImage(
  businessName: string,
  category: string,
  subCategory: string
): Promise<string | undefined> {
  try {
    const imagePrompt = buildImagePrompt(businessName, category, subCategory)

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: imagePrompt,
        n: 1,
        size: '1024x1024',
        quality: 'medium',
        
      }),
    })

    if (!response.ok) {
  const errorText = await response.text()
  console.error('DALL-E error:', response.status, response.statusText, errorText)
  return undefined
}

    const data = await response.json()

    const base64Image = data.data?.[0]?.b64_json

    if (!base64Image) {
      console.error('No base64 image returned from image generation')
      return undefined
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'deals')
    await fs.mkdir(uploadDir, { recursive: true })

    const fileName = `ai-deal-${Date.now()}.png`
    const filePath = path.join(uploadDir, fileName)
    const buffer = Buffer.from(base64Image, 'base64')

    await fs.writeFile(filePath, buffer)

    const localPath = `/uploads/deals/${fileName}`

    console.log('Saved AI deal image:', localPath)

    return localPath
  } catch (error) {
    console.error('Image generation error:', error)
    return undefined
  }
}

function buildImagePrompt(businessName: string, category: string, subCategory: string): string {
return `Create a professional, realistic promotional image for the local business "${businessName}" (${category}/${subCategory}).
Style: modern, commercial, clean, trustworthy, local discovery aesthetic.
Show the service, product, food, place, or atmosphere relevant to ${subCategory} in an appealing but realistic way.
No discount signs, no coupon design, no text, no logos, no watermarks.
Size: 1024x1024.
Professional lighting and composition.`
}
