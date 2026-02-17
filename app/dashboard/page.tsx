"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

export default function Dashboard() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [adding, setAdding] = useState(false)

  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)

 
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()

      if (!data.session) {
        router.replace("/login")
        return
      }

      setUser(data.session.user)
      await fetchBookmarks()
      setLoading(false)
    }

    init()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "SIGNED_OUT") {
          router.replace("/login")
        }
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [router])



  const fetchBookmarks = async () => {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .order("created_at", { ascending: false })

    if (data) {
      setBookmarks(data)
    }
  }

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "bookmarks-sync") {
        fetchBookmarks()
      }
    }

    window.addEventListener("storage", handleStorage)

    return () => {
      window.removeEventListener("storage", handleStorage)
    }
  }, [])


  useEffect(() => {
    const handleFocus = () => fetchBookmarks()

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchBookmarks()
      }
    }

    window.addEventListener("focus", handleFocus)
    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      window.removeEventListener("focus", handleFocus)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [])


  const handleAddBookmark = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()
    if (!user) return

    const trimmedTitle = title.trim()
    const trimmedUrl = url.trim()

    if (!trimmedTitle || !trimmedUrl) {
      e.currentTarget.reportValidity()
      return
    }

    setAdding(true)

    const { data, error } = await supabase
      .from("bookmarks")
      .insert([
        {
          title: trimmedTitle,
          url: trimmedUrl,
          user_id: user.id,
        },
      ])
      .select()
      .single()

    setAdding(false)

    if (error) {
      console.error(error)
      return
    }

    if (data) {
      setBookmarks((prev) => {
        if (prev.some((b) => b.id === data.id)) return prev
        return [data, ...prev]
      })
    }

    localStorage.setItem("bookmarks-sync", Date.now().toString())

    setTitle("")
    setUrl("")
  }


  const handleDelete = async (id: string) => {
    setDeletingId(id)

    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", id)

    if (error) {
      console.error(error)
      setDeletingId(null)
      return
    }

    setBookmarks((prev) => prev.filter((b) => b.id !== id))
    setDeletingId(null)

    localStorage.setItem("bookmarks-sync", Date.now().toString())
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="p-6 text-zinc-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto p-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-semibold">Dashboard</h1>
            <p className="text-zinc-400 text-sm mt-1">
              Logged in as {user?.email}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="text-sm px-4 py-2 border cursor-pointer border-zinc-700 rounded-lg hover:bg-zinc-800 transition"
          >
            Logout
          </button>
        </div>

        {/* Add Bookmark */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg mb-12">
          <h2 className="text-lg font-medium mb-6 text-zinc-200">
            Add New Bookmark
          </h2>

          <form onSubmit={handleAddBookmark} className="space-y-5">
            <input
              type="text"
              placeholder="Bookmark Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              pattern=".*\S.*"
              title="Title cannot be empty or spaces only"
              className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30"
              required
            />

            <input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30"
              required
            />

            <button
              type="submit"
              disabled={adding}
              className="w-full bg-white cursor-pointer text-black py-3 rounded-lg font-medium hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
            >
              {adding ? "Adding..." : "Add Bookmark"}
            </button>
          </form>
        </div>

        {/* Bookmarks */}
        <div>
          <h2 className="text-xl font-semibold mb-6 text-zinc-300">
            Your Bookmarks
          </h2>

          {bookmarks.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl text-center text-zinc-500 shadow">
              No bookmarks yet.
            </div>
          ) : (
            <AnimatePresence>
              <div className="space-y-4 w-full">
                {bookmarks.map((bookmark) => (
                  <motion.div
                    key={bookmark.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="w-full bg-zinc-900 border border-zinc-800 p-5 rounded-2xl hover:border-zinc-600 transition-all duration-200 flex items-start justify-between gap-4 overflow-hidden"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">
                        {bookmark.title}
                      </p>

                      <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:underline break-words"
                      >
                        {bookmark.url}
                      </a>
                    </div>

                    <button
                      onClick={() => handleDelete(bookmark.id)}
                      disabled={deletingId === bookmark.id}
                      className="shrink-0 text-sm cursor-pointer text-red-400 hover:text-red-500 transition disabled:opacity-50"
                    >
                      {deletingId === bookmark.id ? "Deleting..." : "Delete"}
                    </button>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  )
}