"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Loader2, MoreHorizontal, Plus, Search, Eye, Pencil, Trash2, CheckCircle, XCircle } from "lucide-react"
import { format } from "date-fns"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import axios from "axios"
import { useToast } from "@/components/ui/use-toast"
import SideBar from "@/components/SideBar"

export default function BlogsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [blogToDelete, setBlogToDelete] = useState<string | null>(null)
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)
  const [blogToPublish, setBlogToPublish] = useState(null)

  useEffect(() => {
    fetchBlogs()
  }, [])

  const fetchBlogs = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/blogs`, {

        headers: {
          "Authorization": `Bearer ${localStorage.getItem("ffa-admin")}`
        }
      })

      const { data } = res
      setBlogs(data.data)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load blogs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (id: string) => {
    setBlogToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handlePublishClick = (blog) => {
    setBlogToPublish(blog)
    setPublishDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!blogToDelete) return

    try {
      const res = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${blogToDelete}`, {

        headers: {
          "Authorization": `Bearer ${localStorage.getItem("ffa-admin")}`
        }
      })



      toast({
        title: "Blog Deleted",
        description: "The blog has been successfully deleted",
      })

      // Remove from state
      setBlogs(blogs.filter((blog) => blog._id !== blogToDelete))
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete blog",
        variant: "destructive",
      })
    } finally {
      setBlogToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const handlePublish = async () => {
    if (!blogToPublish) return

    try {
      const res = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${blogToPublish._id}`,{published:!blogToPublish.published}, {

        headers: {
          "Authorization": `Bearer ${localStorage.getItem("ffa-admin")}`
        }

      })



      const data = await res.data
      toast({
        title: blogToPublish.published ? "Blog Unpublished" : "Blog Published",
        description: `The blog has been ${blogToPublish.published ? "unpublished" : "published"} successfully`,
      })

      // Update in state
      setBlogs(blogs.map((blog) => (blog._id === blogToPublish._id ? { ...blog, published: !blog.published } : blog)))
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update blog",
        variant: "destructive",
      })
    } finally {
      setBlogToPublish(null)
      setPublishDialogOpen(false)
    }
  }

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <SideBar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading blogs...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <SideBar />
      <div className="flex-1 max-w-4xl mx-auto overflow-x-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Blogs</h1>
          <Button asChild>
            <Link href="/blogs/new">
              <Plus className="mr-2 h-4 w-4" /> New Blog
            </Link>
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search blogs by title or tag..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        {filteredBlogs.length === 0 ? (
          <div className="flex h-[400px] w-full flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
            <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
              <h3 className="mt-4 text-lg font-semibold">No blogs found</h3>
              <p className="mb-4 mt-2 text-sm text-muted-foreground">
                {searchTerm
                  ? `No blogs match "${searchTerm}". Try a different search term.`
                  : "You haven't created any blogs yet. Create one to get started."}
              </p>
              {!searchTerm && (
                <Button asChild>
                  <Link href="/blogs/new">
                    <Plus className="mr-2 h-4 w-4" /> New Blog
                  </Link>
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBlogs.map((blog) => (
                  <TableRow key={blog._id}>
                    <TableCell className="font-medium">{blog.title}</TableCell>
                    <TableCell>
                      {blog.published ? (
                        <Badge className="bg-green-500 hover:bg-green-600">
                          <CheckCircle className="mr-1 h-3 w-3" /> Published
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <XCircle className="mr-1 h-3 w-3" /> Draft
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {blog.tags.slice(0, 3).map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="mr-1">
                            {tag}
                          </Badge>
                        ))}
                        {blog.tags.length > 3 && <Badge variant="outline">+{blog.tags.length - 3}</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {blog.publishedAt
                        ? format(new Date(blog.publishedAt), "MMM d, yyyy")
                        : format(new Date(blog.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu >
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          {/* <DropdownMenuItem onClick={() => router.push(`/blog/${blog.slug || blog._id}`)}>
                            <Eye className="mr-2 h-4 w-4" /> View
                          </DropdownMenuItem> */}
                          <DropdownMenuItem onClick={() => router.push(`/blogs/edit/${blog._id}`)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePublishClick(blog)}>
                            {blog.published ? (
                              <>
                                <XCircle className="mr-2 h-4 w-4" /> Unpublish
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" /> Publish
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteClick(blog._id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the blog and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Publish/Unpublish Confirmation Dialog */}
        <AlertDialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen} >
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle>{blogToPublish?.published ? "Unpublish Blog?" : "Publish Blog?"}</AlertDialogTitle>
              <AlertDialogDescription>
                {blogToPublish?.published
                  ? "This blog will no longer be visible to the public."
                  : "This blog will be visible to the public."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handlePublish}>
                {blogToPublish?.published ? "Unpublish" : "Publish"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
