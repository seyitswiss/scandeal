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
  businessDescription?: string
): Promise<GeneratedDealContent> {
  try {
    const prompt = buildPrompt(businessName, category, subCategory, businessDescription)

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
            content:
              'You are a marketing expert creating short, catchy deal descriptions for local businesses. Keep responses concise and engaging.',
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
  businessDescription?: string
): string {
  return `Generate a short deal for "${businessName}" (${category}/${subCategory}).
${businessDescription ? `Business info: ${businessDescription}` : ''}

Return JSON in this exact format:
{
  "title": "short catchy title (5-8 words)",
  "highlight": "one-line hook (10-15 words)",
  "description": "2-3 sentences. First 1-2 sentences are preview. Rest is full description for Our Deal section."
}

Keep it simple, in German if business sounds German, English otherwise.`
}

function parseGeneratedContent(
  content: string,
  businessName: string,
  category: string,
  subCategory: string
): Omit<GeneratedDealContent, 'image'> {
  try {
    const parsed = JSON.parse(content)
    if (parsed.title && parsed.highlight && parsed.description) {
      return {
        title: parsed.title.substring(0, 100),
        highlight: parsed.highlight.substring(0, 150),
        description: parsed.description.substring(0, 1000),
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
    title: `${businessName} Special`,
    highlight: `Exclusive offer from ${businessName}`,
    description: `Enjoy a special offer at ${businessName}. Valid for a limited time only. ${category ? `Perfect for ${category.toLowerCase()}.` : ''} Come visit us and make the most of this great deal!`,
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
        model: 'dall-e-3',
        prompt: imagePrompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        style: 'natural',
      }),
    })

    if (!response.ok) {
      console.error('DALL-E error:', response.statusText)
      return undefined
    }

    const data = await response.json()
    return data.data?.[0]?.url
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
