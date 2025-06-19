'use client'
import Link from "next/link"
import Image from "next/image"
import { Calendar, Clock, User, BookOpen, Loader2, ArrowLeft } from "lucide-react"
import { Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useParams, useRouter } from "next/navigation"
import SideBar from "@/components/SideBar"

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

// Loading component
function BlogSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-blue-800" />
          </div>
          Blog Posts
        </h3>
      </div>
      <div className="px-6 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden flex flex-col h-full border border-gray-200">
              <div className="relative h-48 bg-gray-200 animate-pulse"></div>
              <CardContent className="flex-1 flex flex-col p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
                  <span>•</span>
                  <div className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
                </div>
                <div className="h-6 w-3/4 bg-gray-200 animate-pulse rounded"></div>
                <div className="h-20 w-full bg-gray-200 animate-pulse rounded"></div>
                <div className="flex flex-wrap gap-2">
                  <div className="h-6 w-16 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-6 w-16 bg-gray-200 animate-pulse rounded"></div>
                </div>
                <div className="flex items-center justify-between pt-4 mt-auto">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
                    <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                  <div className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

// Blog posts component
async function BlogPosts() {
  const params = useParams()

  const slug = params?.slug as string
  async function getBlogPosts() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs/slug/${slug}?sort=-createdAt`, {
        next: { revalidate: 3600 }, // Revalidate every hour
      })

      if (!res.ok) {
        throw new Error("Failed to fetch blog posts")
      }

      const data = await res.json()
      return data.data as BlogPost[]
    } catch (error) {
      console.error("Error fetching blog posts:", error)
      return []
    }
  }
  const posts = await getBlogPosts()

  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-800" />
            </div>
            Blog Posts
          </h3>
        </div>
        <div className="px-6 py-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full mx-auto mb-6 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Blog Posts Found</h3>
            <p className="text-gray-500">This institution hasn`&apos;t published any blog posts yet.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-blue-800" />
          </div>
          Blog Posts
        </h3>
      </div>
      <div className="px-6 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card key={post._id} className="overflow-hidden flex flex-col h-full border border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <div className="relative h-48">
                <Image
                  src={post.image || "/placeholder.svg?height=300&width=600"}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="flex-1 flex flex-col p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
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
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span>{post.readTime || "5 min read"}</span>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900 leading-tight">{post.title}</h2>
                <p className="text-gray-600 flex-1 leading-relaxed">{post.excerpt}</p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                      {tag}
                    </Badge>
                  ))}
                  {post.tags.length > 2 && (
                    <Badge variant="outline" className="text-gray-600">
                      +{post.tags.length - 2}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between pt-4 mt-auto">
                  <div className="flex items-center gap-2">
                    <div className="relative h-8 w-8 rounded-full overflow-hidden bg-gray-200">
                      <User className="h-4 w-4 absolute inset-0 m-auto text-gray-600" />
                    </div>
                    <span className="text-sm text-gray-700 font-medium">{post.author.name}</span>
                  </div>
                  <Link
                    href={`/blogs/${slug}/${post._id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  >
                    Read More
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function BlogPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params?.slug as string

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 bg-gradient-to-br from-blue-50 via-white to-yellow-50">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white hover:text-yellow-200 transition-colors duration-200"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </button>
            </div>
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
                Blog Posts
              </h1>
              <p className="text-blue-100 text-lg max-w-3xl mx-auto">
                Explore the latest thoughts, tutorials, and insights from our institution.
              </p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Suspense fallback={<BlogSkeleton />}>
            <BlogPosts />
          </Suspense>
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
