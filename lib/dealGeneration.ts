import fs from 'fs/promises'
import path from 'path'

/**
 * Deal generation helper for AI-generated content and images
 * Generates: title, highlight, description, image
 * Only for non-premium deals
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
Generate high-converting deal content for a local business.

Rules:
- Use the primary language of the business (default: German)
- Write simple, clear sentences
- Think like a salesperson, not a corporate writer
- Focus on customer benefit
- Do NOT use time-based urgency (no "today", "this week", etc.)
- Do NOT invent discounts, dates, or conditions

Structure:
- Title: max 6–8 words, strong and clear
- Highlight: one short hook sentence
- Description:
  - First 1–2 sentences must be attention-grabbing and work as preview
  - Then explain the offer clearly

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
  return `Create deal content for the business "${businessName}" in the category ${category}/${subCategory}.
${businessDescription ? `Business description: ${businessDescription}
` : ''}${dealIdea ? `Deal idea: ${dealIdea}
` : ''}

- Use the primary language of the business, default German.
- Keep sentences short and simple.
- Think like a salesperson.
- Focus on customer benefit and value.
- Do not invent discounts, dates, deadlines, or conditions.
- Do not use urgency words like today, tomorrow, this week.
- Output only valid JSON with the exact keys: title, highlight, description.
- Title: short, strong, maximum 6-8 words.
- Highlight: one short hook sentence.
- Description: first 1-2 sentences must work as a standalone preview, show benefit, and trigger action. Then explain the offer clearly, what is included, for whom it is, and why it is valuable.

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
  title: `${businessName} Angebot`,
  highlight: `Exklusives Angebot bei ${businessName}`,
  description: `Entdecke ein attraktives Angebot bei ${businessName}. Klar, einfach und passend zu deinem Interesse. Jetzt ansehen und profitieren.`,
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
  return `Create a professional, realistic promotional image for a deal at "${businessName}" (${category}/${subCategory}). 
Style: Modern, commercial, clean aesthetic. 
Show the service/product relevant to ${subCategory} in an appealing way.
No text, no logos, no watermarks.
Size: 1024x1024.
Professional lighting and composition.`
}
