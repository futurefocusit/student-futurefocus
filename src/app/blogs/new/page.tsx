"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

import { Loader2, ArrowLeft, Plus, X, Upload } from "lucide-react"

import axios from "axios"
import { useToast } from "@/components/ui/use-toast"
import BlogEditor from "@/components/Editor"
import SideBar from "@/components/SideBar"

export default function NewBlogPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    tags: [] as string[],
    image: "",
    published: false,
  })
  const [tagInput, setTagInput] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleContentChange = (content: string) => {
    setFormData((prev) => ({ ...prev, content }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, published: checked }))
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }))
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    setUploadingImage(true)

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/upload/file`, formData, {

        headers: {
          "Authorization": `Bearer ${localStorage.getItem("ffa-admin")}`
        }
      })

      const { data } = res
      setFormData((prev) => ({ ...prev, image: data.url }))

      toast({
        title: "Image Uploaded",
        description: "Your image has been uploaded successfully",
      })
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      })
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.excerpt || !formData.content) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (formData.tags.length === 0) {
      toast({
        title: "Missing Tags",
        description: "Please add at least one tag",
        variant: "destructive",
      })
      return
    }

    if (!formData.image) {
      toast({
        title: "Missing Image",
        description: "Please upload a featured image",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/blogs`, formData, {

        headers: {
          "Authorization": `Bearer ${localStorage.getItem("ffa-admin")}`
        }
      })

      const { data } = res

      toast({
        title: "Blog Created",
        description: "Your blog has been created successfully",
      })

      router.push("/blogs")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create blog",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <SideBar />
      <div className="flex-1 max-w-4xl mx-auto  overflow-x-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" className="mr-2" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">New Blog</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-2">
              <Switch id="published" checked={formData.published} onCheckedChange={handleSwitchChange} />
              <Label htmlFor="published">{formData.published ? "Published" : "Draft"}</Label>
            </div>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? "Creating..." : "Create Blog"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Enter blog title"
                      value={formData.title}
                      onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      name="excerpt"
                      placeholder="Enter a short excerpt"
                      value={formData.excerpt}
                      onChange={handleChange}
                      rows={3} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Label>Content</Label>
                <div className="mt-2 prose-container border rounded-md">
                  <BlogEditor initialContent="" onChange={handleContentChange} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Featured Image</Label>
                    {formData.image ? (
                      <div className="relative aspect-video rounded-md overflow-hidden">
                        <img
                          src={formData.image || "/placeholder.svg"}
                          alt="Featured"
                          className="object-cover w-full h-full" />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => setFormData((prev) => ({ ...prev, image: "" }))}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-6">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">Drag and drop or click to upload</p>
                        <Button asChild disabled={uploadingImage}>
                          <label>
                            {uploadingImage ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                              </>
                            ) : (
                              "Upload Image"
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageUpload}
                              disabled={uploadingImage} />
                          </label>
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.tags.map((tag) => (
                        <div
                          key={tag}
                          className="flex items-center bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                        >
                          {tag}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 ml-1"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a tag"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleAddTag()
                          }
                        }} />
                      <Button type="button" onClick={handleAddTag} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
