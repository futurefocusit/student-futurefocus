"use client"

import { useState } from "react"
import { formatDistanceToNow } from 'date-fns'
import { MessageSquare, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type Comment, CommentForm } from "./comment-form"

interface CommentItemProps {
  comment: Comment
  onReplyAdded: (comment: Comment) => void
}

export function CommentItem({ comment, onReplyAdded }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)

  const handleReplyAdded = (newReply: Comment) => {
    onReplyAdded(newReply)
    setShowReplyForm(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          {comment.author.avatar ? (
            <img
              src={comment.author.avatar || "/placeholder.svg"}
              alt={comment.author.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{comment.author.name}</h4>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Reply
            </Button>
          </div>
          <div className="text-sm">{comment.content}</div>

          {showReplyForm && (
            <div className="mt-4">
              <CommentForm
                contentId={comment.contentId}
                contentType={comment.contentType}
                parentId={comment.id}
                onCommentAdded={handleReplyAdded}
                onCancel={() => setShowReplyForm(false)}
                isReply
              />
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-12 space-y-4 border-l-2 border-muted pl-4">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} onReplyAdded={onReplyAdded} />
          ))}
        </div>
      )}
    </div>
  )
}
