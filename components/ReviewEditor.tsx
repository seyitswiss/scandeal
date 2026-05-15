'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  text: string
}

export default function ReviewEditor({ text }: Props) {
  const [value, setValue] = useState(text)
  const [copied, setCopied] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    setValue(text)
  }, [text])

  async function handleCopy() {
  try {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.focus()
    textarea.select()
    textarea.setSelectionRange(0, textarea.value.length)

    await navigator.clipboard.writeText(textarea.value)

    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  } catch (error) {
    console.error(error)
    alert('Text ist markiert. Bitte im iPhone-Menü auf Kopieren tippen.')
  }
}

  return (
    <div className="mt-3">
      <textarea
      ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={5}
        className="w-full rounded-xl border border-[#222] bg-black/40 p-3 text-sm text-white outline-none"
      />

     <div
  role="button"
  tabIndex={0}
  onClick={handleCopy}
  onTouchEnd={(e) => {
    e.preventDefault()
    handleCopy()
  }}
  className="mt-3 inline-flex rounded-xl border border-green-500 px-4 py-2 text-sm text-white"
>
  {copied ? 'Kopiert' : 'Kopieren'}
</div>
    </div>
  )
}