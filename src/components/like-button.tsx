"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "./ui/use-toast"


interface LikeButtonProps {
  contentId: string
  contentType: "blog" | "project"
  initialLikes?: number
}

export function LikeButton({ contentId, contentType, initialLikes = 0 }: LikeButtonProps) {
  const { toast } = useToast()
  const [likes, setLikes] = useState(initialLikes)
  const [liked, setLiked] = useState(false)
  const storageKey = `${contentType}-${contentId}-liked`

  useEffect(() => {
    // Check if user has already liked this content
    const hasLiked = localStorage.getItem(storageKey) === "true"
    setLiked(hasLiked)

    // Get stored likes count
    const storedLikes = localStorage.getItem(`${contentType}-${contentId}-likes`)
    if (storedLikes) {
      setLikes(Number.parseInt(storedLikes))
    }
  }, [contentId, contentType, storageKey])

  const handleLike = () => {
    if (liked) {
      // Unlike
      setLikes((prev) => prev - 1)
      setLiked(false)
      localStorage.setItem(storageKey, "false")
      localStorage.setItem(`${contentType}-${contentId}-likes`, String(likes - 1))
      toast({
        description: "You've removed your like",
      })
    } else {
      // Like
      setLikes((prev) => prev + 1)
      setLiked(true)
      localStorage.setItem(storageKey, "true")
      localStorage.setItem(`${contentType}-${contentId}-likes`, String(likes + 1))
      toast({
        description: "Thanks for liking!",
      })
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`flex items-center gap-1 ${liked ? "text-red-500" : ""}`}
      onClick={handleLike}
    >
      <Heart className={`h-4 w-4 ${liked ? "fill-red-500" : ""}`} />
      <span>{likes}</span>
    </Button>
  )
}
