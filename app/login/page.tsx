"use client"

import { supabase } from "@/lib/supabaseClient"
import { useEffect } from "react"
import { useRouter } from "next/navigation"


export default function LoginPage() {
    const router = useRouter()

     useEffect(() => {
        const checkSession = async () => {
        const { data } = await supabase.auth.getSession()
        if (data.session) {
            router.replace("/dashboard")
        }
        }

        checkSession()
    }, [router])

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })
  }

  return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 via-black to-zinc-900">
    <div className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-800 p-10 rounded-2xl shadow-2xl w-[400px] text-center transition-all duration-300 hover:shadow-black/40">

      <h1 className="text-3xl font-semibold text-white mb-2">
        Bookmark Manager
      </h1>

      <p className="text-zinc-400 mb-8">
        Organize your favorite links
      </p>

      <button
        onClick={handleLogin}
        className="flex items-center justify-center gap-3 w-full bg-white cursor-pointer text-black py-3 rounded-lg font-medium hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
      >
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="Google"
          className="w-5 h-5"
        />
        Continue with Google
      </button>

    </div>
  </div>
)
}