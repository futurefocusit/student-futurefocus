"use client"

import { useRef, useState } from "react"
import { Editor } from "@tinymce/tinymce-react"

interface BlogEditorProps {
  initialContent: string
  onChange: (content: string) => void
}

export default function BlogEditor({ initialContent, onChange }: BlogEditorProps) {
  const editorRef = useRef(null)
  const [content, setContent] = useState(initialContent)
  const handleEditorChange = (newContent: string) => {
    setContent(newContent)
    onChange(newContent)
  }

  return (
    <Editor
      apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
      onInit={(evt, editor) => {
        editorRef.current = editor
      }}
      value={content||initialContent}
      init={{
        height: 500,
        menubar: true,
        plugins: [
          "advlist",
          "autolink",
          "lists",
          "link",
          "image",
          "charmap",
          "preview",
          "anchor",
          "searchreplace",
          "visualblocks",
          "code",
          "fullscreen",
          "insertdatetime",
          "media",
          "table",
          "code",
          "help",
          "wordcount",
        ],
        toolbar:
          "undo redo | blocks | " +
          "bold italic forecolor | alignleft aligncenter " +
          "alignright alignjustify | bullist numlist outdent indent | " +
          "removeformat | help",
        content_style:
          "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px }",
        setup: (editor) => {
          editor.on('init', () => {
            editor.focus()
          })
        }
      }}
      onEditorChange={handleEditorChange}
    />
  )
}
