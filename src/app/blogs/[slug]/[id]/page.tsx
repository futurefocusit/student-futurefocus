'use client'
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User, ArrowLeft, BookOpen, Loader2, AlertCircle } from "lucide-react"
import { CommentSection } from "@/components/comment-section"
import { LikeButton } from "@/components/like-button"

// Define types for our data
type BlogPost = {
  _id: string
  title: string
  excerpt: string
  content: string
  date?: string
  readTime?: string
  author: { _id: string, name: string }
  tags: string[]
  image: string
  createdAt: string
  updatedAt: string
}

// Fetch data from the backend
async function getBlogPost(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${id}`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    })

    if (!res.ok) {
      if (res.status === 404) {
        return null
      }
      throw new Error("Failed to fetch blog post")
    }

    const data = await res.json()
    return data.data as BlogPost
  } catch (error) {
    console.error("Error fetching blog post:", error)
    return null
  }
}

// Custom Not Found Component
function BlogNotFound({ slug }: { slug: string }) {
  return (
    <div className="flex min-h-screen">
      <div className="flex-1 bg-gradient-to-br from-blue-50 via-white to-yellow-50">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" size="sm" asChild className="text-white hover:text-yellow-200 hover:bg-white/10">
                <Link href={`/blogs/${slug}`} className="flex items-center gap-1">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back to Blogs
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Error Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-800" />
                </div>
                Blog Post Not Found
              </h2>
            </div>
            <div className="px-6 py-8">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Blog Post Not Found</h3>
                <p className="text-gray-500 mb-8">The blog post you`&apos;re looking for doesn`&apos;t exist or has been removed.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <Link href={`/blogs/${slug}`}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Blog List
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/">
                      Go to Home
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-900 py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-blue-100 text-lg">
                © {new Date().getFullYear()} All rights reserved.
              </p>
              <div className="mt-4 w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function BlogPostPage({ params }: { params: { slug: string; id: string } }) {
  const post = await getBlogPost(params.id)

  if (!post) {
    return <BlogNotFound slug={params.slug} />
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 bg-gradient-to-br from-blue-50 via-white to-yellow-50">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" size="sm" asChild className="text-white hover:text-yellow-200 hover:bg-white/10">
                <Link href={`/blogs/${params.slug}`} className="flex items-center gap-1">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back to Blogs
                </Link>
              </Button>
            </div>
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
                {post.title}
              </h1>
              <p className="text-blue-100 text-lg max-w-3xl mx-auto">
                {post.excerpt}
              </p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">
            {/* Blog Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-blue-800" />
                  </div>
                  Blog Post
                </h2>
              </div>
            </div>

            <div className="px-6 py-8">
              <div className="space-y-8">
                {/* Meta Information */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 border-b border-gray-200 pb-6">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span>
                      {new Date(post.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span>{post.readTime || "5 min read"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{post.author.name}</span>
                  </div>
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Featured Image */}
                {post.image && (
                  <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden border border-gray-200">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                )}

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <div
                    className="text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                </div>

                {/* Like Button */}
                <div className="flex justify-center py-6 border-t border-gray-200">
                  <LikeButton contentId={post._id} contentType="blog" />
                </div>

                {/* Comments Section */}
                {/* <div className="border-t border-gray-200 pt-8">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-lg mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-800" />
                      </div>
                      Comments
                    </h3>
                  </div>
                  <CommentSection contentId={post._id} contentType="blog" />
                </div> */}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-900 py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-blue-100 text-lg">
                © {new Date().getFullYear()} All rights reserved.
              </p>
              <div className="mt-4 w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full mx-auto"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Add styles for prose content */}
      <style jsx global>{`
        .prose {
          max-width: 65ch;
          color: #374151;
        }
        .prose h1, .prose h2, .prose h3, .prose h4 {
          color: #1f2937;
          font-weight: 600;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        .prose p {
          margin-top: 1.25em;
          margin-bottom: 1.25em;
        }
        .prose a {
          color: #2563eb;
          text-decoration: underline;
        }
        .prose ul, .prose ol {
          margin-top: 1.25em;
          margin-bottom: 1.25em;
          padding-left: 1.625em;
        }
        .prose li {
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        .prose blockquote {
          font-style: italic;
          color: #4b5563;
          border-left-width: 0.25rem;
          border-left-color: #e5e7eb;
          padding-left: 1em;
          margin-top: 1.6em;
          margin-bottom: 1.6em;
        }
        .prose img {
          margin-top: 2em;
          margin-bottom: 2em;
          border-radius: 0.375rem;
        }
        .prose code {
          color: #1f2937;
          background-color: #f3f4f6;
          padding: 0.2em 0.4em;
          border-radius: 0.25rem;
          font-size: 0.875em;
        }
        .prose pre {
          background-color: #1f2937;
          color: #f3f4f6;
          padding: 1em;
          border-radius: 0.375rem;
          overflow-x: auto;
        }
      `}</style>
    </div>
  )
}
