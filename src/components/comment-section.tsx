"use client"

import { useState, useEffect } from "react"
import { CommentForm, type Comment as CommentType } from "./comment-form"

import { MessageSquare, Loader2 } from "lucide-react"
import { useToast } from "./ui/use-toast"
import { CommentItem } from "./comment-item"


interface CommentSectionProps {
  contentId: string
  contentType: "blog" | "project"
}

export function CommentSection({ contentId, contentType }: CommentSectionProps) {
  const { toast } = useToast()
  const [comments, setComments] = useState<CommentType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchComments()
  }, [contentId, contentType])

  const fetchComments = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comments/${contentType}/${contentId}`)

      if (!res.ok) {
        throw new Error("Failed to fetch comments")
      }

      const data = await res.json()
      setComments(data.data)
    } catch (error) {
      console.error("Error fetching comments:", error)
      toast({
        title: "Error",
        description: "Failed to load comments. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCommentAdded = async (newComment: CommentType) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comments/${contentType}/${contentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          author: newComment.author,
          content: newComment.content,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to add comment")
      }

      const data = await res.json()

      toast({
        description: "Comment added successfully. It will be visible after approval.",
      })

      // Only add to UI if it's approved (which it won't be by default for public users)
      if (data.data.approved) {
        setComments([...comments, data.data])
      } else {
        // Refresh comments to show any that might have been approved
        fetchComments()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add comment",
        variant: "destructive",
      })
    }
  }

  const handleReplyAdded = async (newReply: CommentType) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comments/${contentType}/${contentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parentId: newReply.parentId,
          author: newReply.author,
          content: newReply.content,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to add reply")
      }

      toast({
        description: "Reply added successfully. It will be visible after approval.",
      })

      // Refresh comments to show any that might have been approved
      fetchComments()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add reply",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading comments...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        <h2 className="text-xl font-bold">Comments ({comments.length})</h2>
      </div>

      <CommentForm contentId={contentId} contentType={contentType} onCommentAdded={handleCommentAdded} />

      {comments.length > 0 ? (
        <div className="space-y-6 mt-8">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} onReplyAdded={handleReplyAdded} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>Be the first to comment!</p>
        </div>
      )}
    </div>
  )
}
