"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, Loader2 } from "lucide-react"

interface ImageUploadProps {
  currentImage: string
  onImageChange: (url: string) => void
  fallback: string
}

export function ImageUpload({ currentImage, onImageChange, fallback }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
        
      const formData = new FormData()
      formData.append("file", file)

      await new Promise((resolve) => setTimeout(resolve, 2000))

      const mockUrl = `/placeholder.svg?height=96&width=96&text=${encodeURIComponent(file.name)}`

      onImageChange(mockUrl)
    } catch (error) {
      console.error("Upload failed:", error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="relative">
      <Avatar className="w-24 h-24 border-4 border-background">
        <AvatarImage src={currentImage || "/placeholder.svg"} alt="Profile" />
        <AvatarFallback className="text-2xl">{fallback}</AvatarFallback>
      </Avatar>

      <label className="absolute -bottom-2 -right-2 cursor-pointer">
        <Button size="sm" variant="secondary" className="rounded-full w-8 h-8 p-0" disabled={isUploading} asChild>
          <div>{isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}</div>
        </Button>
        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isUploading} />
      </label>
    </div>
  )
}
