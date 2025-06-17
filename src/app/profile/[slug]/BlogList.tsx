"use client"

import { useEffect, useState } from "react";

interface Blog {
    _id: string;
    title: string;
    content: string;
    author: string;
    createdAt: string;
}

export default function BlogList({ slug }: { slug: string }) {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/blogs/${slug}`)
            .then(res => res.json())
            .then(data => {
                setBlogs(data);
                setLoading(false);
            });
    }, [slug]);

    if (loading) return <div>Loading blogs...</div>;
    if (!blogs.length) return <div>No blogs found for this institution.</div>;

    return (
        <div className="mt-10">
            <h2 className="text-xl font-bold mb-4">Latest Blogs</h2>
            <div className="space-y-6">
                {blogs.map(blog => (
                    <div key={blog._id} className="p-4 bg-white rounded shadow">
                        <h3 className="text-lg font-semibold mb-1">{blog.title}</h3>
                        <div className="text-gray-600 text-sm mb-2">By {blog.author} on {new Date(blog.createdAt).toLocaleDateString()}</div>
                        <div className="text-gray-800 line-clamp-3 mb-2">{blog.content.slice(0, 200)}...</div>
                        {/* Optionally, link to a full blog page */}
                    </div>
                ))}
            </div>
        </div>
    );
} 