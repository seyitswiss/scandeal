import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('video')

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  if (file.type !== 'video/mp4') {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
  }

  const extension = 'mp4'
  const fileName = `premium-video-${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'videos')

  try {
    fs.mkdirSync(uploadDir, { recursive: true })
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const filePath = path.join(uploadDir, fileName)
    await fs.promises.writeFile(filePath, buffer)

    return NextResponse.json({ path: `/uploads/videos/${fileName}` })
  } catch (error) {
    console.error('Upload failed', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
