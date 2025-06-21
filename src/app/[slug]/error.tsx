"use client"

import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md p-6 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
        <p className="text-gray-700 mb-6">We couldn&apos;t load the company profile. Please try again later.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => reset()} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Try again
          </button>
          <a href="/" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
            Return to Home
          </a>
        </div>
      </div>
    </div>
  )
}
