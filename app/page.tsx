"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession()

      if (data.session) {
        router.replace("/dashboard")
      } else {
        router.replace("/login")
      }
    }

    check()
  }, [router])

return (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-zinc-500 animate-pulse text-sm tracking-wide">
      Loading...
    </div>
  </div>
)
}