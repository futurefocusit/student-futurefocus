"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateBlogPage() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [author, setAuthor] = useState("");
    const [institutionSlug, setInstitutionSlug] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            const res = await fetch("/api/blogs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content, author, institutionSlug }),
            });
            if (res.ok) {
                setMessage("Blog created successfully!");
                setTitle("");
                setContent("");
                setAuthor("");
                setInstitutionSlug("");
                setTimeout(() => router.push("/blogs"), 1500);
            } else {
                const data = await res.json();
                setMessage(data.message || "Failed to create blog.");
            }
        } catch (err) {
            setMessage("An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto py-12">
            <h1 className="text-2xl font-bold mb-6">Create Blog</h1>
            <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
                <div>
                    <label className="block font-medium mb-1">Title</label>
                    <input
                        className="w-full border px-3 py-2 rounded"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block font-medium mb-1">Content</label>
                    <textarea
                        className="w-full border px-3 py-2 rounded min-h-[120px]"
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block font-medium mb-1">Author</label>
                    <input
                        className="w-full border px-3 py-2 rounded"
                        value={author}
                        onChange={e => setAuthor(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block font-medium mb-1">Institution Slug</label>
                    <input
                        className="w-full border px-3 py-2 rounded"
                        value={institutionSlug}
                        onChange={e => setInstitutionSlug(e.target.value)}
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
                    disabled={loading}
                >
                    {loading ? "Creating..." : "Create Blog"}
                </button>
                {message && <div className="mt-2 text-center text-sm text-blue-700">{message}</div>}
            </form>
        </div>
    );
} 