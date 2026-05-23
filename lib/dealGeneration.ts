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
Generate mobile-first Scandeal deal content for a local business.

The content is used in a 3-step mobile deal journey:
1. Title = quick attention in DealHistory
2. Highlight = concrete benefit in very few words
3. Description = Preview text + full OUR DEAL explanation

Core rules:
- Use the primary language of the business (default: German)
- Write simple, clear, short sentences
- Think like a local deal assistant, not a corporate writer
- Focus on real customer value
- Prefer added-value deals over price/rabatt wording
- Good examples: free drink, dessert included, 20 min free, free styling, free consultation
- Avoid vague words like "Spezialvorteil", "Vorteilspreis", "exklusiv erleben"
- Do NOT invent dates, deadlines, prices, percentages, or conditions
- Do NOT use time-based urgency like today, tomorrow, this week
- Do NOT mention redemption instructions in the description

Structure:
- Title: 2–4 words only. It must say what the deal/service is.
- Highlight: maximum 3–7 words. It must say what the customer gets.
- Description:
  - max 2 short paragraphs
  - first paragraph creates interest and works as Preview text
  - second paragraph explains the real OUR DEAL clearly
  - must clearly say what the customer receives

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
- Title: 2-4 words only. It must describe the main service, product, or deal category.
- Highlight: maximum 3-7 words. It must describe the concrete customer benefit.
- Description: maximum 2 short paragraphs.
- First paragraph: creates interest and works as Preview text.
- Second paragraph: explains the real OUR DEAL clearly and says exactly what the customer receives.
- Do not mention how to redeem the deal in the description.
- Prefer added-value deals over price or percentage discounts.
- Avoid vague words like "Spezialvorteil", "Vorteilspreis", "exklusiv erleben".
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
