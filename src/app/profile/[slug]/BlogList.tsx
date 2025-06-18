"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import { ArrowRight, Calendar, FileText, BookOpen, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type BlogPost = {
  _id: string
  title: string
  excerpt: string
  content: string
  date: string
  readTime: string
  author: string
  tags: string[]
  image: string
  createdAt: string
  updatedAt: string
}

export default function BlogList({ slug }: { slug: string }) {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);

  const getBlogPosts = async (): Promise<BlogPost[]> => {
    try {
      setLoading(true)
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/blogs/slug${slug}/?limit=2&sort=-createdAt`)
      setBlogs(data.data)
    } catch (error) {
      console.error("Error fetching blog posts:", error)
      return []
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getBlogPosts()
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-800" />
            </div>
            Recent Blog Posts
          </h3>
        </div>
        <div className="px-6 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-yellow-400 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
              <p className="text-blue-800 font-medium text-lg">Loading blog posts...</p>
              <div className="mt-4 w-32 h-1 bg-gradient-to-r from-blue-500 to-yellow-400 rounded-full mx-auto animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!blogs.length) {
    return (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-800" />
            </div>
            Recent Blog Posts
          </h3>
        </div>
        <div className="px-6 py-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full mx-auto mb-6 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Blog Posts Yet</h3>
            <p className="text-gray-500">This institution hasn`&apos;t published any blog posts yet.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-800" />
            </div>
            Recent Blog Posts
          </h3>
          <Button variant="ghost" size="sm" asChild className="text-white  hover:text-yellow-200 hover:bg-white/10">
            <Link href={`/blogs/slug/${slug}`} className="flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
      <div className="px-6 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          {blogs.map((post) => (
            <Card key={post._id} className="flex flex-col h-full overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300">
              {post.image && (
                <div className="relative h-48">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span>
                    {new Date(post.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span>•</span>
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span>{"5 min read"}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 leading-tight">{post.title}</h3>
                <p className="text-gray-600 flex-1 leading-relaxed">{post.excerpt}</p>
                <div className="flex items-center justify-between pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-fit text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                    asChild
                  >
                    <Link href={`/blog/${post._id}`}>Read More</Link>
                  </Button>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {post.tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                      {post.tags.length > 2 && (
                        <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-medium">
                          +{post.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
} 