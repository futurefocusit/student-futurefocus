"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "./ui/use-toast"


interface CommentFormProps {
  contentId: string
  contentType: "blog" | "project"
  parentId?: string
  onCommentAdded: (comment: Comment) => void
  onCancel?: () => void
  isReply?: boolean
}

export interface Comment {
  id: string
  contentId: string
  contentType: "blog" | "project"
  parentId?: string
  author: {
    name: string
    email?: string
    avatar?: string
  }
  content: string
  createdAt: string
  replies?: Comment[]
}

export function CommentForm({
  contentId,
  contentType,
  parentId,
  onCommentAdded,
  onCancel,
  isReply = false,
}: CommentFormProps) {
  const { toast } = useToast()
  const [comment, setComment] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!comment.trim() || !name.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name and comment",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Create new comment
    const newComment: Comment = {
      id: Date.now().toString(), // This will be replaced by the server
      contentId,
      contentType,
      parentId,
      author: {
        name: name.trim(),
        email: email.trim() || undefined,
      },
      content: comment.trim(),
      createdAt: new Date().toISOString(),
    }

    onCommentAdded(newComment)
    setComment("")
    setName("")
    setEmail("")
    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Textarea
          placeholder={isReply ? "Write a reply..." : "Write a comment..."}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={isReply ? 3 : 4}
          className="resize-none"
        />
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md border-input bg-background"
          />
          <input
            type="email"
            placeholder="Your email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md border-input bg-background"
          />
        </div>
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : isReply ? "Reply" : "Comment"}
          </Button>
        </div>
      </div>
    </form>
  )
}
